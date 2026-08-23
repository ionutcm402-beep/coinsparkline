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

const STATE_LABEL = (s: number) => (s === 0 ? "Calm" : "Volatile");
const STATE_COLOR = (s: number) => (s === 0 ? "text-blue-600" : "text-red-600");

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
  const moodBg = isCalm ? "bg-blue-50" : "bg-red-50";
  const moodText = isCalm ? "text-blue-700" : "text-red-700";
  const moodDot = isCalm ? "#4c6ef5" : "#d6336c";

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
  const lastChange = fit.transitions[0]; // most recent transition, if any

  return (
    <div className="flex-1">
      <Header />
      <main className="mx-auto max-w-[1240px] px-6 py-8">
        {/* Outer container matches the site-wide 1240px standard; the actual
            card content stays at a comfortable, balanced width nested and
            centered inside it, rather than stretching a single card the
            full page width (which would look sparse, not premium). */}
        <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          &larr; Back to all coins
        </Link>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
          {/* Compact top identity row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{displayName}</h1>
              <p className="text-sm text-gray-400">{category}</p>
            </div>
            <div className={`rounded-lg ${moodBg} px-3 py-1.5 text-center text-xs font-medium ${moodText}`}>
              {mood.toUpperCase()} &middot; {fit.streakDays}D STREAK
            </div>
          </div>

          <p className="mt-3 text-3xl font-semibold text-gray-900">
            ${fit.closes[fit.closes.length - 1].toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </p>

          {/* CURRENT REGIME -- the dominant element on the page */}
          <div className={`mt-5 rounded-xl ${moodBg} p-5`}>
            <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Current regime</p>
            <p className={`text-2xl font-bold ${moodText}`}>{mood.toUpperCase()}</p>

            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-cyan-50/80">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${(fit.confidence * 100).toFixed(0)}%`, backgroundColor: moodDot }}
                />
              </div>
              <span className={`text-sm font-medium ${moodText}`}>{(fit.confidence * 100).toFixed(0)}%</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Signal strength</p>

            {lastChange && (
              <p className="mt-3 text-sm text-gray-600">
                Last change:{" "}
                <span className={STATE_COLOR(lastChange.fromState)}>{STATE_LABEL(lastChange.fromState)}</span>
                {" -> "}
                <span className={STATE_COLOR(lastChange.toState)}>{STATE_LABEL(lastChange.toState)}</span>{" "}
                on {new Date(lastChange.date).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Chart */}
          <div className="mt-6">
            <RegimeChart points={chartPoints} />
          </div>

          {/* Regime statistics -- all real, derived numbers */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-400">Current streak</p>
              <p className="font-medium text-gray-900">{fit.streakDays} days</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Previous regime</p>
              <p className="font-medium text-gray-900">
                {fit.previousState !== null
                  ? `${STATE_LABEL(fit.previousState)}, ${fit.previousStreakDays}d`
                  : "No prior data"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Longest calm streak</p>
              <p className="font-medium text-gray-900">{fit.longestStreakByState[0]} days</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Longest volatile streak</p>
              <p className="font-medium text-gray-900">{fit.longestStreakByState[1]} days</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total regime changes</p>
              <p className="font-medium text-gray-900">{fit.transitions.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Median days to next flip</p>
              <p className="font-medium text-gray-900">{fit.medianDaysToFlip.toFixed(1)}</p>
            </div>
          </div>

          {/* Market data -- kept, but visually quieter/secondary now */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-400">Market cap</p>
              <p className="text-gray-600">{formatCompactNumber(marketCap, "$")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Circulating supply</p>
              <p className="text-gray-600">{formatCompactNumber(circSupply)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">All-time high</p>
              <p className="text-gray-600">{ath ? `$${ath.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Max supply</p>
              <p className="text-gray-600">{maxSupply ? formatCompactNumber(maxSupply) : "No cap"}</p>
            </div>
          </div>

          {/* Regime history -- real transition log */}
          {fit.transitions.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="mb-2 text-sm font-medium text-gray-700">🔄 Regime history</p>
              <ul className="space-y-1.5 text-sm">
                {fit.transitions.slice(0, 8).map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <span className="w-20 shrink-0 text-xs text-gray-400">
                      {new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className={STATE_COLOR(t.fromState)}>{STATE_LABEL(t.fromState)}</span>
                    <span className="text-gray-300">&rarr;</span>
                    <span className={STATE_COLOR(t.toState)}>{STATE_LABEL(t.toState)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-3">
            <a
              href={`https://www.coingecko.com/en/coins/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-200 px-4 py-2 text-center text-sm text-gray-700 transition-colors hover:border-brand-blue/40 hover:bg-brand-blue/5 hover:text-brand-blue"
            >
              View on CoinGecko ↗
            </a>
            {details?.homepage && (
              <a
                href={details.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-200 px-4 py-2 text-center text-sm text-gray-700 transition-colors hover:border-brand-blue/40 hover:bg-brand-blue/5 hover:text-brand-blue"
              >
                Official website ↗
              </a>
            )}
            <a
              href={`https://x.com/search?q=${xQuery}&src=typed_query&f=live`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-200 px-4 py-2 text-center text-sm text-gray-700 transition-colors hover:border-brand-blue/40 hover:bg-brand-blue/5 hover:text-brand-blue"
            >
              Search X ↗
            </a>
          </div>

          {/* About -- moved lower, secondary */}
          {details?.description && (
            <details className="mt-6 border-t border-gray-100 pt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">About this coin</summary>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{details.description}</p>
            </details>
          )}

          {/* News + Videos -- hidden entirely when empty, no dev-facing text */}
          {(news.length > 0 || videos.length > 0) && (
            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-100 pt-4 sm:grid-cols-2">
              {news.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Recent news</p>
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
                </div>
              )}

              {videos.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Top videos</p>
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
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
