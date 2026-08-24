// Port of regime_scanner.py's CoinGecko fetching functions.

const MARKETS_URL = "https://api.coingecko.com/api/v3/coins/markets";
const CHART_URL = (id: string) => `https://api.coingecko.com/api/v3/coins/${id}/market_chart`;
const DETAIL_URL = (id: string) => `https://api.coingecko.com/api/v3/coins/${id}`;
const SEARCH_URL = "https://api.coingecko.com/api/v3/search";

export interface CoinMeta {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
  current_price: number;
  image: string;
  price_change_percentage_24h: number | null;
  market_cap: number | null;
  ath: number | null;
  ath_date: string | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
}

function apiHeaders(apiKey?: string): HeadersInit {
  return apiKey ? { "x-cg-demo-api-key": apiKey } : {};
}

async function fetchWithRetry(url: string, apiKey?: string, maxRetries = 4, baseWait = 8000): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch(url, { headers: apiHeaders(apiKey) });
    if (resp.status !== 429) {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText} for ${url}`);
      return resp;
    }
    if (attempt < maxRetries) {
      const retryAfter = resp.headers.get("Retry-After");
      const wait = retryAfter ? parseFloat(retryAfter) * 1000 : baseWait * 2 ** attempt;
      await new Promise((r) => setTimeout(r, wait));
    } else {
      throw new Error(`Rate limited (429) after ${maxRetries} retries: ${url}`);
    }
  }
  throw new Error("unreachable");
}

export async function fetchTopCoins(n: number, apiKey?: string): Promise<CoinMeta[]> {
  const perPage = 100;
  const pagesNeeded = Math.ceil(n / perPage);
  const coins: CoinMeta[] = [];

  for (let page = 1; page <= pagesNeeded; page++) {
    const params = new URLSearchParams({
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: String(Math.min(perPage, n - coins.length)),
      page: String(page),
      sparkline: "false",
    });
    const resp = await fetchWithRetry(`${MARKETS_URL}?${params}`, apiKey);
    const data: CoinMeta[] = await resp.json();
    coins.push(...data);
    if (coins.length >= n) break;
  }
  return coins.slice(0, n);
}

export async function fetchPriceHistory(
  coinId: string,
  days: number,
  apiKey?: string
): Promise<{ date: string; close: number }[]> {
  const params = new URLSearchParams({ vs_currency: "usd", days: String(days) });
  const resp = await fetchWithRetry(`${CHART_URL(coinId)}?${params}`, apiKey);
  const data = await resp.json();
  const prices: [number, number][] = data.prices || [];
  return prices.map(([ts, close]) => ({ date: new Date(ts).toISOString(), close }));
}

export interface PurchaseMarket {
  name: string;
  pair: string;
  url: string | null;
}

export interface CoinDetails {
  symbol: string;
  description: string;
  homepage: string | null;
  imageUrl: string | null;
  currentPrice: number | null;
  marketCap: number | null;
  ath: number | null;
  athDate: string | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  maxSupply: number | null;
  platforms: string[];
  purchaseMarkets: PurchaseMarket[];
}

export async function fetchCoinDetails(coinId: string, apiKey?: string): Promise<CoinDetails | null> {
  try {
    const params = new URLSearchParams({
      localization: "false",
      tickers: "true",
      community_data: "false",
      developer_data: "false",
      sparkline: "false",
      market_data: "true",
    });
    const resp = await fetchWithRetry(`${DETAIL_URL(coinId)}?${params}`, apiKey);
    const data = await resp.json();
    const md = data.market_data || {};
    let description: string = data.description?.en || "";
    if (description.length > 600) {
      const cut = description.slice(0, 600);
      description = cut.slice(0, cut.lastIndexOf(".") + 1) || cut;
    }
    const homepageList: string[] = data.links?.homepage || [];
    const homepage = homepageList.find((h) => h) || null;

    const tickerRows = Array.isArray(data.tickers) ? data.tickers : [];
    const seenMarkets = new Set<string>();
    const purchaseMarkets: PurchaseMarket[] = tickerRows
      .filter((t: any) => !t?.is_anomaly && !t?.is_stale && t?.market?.name)
      .sort((a: any, b: any) => (b?.converted_volume?.usd || 0) - (a?.converted_volume?.usd || 0))
      .reduce((acc: PurchaseMarket[], t: any) => {
        const name = String(t.market.name);
        if (seenMarkets.has(name) || acc.length >= 6) return acc;
        seenMarkets.add(name);
        acc.push({
          name,
          pair: `${String(t.base || data.symbol || "").toUpperCase()}/${String(t.target || "").toUpperCase()}`,
          url: typeof t.trade_url === "string" && t.trade_url.startsWith("http") ? t.trade_url : null,
        });
        return acc;
      }, []);

    const platforms = Object.keys(data.platforms || {}).filter((p) => p && p !== "native");

    return {
      symbol: (data.symbol || coinId.slice(0, 5)).toUpperCase(),
      description,
      homepage,
      imageUrl: data.image?.large || data.image?.small || data.image?.thumb || null,
      currentPrice: md.current_price?.usd ?? null,
      marketCap: md.market_cap?.usd ?? null,
      ath: md.ath?.usd ?? null,
      athDate: md.ath_date?.usd ?? null,
      circulatingSupply: md.circulating_supply ?? null,
      totalSupply: md.total_supply ?? null,
      maxSupply: md.max_supply ?? null,
      platforms,
      purchaseMarkets,
    };
  } catch {
    return null;
  }
}

export interface CoinSearchResult {
  id: string;
  symbol: string;
  name: string;
  marketCapRank: number | null;
  thumb: string | null;
}

export async function searchCoins(query: string, apiKey?: string, limit = 8): Promise<CoinSearchResult[]> {
  if (!query.trim()) return [];
  try {
    const params = new URLSearchParams({ query: query.trim() });
    const resp = await fetchWithRetry(`${SEARCH_URL}?${params}`, apiKey);
    const data = await resp.json();
    const coins = (data.coins || []).slice(0, limit);
    return coins.map((c: { id: string; symbol: string; name: string; market_cap_rank: number | null; thumb: string | null }) => ({
      id: c.id,
      symbol: (c.symbol || "").toUpperCase(),
      name: c.name,
      marketCapRank: c.market_cap_rank,
      thumb: c.thumb,
    }));
  } catch {
    return [];
  }
}
