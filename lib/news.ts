// Port of fetch_coin_news from the Python prototype. Uses CryptoCompare's
// free news API (no key required). Returns [] on any failure -- news is a
// nice-to-have, never worth breaking the page over.

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string | null; // ISO string, or null if unavailable
}

const CRYPTOCOMPARE_NEWS_URL = "https://min-api.cryptocompare.com/data/v2/news/";

export async function fetchCoinNews(symbol: string, limit = 3): Promise<NewsArticle[]> {
  try {
    const params = new URLSearchParams({ lang: "EN", categories: symbol.toUpperCase() });
    const resp = await fetch(`${CRYPTOCOMPARE_NEWS_URL}?${params}`, {
      next: { revalidate: 1800 },
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    const articles = (data.Data || []).slice(0, limit);

    return articles.map(
      (a: { title: string; url: string; source?: string; source_info?: { name?: string }; published_on?: number }) => ({
        title: a.title,
        url: a.url,
        source: a.source_info?.name || a.source || "Unknown",
        publishedAt: a.published_on ? new Date(a.published_on * 1000).toISOString() : null,
      })
    );
  } catch {
    return [];
  }
}
