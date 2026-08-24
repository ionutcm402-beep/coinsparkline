import { fetchTopCoins, fetchPriceHistory } from "./coingecko";
import { fitRegime } from "./regimeModel";
import { coinCategory } from "./categories";
import { Coin } from "@/types/coin";

type CoinMeta = Awaited<ReturnType<typeof fetchTopCoins>>[number];

async function scanMetaList(metaList: CoinMeta[], days: number, apiKey?: string): Promise<Coin[]> {
  const results: Coin[] = [];
  for (const meta of metaList) {
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
        marketCapRank: meta.market_cap_rank,
        recentStates: fit.hiddenStates.slice(-30),
      });
    } catch {
      continue;
    }
  }
  results.sort((a, b) => (a.marketCapRank ?? 999999) - (b.marketCapRank ?? 999999));
  return results;
}

export async function runScan(
  n: number,
  days: number,
  apiKey?: string,
  offset = 0,
  limit = n
): Promise<Coin[]> {
  const coinMetaList = await fetchTopCoins(n, apiKey);
  const batch = coinMetaList.slice(offset, Math.min(offset + limit, coinMetaList.length));
  return scanMetaList(batch, days, apiKey);
}

export async function runScanForIds(
  n: number,
  days: number,
  coinIds: string[],
  apiKey?: string
): Promise<Coin[]> {
  if (!coinIds.length) return [];
  const wanted = new Set(coinIds);
  const coinMetaList = await fetchTopCoins(n, apiKey);
  const selected = coinMetaList.filter((coin) => wanted.has(coin.id));
  return scanMetaList(selected, days, apiKey);
}
