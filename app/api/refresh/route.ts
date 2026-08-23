import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { runScan } from "@/lib/scanEngine";
import { saveScanSnapshot } from "@/lib/blobStorage";

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
    // The behavioural model is intentionally focused on the tracked leaders.
    // Wider 200+ market coverage uses the lighter market endpoint on the homepage.
    // Keeping the signal scan at 30 avoids hundreds of historical API calls per refresh.
    const requested = Number(request.nextUrl.searchParams.get("n") || 30);
    const n = Math.max(30, Math.min(requested, 60));
    const days = Math.max(120, Math.min(Number(request.nextUrl.searchParams.get("days") || 365), 730));
    const apiKey = process.env.COINGECKO_API_KEY;
    const coins = await runScan(n, days, apiKey);
    if (coins.length === 0) return NextResponse.json({ error: "Scan returned no coins" }, { status: 500 });

    const scannedAt = new Date().toISOString();
    await saveScanSnapshot({ coins, scannedAt });
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      scannedAt,
      coinCount: coins.length,
      requested: n,
      days,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Unknown error",
      durationMs: Date.now() - startedAt,
    }, { status: 500 });
  }
}
