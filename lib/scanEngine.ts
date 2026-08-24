import { fetchTopCoins, fetchPriceHistory } from "./coingecko";
import { fitRegime } from "./regimeModel";
import { coinCategory } from "./categories";
import { Coin } from "@/types/coin";

type CoinMeta = Awaited<ReturnType<typeof fetchTopCoins>>[number];

const SCAN_CONCURRENCY = 3;

async function scanOne(meta: CoinMeta, days: number, apiKey?: string): Promise<Coin | null> {
  try {
    const history = await fetchPriceHistory(meta.id, days, apiKey);
    const fit = fitRegime(history.map((h) => ({ date: h.date, close: h.close })));
    if (!fit) return null;
    return {
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
    };
  } catch {
    return null;
  }
}

async function scanMetaList(metaList: CoinMeta[], days: number, apiKey?: string): Promise<Coin[]> {
  if (!metaList.length) return [];

  // A small worker pool cuts the refresh duration substantially without firing
  // an unbounded burst of CoinGecko history requests that could trigger rate limits.
  const results: Array<Coin | null> = new Array(metaList.length).fill(null);
  let cursor = 0;
  const workerCount = Math.min(SCAN_CONCURRENCY, metaList.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (true) {
        const index = cursor++;
        if (index >= metaList.length) return;
        results[index] = await scanOne(metaList[index], days, apiKey);
      }
    })
  );

  return results
    .filter((coin): coin is Coin => coin !== null)
    .sort((a, b) => (a.marketCapRank ?? 999999) - (b.marketCapRank ?? 999999));
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
