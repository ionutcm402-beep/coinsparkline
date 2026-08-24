import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import RegimeChart from "@/components/RegimeChart";
import CurrencyAmount from "@/components/CurrencyAmount";
import { fetchPriceHistory, fetchCoinDetails } from "@/lib/coingecko";
import { fitRegime } from "@/lib/regimeModel";
import { coinCategory } from "@/lib/categories";
import { fetchCoinNews } from "@/lib/news";
import { fetchYoutubeVideos } from "@/lib/youtube";
import { formatCompactNumber } from "@/lib/format";

export const revalidate = 1800;

const STATE_LABEL = (s: number) => (s === 0 ? "Calm" : "Volatile");
const STATE_COLOR = (s: number) => (s === 0 ? "text-emerald-600" : "text-rose-600");

type WalletOption = { name: string; note: string; url: string };

function walletOptions(id: string, platforms: string[], homepage?: string | null): WalletOption[] {
  const has = (needle: string) => platforms.some((p) => p.toLowerCase().includes(needle));
  if (id === "bitcoin") return [
    { name: "Ledger", note: "Hardware wallet", url: "https://www.ledger.com/" },
    { name: "Trezor", note: "Hardware wallet", url: "https://trezor.io/" },
    { name: "Electrum", note: "Bitcoin desktop wallet", url: "https://electrum.org/" },
  ];
  if (id === "litecoin") return [
    { name: "Ledger", note: "Hardware wallet", url: "https://www.ledger.com/" },
    { name: "Trezor", note: "Hardware wallet", url: "https://trezor.io/" },
  ];
  if (id === "solana" || has("solana")) return [
    { name: "Phantom", note: "Solana wallet", url: "https://phantom.com/" },
    { name: "Solflare", note: "Solana wallet", url: "https://solflare.com/" },
    { name: "Ledger", note: "Hardware wallet", url: "https://www.ledger.com/" },
  ];
  if (id === "cardano" || has("cardano")) return [
    { name: "Lace", note: "Cardano wallet", url: "https://www.lace.io/" },
    { name: "Eternl", note: "Cardano wallet", url: "https://eternl.io/" },
    { name: "Ledger", note: "Hardware wallet", url: "https://www.ledger.com/" },
  ];
  if (id === "zcash") return [
    { name: "Zashi", note: "Zcash wallet", url: "https://electriccoin.co/zashi/" },
    { name: "YWallet", note: "Zcash wallet", url: "https://ywallet.app/" },
  ];
  if (id === "monero") return [
    { name: "Monero GUI", note: "Official desktop wallet", url: "https://www.getmonero.org/downloads/" },
    { name: "Feather", note: "Lightweight desktop wallet", url: "https://featherwallet.org/" },
    { name: "Ledger", note: "Hardware wallet integration", url: "https://www.ledger.com/" },
  ];
  if (id === "ethereum" || has("ethereum")) return [
    { name: "MetaMask", note: "EVM wallet", url: "https://metamask.io/" },
    { name: "Rabby", note: "EVM wallet", url: "https://rabby.io/" },
    { name: "Ledger", note: "Hardware wallet", url: "https://www.ledger.com/" },
  ];
  if (homepage) return [{ name: "Official wallet guidance", note: "Check the project website for supported wallets", url: homepage }];
  return [];
}

