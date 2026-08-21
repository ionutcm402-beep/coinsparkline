import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import RegimeChart from "@/components/RegimeChart";
import { fetchPriceHistory, fetchCoinDetails } from "@/lib/coingecko";
import { fitRegime } from "@/lib/regimeModel";
import { coinCategory } from "@/lib/categories";
import { fetchCoinNews } from "@/lib/news";
import { fetchYoutubeVideos } from "@/lib/youtube";
import { formatCompactNumber } from "@/lib/format";

export const revalidate = 1800; // 30 min -- avoids hitting external APIs on every single visit

export default async function CoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [history, details] = await Promise.all([
    fetchPriceHistory(id, 365).catch(() => null),
    fetchCoinDetails(id).catch(() => null),
  ]);

  if (!history || history.length === 0) {
    notFound();
  }

  const fit = fitRegime(history.map((h) => ({ date: h.date, close: h.close })));
  if (!fit) {
    notFound();
  }

  const category = coinCategory(id);
  const isCalm = fit.currentState === 0;
  const mood = isCalm ? "Calm" : "Volatile";
  const moodBg = isCalm ? "bg-green-50" : "bg-red-50";
  const moodText = isCalm ? "text-green-700" : "text-red-700";

  const displayName = id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " ");
  const symbol = details?.symbol || id.slice(0, 5).toUpperCase();

  const [news, videos] = await Promise.all([
    fetchCoinNews(symbol),
    fetchYoutubeVideos(`${displayName} crypto`),
  ]);

  const chartPoints = fit.dates.map((date, i) => ({
    date,
    close: fit.closes[i],
    state: fit.hiddenStates[i],
  }));

  const marketCap = details?.marketCap;
  const ath = details?.ath;
  const circSupply = details?.circulatingSupply;
  const maxSupply = details?.maxSupply;

  const xQuery = displayName.replace(/ /g, "+");

  return (
    <div className="flex-1 bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          &larr; Back to all coins
        </Link>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
          {/* Hero header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{displayName}</h1>
              <p className="text-sm text-gray-400">{category}</p>
            </div>
            <div className={`rounded-lg ${moodBg} px-4 py-2 text-center text-sm font-medium ${moodText}`}>
              {mood}
              <div className="text-xs font-normal">{fit.streakDays} day streak</div>
            </div>
          </div>

          <p className="mt-4 text-2xl font-semibold text-gray-900">
            ${fit.closes[fit.closes.length - 1].toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </p>

          {/* Chart */}
          <div className="mt-4">
            <RegimeChart points={chartPoints} />
            <div className="mt-1 flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#4c6ef5]" /> Calm
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#d6336c]" /> Volatile
              </span>
            </div>
          </div>

          {/* Specs strip */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-400">Market cap</p>
              <p className="font-medium text-gray-900">{formatCompactNumber(marketCap, "$")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Circulating supply</p>
              <p className="font-medium text-gray-900">{formatCompactNumber(circSupply)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">All-time high</p>
              <p className="font-medium text-gray-900">{ath ? `$${ath.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Max supply</p>
              <p className="font-medium text-gray-900">{maxSupply ? formatCompactNumber(maxSupply) : "No cap"}</p>
            </div>
          </div>

          {/* Buy links */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <a
              href={`https://www.coingecko.com/en/coins/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-200 px-4 py-2 text-center text-sm text-gray-700 hover:border-gray-300"
            >
              View on CoinGecko ↗
            </a>
            {details?.homepage && (
              <a
                href={details.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-200 px-4 py-2 text-center text-sm text-gray-700 hover:border-gray-300"
              >
                Official website ↗
              </a>
            )}
            <a
              href={`https://x.com/search?q=${xQuery}&src=typed_query&f=live`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-200 px-4 py-2 text-center text-sm text-gray-700 hover:border-gray-300"
            >
              Search X ↗
            </a>
          </div>

          {/* Description */}
          {details?.description && (
            <details className="mt-6 border-t border-gray-100 pt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">About this coin</summary>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{details.description}</p>
            </details>
          )}

          {/* News + Videos */}
          <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-100 pt-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Recent news</p>
              {news.length === 0 ? (
                <p className="text-xs text-gray-400">No recent headlines found.</p>
              ) : (
                <ul className="space-y-3">
                  {news.map((article, i) => (
                    <li key={i}>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-700 hover:underline"
                      >
                        {article.title}
                      </a>
                      <p className="text-xs text-gray-400">
                        {article.source}
                        {article.publishedAt ? ` · ${new Date(article.publishedAt).toLocaleDateString()}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Top videos</p>
              {videos.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No videos available (add a YouTube API key to enable this).
                </p>
              ) : (
                <ul className="space-y-3">
                  {videos.map((video, i) => (
                    <li key={i} className="flex gap-3">
                      {video.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={video.thumbnail} alt="" className="h-12 w-20 rounded object-cover" />
                      )}
                      <div>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-700 hover:underline"
                        >
                          {video.title}
                        </a>
                        <p className="text-xs text-gray-400">{video.channel}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
