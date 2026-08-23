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

export const revalidate = 1800;

const STATE_LABEL = (s: number) => (s === 0 ? "Calm" : "Volatile");
const STATE_COLOR = (s: number) => (s === 0 ? "text-emerald-600" : "text-rose-600");
const STATE_DOT = (s: number) => (s === 0 ? "bg-emerald-500" : "bg-rose-500");

function ExternalIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M7 13 13.5 6.5M9 6.5h4.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionLink({ href, label, mark }: { href: string; label: string; mark: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-14 items-center justify-between rounded-2xl border border-slate-200/75 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-[0_8px_24px_rgba(20,35,75,0.035)] transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white hover:text-slate-950 hover:shadow-[0_14px_30px_rgba(20,35,75,0.08)]"
    >
      <span className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{mark}</span>{label}</span>
      <span className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"><ExternalIcon /></span>
    </a>
  );
}

export default async function CoinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [history, details] = await Promise.all([
    fetchPriceHistory(id, 365).catch(() => null),
    fetchCoinDetails(id).catch(() => null),
  ]);

  if (!history || history.length === 0) notFound();
  const fit = fitRegime(history.map((h) => ({ date: h.date, close: h.close })));
  if (!fit) notFound();

  const category = coinCategory(id);
  const isCalm = fit.currentState === 0;
  const mood = isCalm ? "Calm" : "Volatile";
  const moodBg = isCalm ? "bg-emerald-50/80" : "bg-rose-50/80";
  const moodText = isCalm ? "text-emerald-700" : "text-rose-700";
  const moodDot = isCalm ? "#16a05d" : "#cf3f6e";

  const displayName = id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " ");
  const symbol = details?.symbol || id.slice(0, 5).toUpperCase();
  const [news, videos] = await Promise.all([
    fetchCoinNews(symbol),
    fetchYoutubeVideos(`${displayName} crypto`),
  ]);

  const chartPoints = fit.dates.map((date, i) => ({ date, close: fit.closes[i], state: fit.hiddenStates[i] }));
  const marketCap = details?.marketCap;
  const ath = details?.ath;
  const circSupply = details?.circulatingSupply;
  const maxSupply = details?.maxSupply;
  const xQuery = displayName.replace(/ /g, "+");
  const youtubeQuery = encodeURIComponent(`${displayName} crypto`);
  const lastChange = fit.transitions[0];

  return (
    <div className="flex-1">
      <Header />
      <main className="mx-auto max-w-[1240px] px-5 py-7 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-white/70 hover:text-slate-900">← Market</Link>

          <section className="mt-4 overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/82 shadow-[0_24px_70px_rgba(32,48,90,0.07)] backdrop-blur">
            <div className="px-5 py-7 sm:px-8 sm:py-9">
              <div className="flex flex-col items-center text-center">
                {details?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={details.imageUrl} alt="" className="h-16 w-16 rounded-full object-contain shadow-[0_10px_28px_rgba(20,35,75,0.10)]" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">{symbol.slice(0, 4)}</div>
                )}
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{symbol} · {category}</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-4xl">{displayName}</h1>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl">${fit.closes[fit.closes.length - 1].toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                <div className={`mt-4 rounded-full ${moodBg} px-4 py-2 text-xs font-bold tracking-[0.08em] ${moodText}`}>{mood.toUpperCase()} · {fit.streakDays}D STREAK</div>
              </div>

              <div className={`mx-auto mt-7 max-w-3xl rounded-[22px] ${moodBg} p-5 sm:p-6`}>
                <div className="flex items-end justify-between gap-4">
                  <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Current regime</p><p className={`mt-1 text-2xl font-bold tracking-[-0.03em] ${moodText}`}>{mood.toUpperCase()}</p></div>
                  <span className={`text-lg font-semibold ${moodText}`}>{(fit.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/75"><div className="h-full rounded-full" style={{ width: `${(fit.confidence * 100).toFixed(0)}%`, backgroundColor: moodDot }} /></div>
                <p className="mt-2 text-xs text-slate-500">Signal strength</p>
                {lastChange && <p className="mt-4 text-sm text-slate-600">Last change: <span className={STATE_COLOR(lastChange.fromState)}>{STATE_LABEL(lastChange.fromState)}</span> → <span className={STATE_COLOR(lastChange.toState)}>{STATE_LABEL(lastChange.toState)}</span> · {new Date(lastChange.date).toLocaleDateString()}</p>}
              </div>

              <div className="mt-8"><RegimeChart points={chartPoints} /></div>

              <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-200/60 sm:grid-cols-3">
                {[
                  ["Current streak", `${fit.streakDays} days`],
                  ["Previous regime", fit.previousState !== null ? `${STATE_LABEL(fit.previousState)}, ${fit.previousStreakDays}d` : "No prior data"],
                  ["Longest calm streak", `${fit.longestStreakByState[0]} days`],
                  ["Longest volatile streak", `${fit.longestStreakByState[1]} days`],
                  ["Total regime changes", String(fit.transitions.length)],
                  ["Median days to next flip", fit.medianDaysToFlip.toFixed(1)],
                ].map(([label, value]) => <div key={label} className="bg-white px-4 py-4 sm:px-5"><p className="text-[11px] uppercase tracking-[0.1em] text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>)}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Market cap", formatCompactNumber(marketCap, "$")],
                  ["Circulating supply", formatCompactNumber(circSupply)],
                  ["All-time high", ath ? `$${ath.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : "—"],
                  ["Max supply", maxSupply ? formatCompactNumber(maxSupply) : "No cap"],
                ].map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50/80 px-4 py-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-medium text-slate-700">{value}</p></div>)}
              </div>

              {fit.transitions.length > 0 && (
                <section className="mt-9 border-t border-slate-200/70 pt-8">
                  <div className="text-center"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Signal timeline</p><h2 className="mt-1 text-2xl">Regime history</h2><p className="mt-2 text-sm text-slate-500">The most recent changes in market behaviour.</p></div>
                  <div className="mx-auto mt-6 max-w-2xl">
                    {fit.transitions.slice(0, 8).map((t, i) => (
                      <div key={i} className="relative grid grid-cols-[95px_18px_1fr] gap-3 pb-5 last:pb-0">
                        <span className="pt-0.5 text-right text-xs text-slate-400">{new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                        <div className="relative flex justify-center"><span className={`relative z-10 mt-1 h-2.5 w-2.5 rounded-full ${STATE_DOT(t.toState)} ring-4 ring-white`} />{i < Math.min(fit.transitions.length, 8) - 1 && <span className="absolute top-3 bottom-[-20px] w-px bg-slate-200" />}</div>
                        <div className="rounded-xl bg-slate-50/75 px-4 py-3 text-sm"><span className={STATE_COLOR(t.fromState)}>{STATE_LABEL(t.fromState)}</span><span className="mx-2 text-slate-300">→</span><span className={`font-semibold ${STATE_COLOR(t.toState)}`}>{STATE_LABEL(t.toState)}</span></div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="mt-9 border-t border-slate-200/70 pt-8">
                <div className="text-center"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Explore</p><h2 className="mt-1 text-2xl">Go deeper</h2></div>
                <div className="mx-auto mt-5 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
                  <ActionLink href={`https://www.coingecko.com/en/coins/${id}`} label="CoinGecko" mark="CG" />
                  {details?.homepage && <ActionLink href={details.homepage} label="Official website" mark="↗" />}
                  <ActionLink href={`https://x.com/search?q=${xQuery}&src=typed_query&f=live`} label="Search on X" mark="X" />
                  <ActionLink href={`https://www.youtube.com/results?search_query=${youtubeQuery}`} label="YouTube" mark="▶" />
                </div>
              </section>

              {details?.description && (
                <section className="mt-9 border-t border-slate-200/70 pt-8">
                  <details className="group mx-auto max-w-3xl rounded-[22px] border border-slate-200/70 bg-slate-50/70 p-5 open:bg-white sm:p-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Asset profile</p><h2 className="mt-1 text-xl">About {displayName}</h2></div><span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-transform group-open:rotate-45">+</span></summary>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{details.description}</p>
                  </details>
                </section>
              )}

              {(news.length > 0 || videos.length > 0) && (
                <section className="mt-9 grid grid-cols-1 gap-5 border-t border-slate-200/70 pt-8 md:grid-cols-2">
                  {news.length > 0 && <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Latest context</p><h2 className="mt-1 text-xl">Recent news</h2><div className="mt-4 space-y-3">{news.map((article, i) => <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-slate-200/70 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"><p className="text-sm font-semibold leading-5 text-slate-800">{article.title}</p><p className="mt-2 text-xs text-slate-400">{article.source}{article.publishedAt ? ` · ${new Date(article.publishedAt).toLocaleDateString()}` : ""}</p></a>)}</div></div>}
                  {videos.length > 0 && <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Watch</p><h2 className="mt-1 text-xl">Top videos</h2><div className="mt-4 space-y-3">{videos.map((video, i) => <a key={i} href={video.url} target="_blank" rel="noopener noreferrer" className="flex gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-md">{video.thumbnail && <img src={video.thumbnail} alt="" className="h-16 w-24 rounded-xl object-cover" />}<div className="min-w-0"><p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">{video.title}</p><p className="mt-1 text-xs text-slate-400">{video.channel}</p></div></a>)}</div></div>}
                </section>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