function ExternalIcon() {
  return <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M7 13 13.5 6.5M9 6.5h4.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function SocialMark({type}:{type:"coingecko"|"web"|"x"|"youtube"|"reddit"}){
  if(type==="x") return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M18.9 3H22l-6.77 7.74L23.2 21h-6.24l-4.89-6.39L6.48 21H3.36l7.24-8.28L2.95 3h6.4l4.42 5.84L18.9 3Zm-1.1 16.2h1.73L8.4 4.7H6.55L17.8 19.2Z"/></svg>;
  if(type==="youtube") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z"/></svg>;
  if(type==="reddit") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M20.7 12.4c.1-.3.2-.7.2-1a2.3 2.3 0 0 0-4-1.5 11.5 11.5 0 0 0-4.2-1.1l.9-4.1 2.9.6a1.8 1.8 0 1 0 .2-.9l-3.5-.7a.5.5 0 0 0-.6.4l-1 4.6A11.8 11.8 0 0 0 7.1 10a2.3 2.3 0 0 0-4 1.5c0 .4.1.7.2 1A4.4 4.4 0 0 0 2 15.4c0 3.7 4.5 6.7 10 6.7s10-3 10-6.7c0-1.1-.5-2.1-1.3-3Zm-13.4 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm8.5 4.1c-.8.8-2.2 1.2-3.8 1.2s-3-.4-3.8-1.2a.5.5 0 0 1 .7-.7c.6.6 1.8.9 3.1.9s2.5-.3 3.1-.9a.5.5 0 0 1 .7.7Zm.9-1.1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/></svg>;
  if(type==="web") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3.5 12h17M12 3c2.3 2.4 3.5 5.4 3.5 9S14.3 18.6 12 21M12 3C9.7 5.4 8.5 8.4 8.5 12S9.7 18.6 12 21"/></svg>;
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#8CC63F" opacity=".18"/><circle cx="12" cy="12" r="7.2" stroke="#77A72F" strokeWidth="1.5"/><path d="M8.5 13.5c1.6-2 3.4-3.1 5.6-3.2 1.1 0 2 .2 2.9.7-.8 3.2-2.7 5-5.7 5-1.2 0-2.1-.4-2.8-1.1Z" fill="#77A72F"/><circle cx="14.9" cy="9" r="1" fill="#77A72F"/></svg>;
}

function ActionLink({href,label,type}:{href:string;label:string;type:"coingecko"|"web"|"x"|"youtube"|"reddit"}){
  return <a href={href} target="_blank" rel="noopener noreferrer" className="coin-deeper-card group flex min-h-[68px] items-center justify-between rounded-[20px] px-4 py-3.5 text-sm font-semibold text-slate-700">
    <span className="flex items-center gap-3"><span className="coin-social-mark flex h-9 w-9 items-center justify-center rounded-xl"><SocialMark type={type}/></span><span>{label}</span></span>
    <span className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"><ExternalIcon/></span>
  </a>;
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
  const [news, videos] = await Promise.all([fetchCoinNews(symbol), fetchYoutubeVideos(`${displayName} crypto`)]);
  const chartPoints = fit.dates.map((date, i) => ({ date, close: fit.closes[i], state: fit.hiddenStates[i] }));
  const marketCap = details?.marketCap;
  const ath = details?.ath;
  const circSupply = details?.circulatingSupply;
  const maxSupply = details?.maxSupply;
  const wallets = walletOptions(id, details?.platforms || [], details?.homepage);
  const xQuery = encodeURIComponent(displayName);
  const youtubeQuery = encodeURIComponent(`${displayName} crypto`);
  const redditQuery = encodeURIComponent(`${displayName} crypto`);
  const lastChange = fit.transitions[0];

  return <div className="coin-detail-shell flex-1">
    <Header/>
    <main className="relative mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-700">← Market</Link>

        <section className="coin-hero-card mt-4 overflow-hidden backdrop-blur-xl">
          <div className="px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-col items-center text-center">
              {details?.imageUrl ? <img src={details.imageUrl} alt="" className="h-16 w-16 rounded-full object-contain shadow-[0_12px_32px_rgba(59,130,246,.13)]"/> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">{symbol.slice(0,4)}</div>}
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-blue-500">{symbol} · {category}</p>
              <h1 className="mt-1 text-3xl tracking-[-0.05em] text-slate-950 sm:text-5xl">{displayName}</h1>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl"><CurrencyAmount usd={fit.closes[fit.closes.length-1]}/></p>
              <div className={`mt-4 rounded-full ${moodBg} px-4 py-2 text-xs font-bold tracking-[0.08em] ${moodText}`}>{mood.toUpperCase()} · {fit.streakDays}D STREAK</div>
            </div>

            <div className={`mx-auto mt-7 max-w-3xl rounded-[24px] ${moodBg} p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.7)] sm:p-6`}>
              <div className="flex items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Current regime</p><p className={`mt-1 text-2xl font-bold tracking-[-0.03em] ${moodText}`}>{mood.toUpperCase()}</p></div><span className={`text-lg font-bold ${moodText}`}>{(fit.confidence*100).toFixed(0)}%</span></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/75"><div className="h-full rounded-full" style={{width:`${(fit.confidence*100).toFixed(0)}%`,backgroundColor:moodDot}}/></div>
              <p className="mt-2 text-xs text-slate-500">Signal strength</p>
              {lastChange&&<p className="mt-4 text-sm text-slate-600">Last change: <span className={STATE_COLOR(lastChange.fromState)}>{STATE_LABEL(lastChange.fromState)}</span> → <span className={STATE_COLOR(lastChange.toState)}>{STATE_LABEL(lastChange.toState)}</span> · {new Date(lastChange.date).toLocaleDateString()}</p>}
            </div>

            <div className="mt-8"><RegimeChart points={chartPoints}/></div>

            <div className="coin-stat-grid mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-blue-100/70 bg-blue-100/70 sm:grid-cols-3">
              {[["Current streak",`${fit.streakDays} days`],["Previous regime",fit.previousState!==null?`${STATE_LABEL(fit.previousState)}, ${fit.previousStreakDays}d`:"No prior data"],["Longest calm streak",`${fit.longestStreakByState[0]} days`],["Longest volatile streak",`${fit.longestStreakByState[1]} days`],["Total regime changes",String(fit.transitions.length)],["Median days to next flip",fit.medianDaysToFlip.toFixed(1)]].map(([label,value])=><div key={label} className="px-4 py-4 sm:px-5"><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>)}
            </div>

            <div className="coin-stat-grid mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-blue-50 px-4 py-4"><p className="text-xs text-slate-400">Market cap</p><p className="mt-1 font-semibold text-slate-700"><CurrencyAmount usd={marketCap} compact/></p></div>
              <div className="rounded-2xl border border-blue-50 px-4 py-4"><p className="text-xs text-slate-400">Circulating supply</p><p className="mt-1 font-semibold text-slate-700">{formatCompactNumber(circSupply)}</p></div>
              <div className="rounded-2xl border border-blue-50 px-4 py-4"><p className="text-xs text-slate-400">All-time high</p><p className="mt-1 font-semibold text-slate-700"><CurrencyAmount usd={ath}/></p></div>
              <div className="rounded-2xl border border-blue-50 px-4 py-4"><p className="text-xs text-slate-400">Max supply</p><p className="mt-1 font-semibold text-slate-700">{maxSupply?formatCompactNumber(maxSupply):"No cap"}</p></div>
            </div>

            {(details?.purchaseMarkets?.length || wallets.length) ? <section className="mt-10 grid gap-5 lg:grid-cols-2">
              {details?.purchaseMarkets?.length ? <div className="rounded-[28px] border border-blue-100/70 bg-white/85 p-5 shadow-[0_18px_44px_rgba(59,130,246,.06)] sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-500">Where to buy</p><h2 className="mt-1 text-2xl font-bold">Markets for {symbol}</h2><p className="mt-2 text-sm text-slate-500">Top active markets reported by CoinGecko. Availability can vary by country.</p>
                <div className="mt-5 space-y-2">{details.purchaseMarkets.map((m)=><div key={`${m.name}-${m.pair}`} className="flex items-center justify-between gap-3 rounded-2xl border border-blue-50 bg-blue-50/35 px-4 py-3"><div><p className="font-semibold text-slate-800">{m.name}</p><p className="text-xs text-slate-400">{m.pair}</p></div>{m.url?<a href={m.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-blue-600 hover:border-blue-200">Open ↗</a>:<span className="text-xs text-slate-400">Market</span>}</div>)}</div>
              </div>:null}
              {wallets.length ? <div className="rounded-[28px] border border-violet-100/70 bg-gradient-to-br from-white via-violet-50/35 to-blue-50/45 p-5 shadow-[0_18px_44px_rgba(99,102,241,.06)] sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-500">Storage</p><h2 className="mt-1 text-2xl font-bold">Wallet options</h2><p className="mt-2 text-sm text-slate-500">Common wallet options for this coin or network. Always verify support before sending funds.</p>
                <div className="mt-5 grid gap-2">{wallets.map((w)=><a key={w.name} href={w.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between rounded-2xl border border-violet-100/70 bg-white/80 px-4 py-3 hover:border-violet-200"><div><p className="font-semibold text-slate-800">{w.name}</p><p className="text-xs text-slate-400">{w.note}</p></div><span className="text-violet-500 transition-transform group-hover:translate-x-0.5">↗</span></a>)}</div>
              </div>:null}
            </section>:null}

            <section className="mt-10 rounded-[28px] border border-blue-100/70 bg-gradient-to-br from-blue-50/65 via-white to-violet-50/55 p-5 sm:p-7">
              <div className="text-center"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-500">Explore</p><h2 className="mt-1 text-2xl font-bold sm:text-3xl">Go deeper</h2><p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">Open trusted sources and live communities without losing the context of this signal.</p></div>
              <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
                <ActionLink href={`https://www.coingecko.com/en/coins/${id}`} label="CoinGecko" type="coingecko"/>
                {details?.homepage&&<ActionLink href={details.homepage} label="Official website" type="web"/>}
                <ActionLink href={`https://x.com/search?q=${xQuery}&src=typed_query&f=live`} label="Search on X" type="x"/>
                <ActionLink href={`https://www.youtube.com/results?search_query=${youtubeQuery}`} label="YouTube" type="youtube"/>
                <ActionLink href={`https://www.reddit.com/search/?q=${redditQuery}`} label="Reddit discussions" type="reddit"/>
              </div>
            </section>

            {details?.description&&<section className="mt-9 border-t border-blue-100/70 pt-8"><details className="group mx-auto max-w-3xl rounded-[24px] border border-blue-100/70 bg-white/75 p-5 shadow-[0_12px_34px_rgba(59,130,246,.04)] open:bg-white sm:p-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-500">Asset profile</p><h2 className="mt-1 text-xl font-bold">About {displayName}</h2></div><span className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600 transition-transform group-open:rotate-45">+</span></summary><p className="mt-4 text-sm leading-7 text-slate-600">{details.description}</p></details></section>}

            {(news.length>0||videos.length>0)&&<section className="mt-9 grid grid-cols-1 gap-5 border-t border-blue-100/70 pt-8 md:grid-cols-2">
              {news.length>0&&<div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-500">Latest context</p><h2 className="mt-1 text-xl font-bold">Recent news</h2><div className="mt-4 space-y-3">{news.map((article,i)=><a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="block rounded-[20px] border border-blue-100/70 bg-white/85 p-4 shadow-[0_10px_28px_rgba(59,130,246,.035)] hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(59,130,246,.08)]"><p className="text-sm font-semibold leading-5 text-slate-800">{article.title}</p><p className="mt-2 text-xs text-slate-400">{article.source}{article.publishedAt?` · ${new Date(article.publishedAt).toLocaleDateString()}`:""}</p></a>)}</div></div>}
              {videos.length>0&&<div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-500">Watch</p><h2 className="mt-1 text-xl font-bold">Top videos</h2><div className="mt-4 space-y-3">{videos.map((video,i)=><a key={i} href={video.url} target="_blank" rel="noopener noreferrer" className="flex gap-3 rounded-[20px] border border-blue-100/70 bg-white/85 p-3 shadow-[0_10px_28px_rgba(59,130,246,.035)] hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(59,130,246,.08)]">{video.thumbnail&&<img src={video.thumbnail} alt="" className="h-16 w-24 rounded-xl object-cover"/>}<div className="min-w-0"><p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">{video.title}</p><p className="mt-1 text-xs text-slate-400">{video.channel}</p></div></a>)}</div></div>}
            </section>}
          </div>
        </section>
      </div>
    </main>
  </div>;
}