import { apiError, apiSuccess } from "@/lib/apiResponse";
import { fetchTopCoins } from "@/lib/coingecko";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coins = await fetchTopCoins(48, process.env.COINGECKO_API_KEY);
    return apiSuccess(
      { coins, updatedAt: Date.now() },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=90" } }
    );
  } catch {
    return apiError("Market refresh unavailable", 503, "MARKET_DATA_UNAVAILABLE");
  }
}
