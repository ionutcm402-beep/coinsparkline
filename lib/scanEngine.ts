import { fetchTopCoins, fetchPriceHistory } from "./coingecko";
import { fitRegime } from "./regimeModel";
import { coinCategory } from "./categories";
import { Coin } from "@/types/coin";

export async function runScan(n: number, days: number, apiKey?: string): Promise<Coin[]> {
  const coinMetaList = await fetchTopCoins(n, apiKey);
  const results: Coin[] = [];

  for (const meta of coinMetaList) {
    try {
      const history = await fetchPriceHistory(meta.id, days, apiKey);
      const fit = fitRegime(history.map((h) => ({ date: h.date, close: h.close })));
      if (!fit) continue;

      results.push({
        id: meta.id,
        symbol: (meta.symbol || "").toUpperCase(),
        name: meta.name,
        category: coinCategory(meta.id),
        price: fit.closes[fit.closes.length - 1],
        change24hPct: meta.price_change_percentage_24h ?? 0,
        regimeState: fit.currentState === 0 ? "calm" : "volatile",
        confidencePct: Math.round(fit.confidence * 1000) / 10,
        streakDays: fit.streakDays,
        medianDaysToFlip: Math.round(fit.medianDaysToFlip * 10) / 10,
        logoUrl: meta.image,
        marketCap: meta.market_cap,
        recentStates: fit.hiddenStates.slice(-30),
      });
    } catch {
      // Skip coins that fail to fetch/fit -- one bad coin shouldn't kill the whole scan.
      continue;
    }
  }

  // Sort by theoretical days-to-flip ascending, same as the Python version:
  // whichever coin is closest to changing regime (calm or volatile) surfaces first.
  results.sort((a, b) => a.medianDaysToFlip - b.medianDaysToFlip);

  return results;
}
