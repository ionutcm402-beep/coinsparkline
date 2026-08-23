import { NextRequest, NextResponse } from "next/server";
import { runScan } from "@/lib/scanEngine";
import { saveScanSnapshot } from "@/lib/blobStorage";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const providedSecret = authHeader?.replace("Bearer ", "") || querySecret;
  if (process.env.CRON_SECRET && providedSecret !== process.env.CRON_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const requested = Number(request.nextUrl.searchParams.get("n") || 200);
    const n = Math.max(30, Math.min(requested, 500));
    const days = Number(request.nextUrl.searchParams.get("days") || 365);
    const apiKey = process.env.COINGECKO_API_KEY;
    const coins = await runScan(n, days, apiKey);
    if (coins.length === 0) return NextResponse.json({ error: "Scan returned no coins" }, { status: 500 });
    await saveScanSnapshot({ coins, scannedAt: new Date().toISOString() });
    return NextResponse.json({ success: true, coinCount: coins.length, requested: n });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
