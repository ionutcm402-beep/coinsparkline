import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { runScan } from "@/lib/scanEngine";
import { getLatestScan, saveScanSnapshot } from "@/lib/blobStorage";
import { evaluateAlerts } from "@/lib/alertEngine";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const providedSecret = authHeader?.replace("Bearer ", "") || querySecret;
  if (process.env.CRON_SECRET && providedSecret !== process.env.CRON_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const requested = Number(request.nextUrl.searchParams.get("n") || 30);
    const n = Math.max(30, Math.min(requested, 60));
    const days = Math.max(120, Math.min(Number(request.nextUrl.searchParams.get("days") || 365), 730));
    const previous = await getLatestScan();
    const coins = await runScan(n, days, process.env.COINGECKO_API_KEY);
    if (coins.length === 0) return NextResponse.json({ error: "Scan returned no coins" }, { status: 500 });
    const scannedAt = new Date().toISOString();
    await saveScanSnapshot({ coins, scannedAt });
    let alerts={checked:0,triggered:0,sent:0,configured:false};
    try { alerts = await evaluateAlerts(coins, previous?.coins ?? []); } catch (err) { console.error("Alert evaluation failed", err); }
    revalidatePath("/"); revalidatePath("/radar"); revalidatePath("/alerts");
    return NextResponse.json({success:true,scannedAt,coinCount:coins.length,requested:n,days,alerts,durationMs:Date.now()-startedAt});
  } catch (err) {
    return NextResponse.json({error:err instanceof Error?err.message:"Unknown error",durationMs:Date.now()-startedAt},{status:500});
  }
}
