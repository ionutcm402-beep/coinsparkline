"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CurrencyAmount from "@/components/CurrencyAmount";
import WatchlistButton from "@/components/WatchlistButton";
import { Coin } from "@/types/coin";
import { CoinMeta } from "@/lib/coingecko";
import { getSignalTier, TIER_CONFIG, SignalTier } from "@/lib/tiers";
import { getSparkScore } from "@/lib/sparkScore";
import { isStablecoin } from "@/lib/categories";

type SortMode = "rank" | "gainers" | "losers" | "market-cap" | "price" | "spark";
type SignalFilter = "all" | "tracked" | SignalTier;
const PAGE_SIZE = 50;

function compactUsd(n:number|null){if(!n)return"—";if(n>=1e12)return`$${(n/1e12).toFixed(2)}T`;if(n>=1e9)return`$${(n/1e9).toFixed(1)}B`;if(n>=1e6)return`$${(n/1e6).toFixed(0)}M`;return`$${n.toLocaleString()}`}

export default function ExploreClient({marketCoins,trackedCoins}:{marketCoins:CoinMeta[];trackedCoins:Coin[]}){
 const [query,setQuery]=useState("");
 const [sort,setSort]=useState<SortMode>("rank");
 const [signal,setSignal]=useState<SignalFilter>("all");
 const [page,setPage]=useState(1);
 const tracked=useMemo(()=>new Map(trackedCoins.map(c=>[c.id,c] as const)),[trackedCoins]);
 const eligible=useMemo(()=>marketCoins.filter(c=>!isStablecoin(c.id,c.symbol)),[marketCoins]);
 const filtered=useMemo(()=>{
   const q=query.trim().toLowerCase();
   let rows=eligible.filter(c=>!q||c.name.toLowerCase().includes(q)||c.symbol.toLowerCase().includes(q)||c.id.toLowerCase().includes(q));
   if(signal==="tracked")rows=rows.filter(c=>tracked.has(c.id));
   else if(signal!=="all")rows=rows.filter(c=>{const t=tracked.get(c.id);return t?getSignalTier(t)===signal:false});
   rows=[...rows].sort((a,b)=>{
     if(sort==="gainers")return(b.price_change_percentage_24h??-999)-(a.price_change_percentage_24h??-999);
     if(sort==="losers")return(a.price_change_percentage_24h??999)-(b.price_change_percentage_24h??999);
     if(sort==="market-cap")return(b.market_cap??0)-(a.market_cap??0);
     if(sort==="price")return(b.current_price??0)-(a.current_price??0);
     if(sort==="spark")return(getSparkScore(tracked.get(b.id)??({confidencePct:0,streakDays:999,medianDaysToFlip:1,change24hPct:0,regimeState:"calm"} as Coin)).score)-(getSparkScore(tracked.get(a.id)??({confidencePct:0,streakDays:999,medianDaysToFlip:1,change24hPct:0,regimeState:"calm"} as Coin)).score);
     return(a.market_cap_rank??99999)-(b.market_cap_rank??99999);
   });
   return rows;
 },[eligible,query,signal,sort,tracked]);
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
 const current=Math.min(page,pages);
 const visible=filtered.slice((current-1)*PAGE_SIZE,current*PAGE_SIZE);
 function resetPage(){setPage(1)}
 return <main className="mx-auto max-w-[1390px] px-3 py-5 sm:px-5 sm:py-7">
   <div className="flex flex-wrap items-end justify-between gap-4">
    <div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-blue-600">Full market universe</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.045em] text-slate-950 sm:text-4xl">Explore 200+ crypto assets</h1><p className="mt-2 max-w-2xl text-[12px] leading-5 text-slate-500">Search the broader market without cluttering the main dashboard. Tracked assets include CoinSparkLine regime and SparkScore intelligence.</p></div>
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right"><p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Visible universe</p><p className="mt-1 text-lg font-bold text-slate-950">{eligible.length} assets</p></div>
   </div>

   <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white/88 p-3 shadow-[0_8px_28px_rgba(20,35,75,.035)]">
    <div className="grid gap-2 lg:grid-cols-[minmax(240px,1fr)_auto_auto]">
      <div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">⌕</span><input value={query} onChange={e=>{setQuery(e.target.value);resetPage()}} placeholder="Search name, ticker or CoinGecko ID" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[11px] outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"/></div>
      <select value={signal} onChange={e=>{setSignal(e.target.value as SignalFilter);resetPage()}} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-semibold text-slate-600"><option value="all">All assets</option><option value="tracked">Tracked signals</option><option value="calm">Calm</option><option value="building">Building</option><option value="awakening">Awakening</option><option value="volatile">Volatile</option></select>
      <select value={sort} onChange={e=>{setSort(e.target.value as SortMode);resetPage()}} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-semibold text-slate-600"><option value="rank">Market cap rank</option><option value="gainers">Biggest gainers</option><option value="losers">Biggest losers</option><option value="market-cap">Market cap</option><option value="price">Price</option><option value="spark">SparkScore</option></select>
    </div>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[9px] text-slate-400"><span>{filtered.length} matching assets</span><span>Stablecoins excluded from discovery</span></div>
   </section>

   <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:hidden">{visible.map(c=>{const t=tracked.get(c.id);const tier=t?getSignalTier(t):null;const spark=t?getSparkScore(t):null;return <Link key={c.id} href={`/coin/${c.id}`} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center gap-2">{c.image?<img src={c.image} alt="" className="h-7 w-7 rounded-full"/>:<span className="h-7 w-7 rounded-full bg-slate-100"/>}<div className="min-w-0"><p className="truncate text-[11px] font-semibold text-slate-900">{c.name}</p><p className="text-[8px] uppercase text-slate-400">#{c.market_cap_rank??"—"} · {c.symbol}</p></div></div><p className="mt-3 text-sm font-bold"><CurrencyAmount usd={c.current_price}/></p><div className="mt-2 flex items-center justify-between"><span className={`text-[9px] font-semibold ${(c.price_change_percentage_24h??0)>=0?"text-emerald-600":"text-rose-600"}`}>{(c.price_change_percentage_24h??0)>=0?"+":""}{(c.price_change_percentage_24h??0).toFixed(1)}%</span>{tier&&spark?<span className={`rounded-full px-2 py-1 text-[7px] font-bold ${TIER_CONFIG[tier].bg} ${TIER_CONFIG[tier].text}`}>{TIER_CONFIG[tier].label} · {spark.score}</span>:<span className="text-[7px] text-slate-400">Market only</span>}</div></Link>})}</div>

   <section className="mt-4 hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 md:block"><div className="overflow-x-auto"><table className="w-full min-w-[960px] border-collapse"><thead><tr className="border-b border-slate-200 bg-slate-50/70 text-[8px] font-bold uppercase tracking-wider text-slate-400"><th className="px-3 py-3 text-center">#</th><th className="px-3 py-3 text-left">Asset</th><th className="px-3 py-3 text-center">Price</th><th className="px-3 py-3 text-center">24h</th><th className="px-3 py-3 text-center">Market cap</th><th className="px-3 py-3 text-center">Regime</th><th className="px-3 py-3 text-center">SparkScore</th><th className="px-3 py-3 text-center">Actions</th></tr></thead><tbody>{visible.map(c=>{const t=tracked.get(c.id);const tier=t?getSignalTier(t):null;const cfg=tier?TIER_CONFIG[tier]:null;const spark=t?getSparkScore(t):null;return <tr key={c.id} className="border-b border-slate-100 text-[10px] last:border-0 hover:bg-slate-50/65"><td className="px-3 py-3 text-center text-slate-400">{c.market_cap_rank??"—"}</td><td className="px-3 py-3"><div className="flex items-center gap-2"><WatchlistButton coinId={c.id} compact/>{c.image?<img src={c.image} alt="" className="h-7 w-7 rounded-full"/>:<span className="h-7 w-7 rounded-full bg-slate-100"/>}<div><Link href={`/coin/${c.id}`} className="font-semibold text-slate-900 hover:text-blue-600">{c.name}</Link><p className="text-[8px] uppercase tracking-wider text-slate-400">{c.symbol}</p></div></div></td><td className="px-3 py-3 text-center font-semibold"><CurrencyAmount usd={c.current_price}/></td><td className={`px-3 py-3 text-center font-semibold ${(c.price_change_percentage_24h??0)>=0?"text-emerald-600":"text-rose-600"}`}>{(c.price_change_percentage_24h??0)>=0?"+":""}{(c.price_change_percentage_24h??0).toFixed(2)}%</td><td className="px-3 py-3 text-center font-medium text-slate-600">{compactUsd(c.market_cap)}</td><td className="px-3 py-3 text-center">{cfg?<span className={`rounded-full px-2 py-1 text-[8px] font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>:<span className="text-[8px] text-slate-400">Market only</span>}</td><td className="px-3 py-3 text-center">{spark?<span className="rounded-full bg-slate-950 px-2 py-1 text-[8px] font-bold text-white">{spark.score}</span>:<span className="text-slate-300">—</span>}</td><td className="px-3 py-3"><div className="flex justify-center gap-1"><Link href={`/coin/${c.id}`} className="rounded-full border border-slate-200 px-2.5 py-1 text-[8px] font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600">Analyse</Link></div></td></tr>})}</tbody></table></div></section>

   <div className="mt-4 flex items-center justify-center gap-2"><button disabled={current<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-semibold text-slate-600 disabled:opacity-35">← Previous</button><span className="px-2 text-[9px] text-slate-400">Page {current} of {pages}</span><button disabled={current>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-semibold text-slate-600 disabled:opacity-35">Next →</button></div>
 </main>;
}
