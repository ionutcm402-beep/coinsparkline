import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { runScan, runScanForIds } from "@/lib/scanEngine";
import { getLatestScanFresh, saveScanSnapshot } from "@/lib/blobStorage";
import { evaluateAndDeliverAlerts } from "@/lib/alertEngine";
import { recordIntelligenceEvents } from "@/lib/intelligenceEvents";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const configuredSecret = process.env.CRON_SECRET;

  if (!configuredSecret) return NextResponse.json({ error: "Refresh endpoint is not configured" }, { status: 503 });
  if (!providedSecret || providedSecret !== configuredSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const total = Math.max(30, Math.min(Number(request.nextUrl.searchParams.get("total") || 200), 200));
    const batchSize = Math.max(10, Math.min(Number(request.nextUrl.searchParams.get("batch") || 24), 30));
    const requestedOffset = Number(request.nextUrl.searchParams.get("offset") || 0);
    const offset = Math.max(0, Math.min(requestedOffset, Math.max(0, total - 1)));
    const days = Math.max(120, Math.min(Number(request.nextUrl.searchParams.get("days") || 365), 730));
    const apiKey = process.env.COINGECKO_API_KEY;

    const refreshed = await runScan(total, days, apiKey, offset, batchSize);
    if (refreshed.length === 0) return NextResponse.json({ error: "Scan returned no coins" }, { status: 500 });
    const current = await getLatestScanFresh();

    let armedCoinIds: string[] = [];
    try {
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        const { data } = await supabase.from("alert_rules").select("coin_id").eq("enabled", true);
        armedCoinIds = Array.from(new Set((data ?? []).map((row) => String(row.coin_id))));
      }
    } catch { armedCoinIds = []; }

    const alreadyRefreshed = new Set(refreshed.map((coin) => coin.id));
    const targetedIds = armedCoinIds.filter((id) => !alreadyRefreshed.has(id)).slice(0, 5);
    const targeted = targetedIds.length ? await runScanForIds(total, days, targetedIds, apiKey) : [];
    const refreshedAll = [...refreshed, ...targeted];
    const merged = new Map((current?.coins ?? []).map((coin) => [coin.id, coin] as const));
    for (const coin of refreshedAll) merged.set(coin.id, coin);
    const coins = Array.from(merged.values()).sort((a, b) => (a.marketCapRank ?? 999999) - (b.marketCapRank ?? 999999)).slice(0, total);

    const scannedAt = new Date().toISOString();
    await saveScanSnapshot({ coins, scannedAt });
    revalidateTag("scan-snapshot", "max");

    let intelligence = {recorded:0,available:false};
    try { intelligence = await recordIntelligenceEvents(refreshedAll, current?.coins ?? []); } catch { intelligence = {recorded:0,available:false}; }

    let alertResult: Awaited<ReturnType<typeof evaluateAndDeliverAlerts>> | null = null;
    try { alertResult = await evaluateAndDeliverAlerts(coins, current?.coins ?? []); }
    catch (alertError) { alertResult = { evaluated: false, reason: alertError instanceof Error ? alertError.message : "Alert evaluation failed", events: 0, emails: 0 }; }

    revalidatePath("/");
    revalidatePath("/alerts");
    return NextResponse.json({ success:true, scannedAt, coinCount:coins.length, refreshedCount:refreshedAll.length, nextOffset:(offset+batchSize)%total, intelligence, alerts:alertResult, durationMs:Date.now()-startedAt });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Refresh failed" }, { status: 500 });
  }
}
