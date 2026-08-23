import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { runScan } from "@/lib/scanEngine";
import { getLatestScan, saveScanSnapshot } from "@/lib/blobStorage";
import { evaluateAndDeliverAlerts } from "@/lib/alertEngine";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const providedSecret = authHeader?.replace("Bearer ", "") || querySecret;
  if (process.env.CRON_SECRET && providedSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const total = Math.max(30, Math.min(Number(request.nextUrl.searchParams.get("total") || 200), 200));
    const batchSize = Math.max(10, Math.min(Number(request.nextUrl.searchParams.get("batch") || 30), 40));
    const requestedOffset = Number(request.nextUrl.searchParams.get("offset") || 0);
    const offset = Math.max(0, Math.min(requestedOffset, Math.max(0, total - 1)));
    const days = Math.max(120, Math.min(Number(request.nextUrl.searchParams.get("days") || 365), 730));
    const apiKey = process.env.COINGECKO_API_KEY;

    const refreshed = await runScan(total, days, apiKey, offset, batchSize);
    if (refreshed.length === 0) return NextResponse.json({ error: "Scan returned no coins" }, { status: 500 });

    const current = await getLatestScan();
    const merged = new Map((current?.coins ?? []).map((coin) => [coin.id, coin] as const));
    for (const coin of refreshed) merged.set(coin.id, coin);

    const coins = Array.from(merged.values())
      .sort((a, b) => (a.marketCapRank ?? 999999) - (b.marketCapRank ?? 999999))
      .slice(0, total);

    const scannedAt = new Date().toISOString();
    await saveScanSnapshot({ coins, scannedAt });

    let alertResult: Awaited<ReturnType<typeof evaluateAndDeliverAlerts>> | null = null;
    try {
      alertResult = await evaluateAndDeliverAlerts(coins, current?.coins ?? []);
    } catch (alertError) {
      alertResult = { evaluated: false, reason: alertError instanceof Error ? alertError.message : "Alert evaluation failed", events: 0, emails: 0 };
    }

    revalidatePath("/");
    revalidatePath("/alerts");

    return NextResponse.json({
      success: true,
      scannedAt,
      coinCount: coins.length,
      refreshedCount: refreshed.length,
      totalTarget: total,
      offset,
      batchSize,
      days,
      alerts: alertResult,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Unknown error",
      durationMs: Date.now() - startedAt,
    }, { status: 500 });
  }
}
