import { NextResponse } from "next/server";
import { fetchTopCoins } from "@/lib/coingecko";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coins = await fetchTopCoins(48, process.env.COINGECKO_API_KEY);
    return NextResponse.json({ coins, updatedAt: Date.now() }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=90" } });
  } catch {
    return NextResponse.json({ error: "Market refresh unavailable" }, { status: 503 });
  }
}
