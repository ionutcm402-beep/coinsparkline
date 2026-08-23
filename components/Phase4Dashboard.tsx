"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FilterPills from "@/components/FilterPills";
import SortControl, { SortOption } from "@/components/SortControl";
import ScannerCard from "@/components/ScannerCard";
import CurrencyAmount from "@/components/CurrencyAmount";
import WatchlistButton from "@/components/WatchlistButton";
import AlertRuleButton from "@/components/AlertRuleButton";
import { Coin } from "@/types/coin";
import { getSignalTier, TIER_CONFIG, SignalTier } from "@/lib/tiers";
import { getSparkScore } from "@/lib/sparkScore";
import { isStablecoin } from "@/lib/categories";
import type { MarketBreadthCoin } from "@/components/MarketBreadthCard";

type RadarMode = "heating" | "cooling" | "flipped" | "strongest";
const LEVEL: Record<SignalTier, number> = { calm: 0, building: 1, awakening: 2, volatile: 3 };

interface Props {
  coins: Coin[];
  previousCoins?: Coin[];
  previousScannedAt?: string;
  marketCoins?: MarketBreadthCoin[];
  categories: string[];
  updatedLabel?: string;
}

function sortCoins(coins: Coin[], sort: SortOption) {
  const rows = [...coins];
  if (sort === "signal-strength") return rows.sort((a,b)=>b.confidencePct-a.confidencePct);
  if (sort === "biggest-move") return rows.sort((a,b)=>Math.abs(b.change24hPct)-Math.abs(a.change24hPct));
  if (sort === "market-cap") return rows.sort((a,b)=>(b.marketCap??0)-(a.marketCap??0));
  return rows.sort((a,b)=>a.medianDaysToFlip-b.medianDaysToFlip);
}

function compactUsd(n:number){if(n>=1e12)return`$${(n/1e12).toFixed(2)}T`;if(n>=1e9)return`$${(n/1e9).toFixed(1)}B`;if(n>=1e6)return`$${(n/1e6).toFixed(0)}M`;return`$${n.toLocaleString()}`}

function SectionTitle({children}:{children:React.ReactNode}){
  return <h2 className="text-[15px] font-extrabold tracking-[-.025em] text-slate-950 sm:text-base">{children}</h2>;
}

export default function Phase4Dashboard({coins,previousCoins=[],previousScannedAt,marketCoins=[],categories,updatedLabel}:Props){
  const [category,setCategory]=useState("All coins");
  const [sort,setSort]=useState<SortOption>("signal-strength");
  const [radarMode,setRadarMode]=useState<RadarMode>("heating");
  const [query,setQuery]=useState("");

  const eligible=useMemo(()=>coins.filter(c=>!isStablecoin(c.id,c.symbol)),[coins]);
  const trackedIds=useMemo(()=>new Set(eligible.map(c=>c.id)),[eligible]);
  const rankById=useMemo(()=>new Map(marketCoins.map(c=>[c.id,c.market_cap_rank] as const)),[marketCoins]);
  const wider=useMemo(()=>marketCoins.filter(c=>!isStablecoin(c.id,c.symbol)&&!trackedIds.has(c.id)),[marketCoins,trackedIds]);
  const discovery=useMemo(()=>sortCoins(category==="All coins"?eligible:eligible.filter(c=>c.category===category),sort),[eligible,category,sort]);
  const oldMap=useMemo(()=>new Map(previousCoins.map(c=>[c.id,c] as const)),[previousCoins]);

  const transitionFor=(coin:Coin)=>{const old=oldMap.get(coin.id);if(!old)return null;const now=getSignalTier(coin),before=getSignalTier(old);return{now,before,delta:LEVEL[now]-LEVEL[before],confidenceDelta:coin.confidencePct-old.confidencePct}};

  const changes=useMemo(()=>{
    if(!previousCoins.length)return null;
    const rows=eligible.flatMap(current=>{const old=oldMap.get(current.id);if(!old)return[];const now=getSignalTier(current),before=getSignalTier(old);return[{current,now,before,delta:LEVEL[now]-LEVEL[before],confidenceDelta:current.confidencePct-old.confidencePct}]});
    return {
      awakening:rows.filter(r=>r.now==="awakening"&&r.before!=="awakening"),
      volatile:rows.filter(r=>r.now==="volatile"&&r.before!=="volatile"),
      heated:rows.filter(r=>r.delta>0),
      cooled:rows.filter(r=>r.delta<0),
    };
  },[eligible,previousCoins,oldMap]);

  const radar=useMemo(()=>{
    const fresh=(a:Coin,b:Coin)=>a.streakDays-b.streakDays||b.confidencePct-a.confidencePct;
    if(radarMode==="heating")return eligible.filter(c=>["building","awakening","volatile"].includes(getSignalTier(c))).sort((a,b)=>(b.volatilityAccelerationPct??1)-(a.volatilityAccelerationPct??1)||fresh(a,b)).slice(0,5);
    if(radarMode==="cooling")return eligible.filter(c=>["calm","building"].includes(getSignalTier(c))).sort((a,b)=>(a.volatilityAccelerationPct??1)-(b.volatilityAccelerationPct??1)||fresh(a,b)).slice(0,5);
    if(radarMode==="flipped")return eligible.filter(c=>c.streakDays<=2).sort(fresh).slice(0,5);
    return [...eligible].sort((a,b)=>getSparkScore(b).score-getSparkScore(a).score).slice(0,5);
  },[eligible,radarMode]);

  const results=useMemo(()=>{
    const q=query.trim().toLowerCase(); if(!q)return[];
    const tracked=eligible.map(c=>({id:c.id,name:c.name,symbol:c.symbol,image:c.logoUrl||"",rank:rankById.get(c.id)??null,tracked:true}));
    const broad=wider.map(c=>({id:c.id,name:c.name,symbol:c.symbol,image:c.image,rank:c.market_cap_rank,tracked:false}));
    return [...tracked,...broad].filter(c=>c.name.toLowerCase().includes(q)||c.symbol.toLowerCase().includes(q)||c.id.toLowerCase().includes(q)).sort((a,b)=>Number(!(a.symbol.toLowerCase()===q||a.name.toLowerCase()===q))-Number(!(b.symbol.toLowerCase()===q||b.name.toLowerCase()===q))||(a.rank??99999)-(b.rank??99999)).slice(0,8);
  },[query,eligible,wider,rankById]);

  const coverage=useMemo(()=>{
    const cap=marketCoins.reduce((s,c)=>s+(c.market_cap??0),0);
    const btc=marketCoins.find(c=>c.id==="bitcoin")?.market_cap??0;
    const moves=marketCoins.map(c=>Math.abs(c.price_change_percentage_24h??0));
    return {cap,btcShare:cap?btc/cap*100:0,avgMove:moves.length?moves.reduce((a,b)=>a+b,0)/moves.length:0};
  },[marketCoins]);

  const beyond=useMemo(()=>[...wider].sort((a,b)=>Math.abs(b.price_change_percentage_24h??0)-Math.abs(a.price_change_percentage_24h??0)).slice(0,6),[wider]);

  const changedCards = changes ? [
    {label:"Entered Awakening",count:changes.awakening.length,mark:"↑",cls:"bg-orange-50 text-orange-700"},
    {label:"Entered Volatile",count:changes.volatile.length,mark:"↗",cls:"bg-rose-50 text-rose-700"},
    {label:"Heated Up",count:changes.heated.length,mark:"↗",cls:"bg-amber-50 text-amber-700"},
    {label:"Cooled Down",count:changes.cooled.length,mark:"↓",cls:"bg-blue-50 text-blue-700"},
  ] : [];

  return <main className="mx-auto max-w-[1390px] space-y-3 px-3 pb-4 pt-3 sm:px-5">
    <section className="grid grid-cols-2 overflow-hidden rounded-[14px] border border-slate-200/70 bg-white/86 shadow-[0_5px_18px_rgba(20,35,75,.03)] sm:grid-cols-3 lg:grid-cols-5">
      {[
        ["Coverage",`${marketCoins.length||eligible.length} assets`],
        ["Covered market cap",coverage.cap?compactUsd(coverage.cap):"—"],
        ["BTC share",coverage.btcShare?`${coverage.btcShare.toFixed(1)}%`:"—"],
        ["Average 24h move",coverage.avgMove?`${coverage.avgMove.toFixed(1)}%`:"—"],
        ["Signal freshness",updatedLabel||"Latest snapshot"],
      ].map(([label,value],i)=><div key={label} className={`min-h-[74px] px-3 py-3 text-center ${i?"border-l border-slate-100":""}`}><p className="text-[9px] font-bold uppercase tracking-[.08em] text-slate-400">{label}</p><p className={`mt-1.5 text-[14px] font-bold leading-5 sm:text-[15px] ${label==="Signal freshness"?"text-emerald-700":"text-slate-950"}`}>{value}</p></div>)}
    </section>

    <section className="relative z-20 mx-auto max-w-2xl">
      <div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Bitcoin, ZEC, FIRO, SOL…" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-[12px] shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"/>{query&&<button onClick={()=>setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">✕</button>}</div>
      {query&&<div className="absolute left-0 right-0 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">{results.length?results.map(c=><Link key={c.id} href={`/coin/${c.id}`} className="flex items-center gap-2.5 border-b border-slate-100 px-3 py-2.5 last:border-0 hover:bg-slate-50">{c.image?<img src={c.image} alt="" className="h-7 w-7 rounded-full object-contain"/>:<span className="h-7 w-7 rounded-full bg-slate-100"/>}<div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-slate-900">{c.name}</p><p className="text-[8px] uppercase tracking-wider text-slate-400">{c.symbol}{c.rank?` · #${c.rank}`:""}</p></div><span className="text-[8px] font-semibold text-slate-400">{c.tracked?"Signal ready":"Market data"}</span></Link>):<p className="p-4 text-center text-[10px] text-slate-400">No match in current coverage.</p>}</div>}
    </section>

    <section className="rounded-[16px] border border-slate-200/70 bg-white/86 p-4 shadow-[0_6px_20px_rgba(20,35,75,.03)]">
      <div className="flex items-center justify-between gap-3"><SectionTitle>What Changed Today?</SectionTitle><span className="text-[10px] font-medium text-slate-400">{previousScannedAt?`vs ${new Date(previousScannedAt).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}`:"Waiting for second snapshot"}</span></div>
      {changes?<div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">{changedCards.map(c=><div key={c.label} className="rounded-xl border border-slate-200/70 bg-white px-3 py-3"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${c.cls}`}>{c.mark}</span><div><p className="text-[11px] font-semibold text-slate-900">{c.label}</p><p className="text-[10px] text-slate-500">{c.count} coins</p></div></div></div>)}</div>:<p className="mt-3 rounded-xl bg-slate-50 p-5 text-center text-[10px] text-slate-400">This activates after the next stored scan.</p>}
    </section>

    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-3">
        <section className="rounded-[16px] border border-slate-200/70 bg-white/86 p-4 shadow-[0_6px_20px_rgba(20,35,75,.03)]">
          <div className="flex flex-wrap items-center justify-between gap-3"><SectionTitle>Spark Radar</SectionTitle><div className="flex flex-wrap justify-end gap-1.5">{([['heating','🔥 Heating Up'],['cooling','❄ Cooling Down'],['flipped','↻ Just Flipped'],['strongest','⚡ Strongest']] as [RadarMode,string][]).map(([mode,label])=><button key={mode} onClick={()=>setRadarMode(mode)} className={`rounded-full px-3 py-1.5 text-[9px] font-semibold ${radarMode===mode?"bg-slate-950 text-white":"border border-slate-200 bg-white text-slate-500 hover:text-slate-900"}`}>{label}</button>)}</div></div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{radar.map(c=><ScannerCard key={c.id} coin={c}/>)}</div>
        </section>

        <section className="rounded-[16px] border border-slate-200/70 bg-white/88 p-4 shadow-[0_6px_20px_rgba(20,35,75,.03)]">
          <div className="flex flex-wrap items-center justify-between gap-3"><SectionTitle>Top 30 Discovery</SectionTitle><div className="flex flex-wrap items-center justify-end gap-2"><FilterPills categories={categories} active={category} onChange={setCategory}/><SortControl value={sort} onChange={setSort}/></div></div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:hidden">{discovery.map(c=><ScannerCard key={c.id} coin={c}/>)}</div>
          <div className="mt-3 hidden overflow-x-auto md:block"><table className="w-full min-w-[900px] border-collapse"><thead><tr className="border-b border-slate-200 text-[8px] uppercase tracking-wider text-slate-400"><th className="px-2 py-2 text-left">#</th><th className="px-2 py-2 text-left">Coin</th><th className="px-2 py-2 text-center">Price</th><th className="px-2 py-2 text-center">24h</th><th className="px-2 py-2 text-center">Regime</th><th className="px-2 py-2 text-center">Confidence</th><th className="px-2 py-2 text-center">SparkScore</th><th className="px-2 py-2 text-center">Change</th><th className="px-2 py-2 text-center">Actions</th></tr></thead><tbody>{discovery.map((c,i)=>{const tier=getSignalTier(c),cfg=TIER_CONFIG[tier],spark=getSparkScore(c),tr=transitionFor(c);const change=tr?(tr.delta>0?`↑ ${tr.before}→${tr.now}`:tr.delta<0?`↓ ${tr.before}→${tr.now}`:Math.abs(tr.confidenceDelta)>=1?`${tr.confidenceDelta>0?'+':''}${tr.confidenceDelta.toFixed(0)} conf.`:"No change"):"—";return <tr key={c.id} className="border-b border-slate-100 text-[10px] last:border-0 hover:bg-slate-50/70"><td className="px-2 py-2.5 text-left text-slate-400">{i+1}</td><td className="px-2 py-2.5 text-left"><div className="flex items-center gap-2"><WatchlistButton coinId={c.id} compact/>{c.logoUrl?<img src={c.logoUrl} alt="" className="h-6 w-6 rounded-full object-contain"/>:<span className="h-6 w-6 rounded-full bg-slate-100"/>}<Link href={`/coin/${c.id}`} className="font-semibold text-slate-900">{c.symbol}</Link><span className="max-w-[105px] truncate text-slate-400">{c.name}</span></div></td><td className="px-2 py-2.5 text-center font-semibold"><CurrencyAmount usd={c.price}/></td><td className={`px-2 py-2.5 text-center font-semibold ${c.change24hPct>=0?"text-emerald-600":"text-rose-600"}`}>{c.change24hPct>=0?"+":""}{c.change24hPct.toFixed(1)}%</td><td className="px-2 py-2.5 text-center"><span className={`rounded-full px-2 py-1 text-[8px] font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span></td><td className="px-2 py-2.5 text-center">{c.confidencePct.toFixed(0)}%</td><td className="px-2 py-2.5 text-center"><span className="inline-flex min-w-8 justify-center rounded-full bg-slate-950 px-2 py-1 text-[8px] font-bold text-white">{spark.score}</span></td><td className="px-2 py-2.5 text-center text-[9px] font-medium text-slate-500">{change}</td><td className="px-2 py-2.5"><div className="flex items-center justify-center gap-1"><Link href={`/coin/${c.id}`} className="rounded-full border border-slate-200 px-2 py-1 text-[8px] font-semibold text-slate-600">Why?</Link><AlertRuleButton coinId={c.id} compact/></div></td></tr>})}</tbody></table></div>
        </section>
      </div>

      <aside className="space-y-3">
        <section className="rounded-[16px] border border-slate-200/70 bg-white/86 p-4 shadow-[0_6px_20px_rgba(20,35,75,.03)]">
          <div className="flex items-center justify-between"><SectionTitle>Beyond the Tracker</SectionTitle><span className="text-[9px] font-semibold text-slate-400">Wider market</span></div>
          <p className="mt-1 text-[10px] leading-4 text-slate-500">Largest absolute 24h moves outside the tracked signal set.</p>
          <div className="mt-3 divide-y divide-slate-100">{beyond.map(c=><Link key={c.id} href={`/coin/${c.id}`} className="flex items-center gap-2 py-2.5 first:pt-0 last:pb-0"><img src={c.image} alt="" className="h-7 w-7 rounded-full object-contain"/><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-slate-900">{c.name}</p><p className="text-[8px] uppercase text-slate-400">{c.symbol}{c.market_cap_rank?` · #${c.market_cap_rank}`:""}</p></div><div className="text-right"><p className="text-[9px] font-semibold text-slate-700">${c.current_price<1?c.current_price.toPrecision(3):c.current_price.toLocaleString(undefined,{maximumFractionDigits:2})}</p><p className={`text-[8px] font-semibold ${(c.price_change_percentage_24h??0)>=0?"text-emerald-600":"text-rose-600"}`}>{(c.price_change_percentage_24h??0)>=0?"+":""}{(c.price_change_percentage_24h??0).toFixed(1)}%</p></div></Link>)}</div>
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-center text-[9px] text-slate-500">All 200+ assets remain available through search.</p>
        </section>

        <section className="rounded-[16px] border border-slate-200/70 bg-white/86 p-4 shadow-[0_6px_20px_rgba(20,35,75,.03)]">
          <div className="flex items-center justify-between"><SectionTitle>Coverage</SectionTitle><span className="text-[9px] font-semibold text-slate-400">Live universe</span></div>
          <div className="mt-3 divide-y divide-slate-100">{[["Assets covered",String(marketCoins.length||eligible.length)],["Tracked signals",String(eligible.length)],["Covered market cap",coverage.cap?compactUsd(coverage.cap):"—"],["BTC share",coverage.btcShare?`${coverage.btcShare.toFixed(1)}%`:"—"],["Avg. absolute 24h move",coverage.avgMove?`${coverage.avgMove.toFixed(1)}%`:"—"]].map(([label,value])=><div key={label} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"><span className="text-[9px] text-slate-500">{label}</span><strong className="text-right text-[10px] text-slate-900">{value}</strong></div>)}</div>
        </section>
      </aside>
    </div>
  </main>;
}
