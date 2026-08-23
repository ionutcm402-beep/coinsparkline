"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FilterPills from "@/components/FilterPills";
import ScannerCard from "@/components/ScannerCard";
import MarketBreadthCard, { MarketBreadthCoin } from "@/components/MarketBreadthCard";
import MarketRegimeSummary from "@/components/MarketRegimeSummary";
import SortControl, { SortOption } from "@/components/SortControl";
import { Coin } from "@/types/coin";
import { getSignalTier, SignalTier } from "@/lib/tiers";
import { isStablecoin } from "@/lib/categories";

interface HomeClientProps {
  coins: Coin[];
  previousCoins?: Coin[];
  previousScannedAt?: string;
  marketCoins?: MarketBreadthCoin[];
  categories: string[];
  updatedLabel?: string;
}
type RadarMode = "heating" | "cooling" | "flipped" | "strongest";
const TIER_LEVEL: Record<SignalTier, number> = { calm: 0, building: 1, awakening: 2, volatile: 3 };

function sortCoins(coins: Coin[], sort: SortOption): Coin[] { const sorted=[...coins]; switch(sort){case "signal-strength":return sorted.sort((a,b)=>b.confidencePct-a.confidencePct);case "biggest-move":return sorted.sort((a,b)=>Math.abs(b.change24hPct)-Math.abs(a.change24hPct));case "market-cap":return sorted.sort((a,b)=>(b.marketCap??0)-(a.marketCap??0));default:return sorted.sort((a,b)=>a.medianDaysToFlip-b.medianDaysToFlip);} }
function SectionHeading({kicker,title,copy}:{kicker:string;title:string;copy:string}){return <div className="mx-auto max-w-xl text-center"><p className="csl-kicker text-[9px] tracking-[0.16em]">{kicker}</p><h2 className="mt-1 text-[1.45rem] sm:text-[1.65rem]">{title}</h2><p className="mt-1 text-[11px] leading-5 text-slate-500">{copy}</p></div>}

export default function HomeClient({coins,previousCoins=[],previousScannedAt,marketCoins=[],categories,updatedLabel}:HomeClientProps){
 const [activeCategory,setActiveCategory]=useState("All coins"); const [sort,setSort]=useState<SortOption>("closest-to-flip"); const [scannerVisible,setScannerVisible]=useState(60); const [query,setQuery]=useState(""); const [radarMode,setRadarMode]=useState<RadarMode>("heating");
 const eligible=useMemo(()=>coins.filter(c=>!isStablecoin(c.id,c.symbol)),[coins]); const trackedIds=useMemo(()=>new Set(eligible.map(c=>c.id)),[eligible]);
 const rankById=useMemo(()=>new Map(marketCoins.map(c=>[c.id,c.market_cap_rank] as const)),[marketCoins]);
 const discovery=useMemo(()=>{const base=activeCategory==="All coins"?eligible:eligible.filter(c=>c.category===activeCategory);return sortCoins(base,sort)},[eligible,activeCategory,sort]);
 const widerMarket=useMemo(()=>marketCoins.filter(c=>!isStablecoin(c.id,c.symbol)).filter(c=>!trackedIds.has(c.id)).sort((a,b)=>(a.market_cap_rank??Number.MAX_SAFE_INTEGER)-(b.market_cap_rank??Number.MAX_SAFE_INTEGER)),[marketCoins,trackedIds]);

 const changes=useMemo(()=>{
   if(!previousCoins.length) return null;
   const oldById=new Map(previousCoins.map(c=>[c.id,c] as const));
   const rows=eligible.flatMap(current=>{const previous=oldById.get(current.id); if(!previous)return []; const nowTier=getSignalTier(current); const oldTier=getSignalTier(previous); return [{current,previous,nowTier,oldTier,levelDelta:TIER_LEVEL[nowTier]-TIER_LEVEL[oldTier],confidenceDelta:current.confidencePct-previous.confidencePct}];});
   const enteredAwakening=rows.filter(r=>r.nowTier==="awakening"&&r.oldTier!=="awakening");
   const enteredVolatile=rows.filter(r=>r.nowTier==="volatile"&&r.oldTier!=="volatile");
   const heated=rows.filter(r=>r.levelDelta>0);
   const cooled=rows.filter(r=>r.levelDelta<0);
   const strongest=[...rows].sort((a,b)=>b.confidenceDelta-a.confidenceDelta).filter(r=>r.confidenceDelta>0);
   const highlights=[...enteredVolatile,...enteredAwakening,...heated,...cooled,...strongest].filter((row,index,all)=>all.findIndex(x=>x.current.id===row.current.id)===index).slice(0,5);
   return {enteredAwakening,enteredVolatile,heated,cooled,strongest,highlights,compared:rows.length};
 },[eligible,previousCoins]);

 const radar=useMemo(()=>{
   const byFreshness=(a:Coin,b:Coin)=>a.streakDays-b.streakDays||b.confidencePct-a.confidencePct;
   if(radarMode==="heating") return eligible.filter(c=>["awakening","volatile"].includes(getSignalTier(c))).sort(byFreshness).slice(0,5);
   if(radarMode==="cooling") return eligible.filter(c=>["building","calm"].includes(getSignalTier(c))).sort(byFreshness).slice(0,5);
   if(radarMode==="flipped") return eligible.filter(c=>c.streakDays<=2).sort(byFreshness).slice(0,5);
   return [...eligible].sort((a,b)=>b.confidencePct-a.confidencePct).slice(0,5);
 },[eligible,radarMode]);
 const radarCopy:Record<RadarMode,string>={heating:"Assets currently leaning into higher-volatility behaviour, prioritising the freshest regime streaks.",cooling:"Assets currently leaning back toward calmer behaviour, prioritising the freshest regime streaks.",flipped:"Coins whose current regime streak is two days old or less — the freshest changes in the tracked set.",strongest:"The highest-confidence regime readings in the tracked market right now."};
 const searchResults=useMemo(()=>{const q=query.trim().toLowerCase(); if(!q)return []; const tracked=eligible.map(c=>({id:c.id,name:c.name,symbol:c.symbol,image:c.logoUrl||"",rank:rankById.get(c.id)??null,tracked:true})); const wide=widerMarket.map(c=>({id:c.id,name:c.name,symbol:c.symbol,image:c.image,rank:c.market_cap_rank,tracked:false})); return [...tracked,...wide].filter(c=>c.name.toLowerCase().includes(q)||c.symbol.toLowerCase().includes(q)||c.id.toLowerCase().includes(q)).sort((a,b)=>{const ae=a.symbol.toLowerCase()===q||a.name.toLowerCase()===q?0:1;const be=b.symbol.toLowerCase()===q||b.name.toLowerCase()===q?0:1;return ae-be||(a.rank??99999)-(b.rank??99999)}).slice(0,8)},[query,eligible,widerMarket,rankById]);

 return <div className="mx-auto max-w-[1320px] space-y-7 px-4 sm:px-5"><MarketRegimeSummary coins={coins} updatedLabel={updatedLabel}/>
  <section className="relative z-20 mx-auto max-w-xl"><div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Bitcoin, ZEC, FIRO, Solana…" aria-label="Search cryptocurrencies" className="w-full rounded-2xl border border-slate-200 bg-white/95 py-3 pl-9 pr-10 text-sm text-slate-900 shadow-[0_8px_28px_rgba(20,35,75,0.06)] outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"/>{query&&<button onClick={()=>setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700">✕</button>}</div>{query&&<div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(20,35,75,0.14)]">{searchResults.length?searchResults.map(c=><Link key={c.id} href={`/coin/${c.id}`} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50">{c.image?<img src={c.image} alt="" className="h-7 w-7 rounded-full object-contain"/>:<span className="h-7 w-7 rounded-full bg-slate-100"/>}<div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-900">{c.name}</p><p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{c.symbol} {c.rank?`· #${c.rank}`:""}</p></div><span className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-wider ${c.tracked?"bg-blue-50 text-blue-600":"bg-slate-50 text-slate-400"}`}>{c.tracked?"Signal ready":"Analyse"}</span></Link>):<p className="px-4 py-5 text-center text-xs text-slate-400">No matching coin in current market coverage.</p>}</div>}</section>

  <section className="rounded-[22px] border border-slate-200/70 bg-white/78 px-3 py-4 shadow-[0_10px_34px_rgba(20,35,75,0.045)] sm:px-4">
    <SectionHeading kicker="Daily intelligence" title="What changed today?" copy={changes?`Current scan compared with the previous saved market snapshot${previousScannedAt?` from ${new Date(previousScannedAt).toLocaleDateString()}`:""}.`:`Comparison will activate automatically after the next successful market refresh.`}/>
    {changes ? <>
      <div className="mx-auto mt-4 grid max-w-4xl grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-orange-50/80 px-3 py-3 text-center"><p className="text-xl font-semibold text-orange-700">{changes.enteredAwakening.length}</p><p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-orange-600">Entered Awakening</p></div>
        <div className="rounded-xl bg-rose-50/80 px-3 py-3 text-center"><p className="text-xl font-semibold text-rose-700">{changes.enteredVolatile.length}</p><p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-rose-600">Entered Volatile</p></div>
        <div className="rounded-xl bg-amber-50/80 px-3 py-3 text-center"><p className="text-xl font-semibold text-amber-700">{changes.heated.length}</p><p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-600">Heated Up</p></div>
        <div className="rounded-xl bg-emerald-50/80 px-3 py-3 text-center"><p className="text-xl font-semibold text-emerald-700">{changes.cooled.length}</p><p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-600">Cooled Down</p></div>
      </div>
      {changes.highlights.length>0?<div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">{changes.highlights.map(r=><div key={r.current.id} className="relative"><ScannerCard coin={r.current}/><div className="pointer-events-none absolute left-2 top-2 rounded-full bg-slate-950/85 px-2 py-1 text-[8px] font-bold text-white">{r.levelDelta>0?`↑ ${r.oldTier} → ${r.nowTier}`:r.levelDelta<0?`↓ ${r.oldTier} → ${r.nowTier}`:`+${r.confidenceDelta.toFixed(0)} confidence`}</div></div>)}</div>:<p className="mt-4 text-center text-[11px] text-slate-400">No regime changes between the two saved snapshots.</p>}
      <p className="mt-3 text-center text-[9px] text-slate-400">Compared {changes.compared} tracked assets. These are model-state changes, not price predictions.</p>
    </>:<div className="mx-auto mt-4 max-w-lg rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-6 text-center"><p className="text-sm font-semibold text-slate-700">Waiting for snapshot #2</p><p className="mt-1 text-[11px] leading-5 text-slate-400">From the next successful refresh onward, CoinSparkLine will preserve the old scan before replacing it and show genuine market-state changes here.</p></div>}
  </section>

  <section className="rounded-[22px] border border-slate-200/70 bg-white/76 px-3 py-4 shadow-[0_10px_34px_rgba(20,35,75,0.045)] backdrop-blur sm:px-4">
    <SectionHeading kicker="Signature discovery" title="Spark Radar" copy={radarCopy[radarMode]} />
    <div className="mx-auto mt-3 flex max-w-2xl flex-wrap justify-center gap-1.5">{([['heating','Heating Up'],['cooling','Cooling Down'],['flipped','Just Flipped'],['strongest','Strongest Signals']] as [RadarMode,string][]).map(([mode,label])=><button key={mode} onClick={()=>setRadarMode(mode)} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${radarMode===mode?'bg-slate-950 text-white shadow-sm':'border border-slate-200 bg-white text-slate-500 hover:text-slate-900'}`}>{label}</button>)}</div>
    {radar.length>0?<div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">{radar.map(c=><ScannerCard key={c.id} coin={c}/>)}</div>:<p className="py-7 text-center text-xs text-slate-400">No tracked assets match this radar view right now.</p>}
    <p className="mt-3 text-center text-[9px] leading-4 text-slate-400">Radar reflects current regime, confidence and streak freshness.</p>
  </section>

  <section><SectionHeading kicker="Market discovery" title="Top 30 discovery" copy="The tracked leaders, compact enough to scan quickly without losing the signal."/><div className="mx-auto mt-3 flex max-w-[1180px] flex-col gap-2 rounded-xl border border-slate-200/70 bg-white/70 p-2 sm:flex-row sm:items-center sm:justify-between"><FilterPills categories={categories} active={activeCategory} onChange={setActiveCategory}/><div className="self-end sm:self-auto"><SortControl value={sort} onChange={setSort}/></div></div><div className="mx-auto mt-3 grid max-w-[1240px] grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">{discovery.map(c=><ScannerCard key={c.id} coin={c}/>)}</div></section>
  {widerMarket.length>0&&<section className="pb-8 pt-1"><SectionHeading kicker="Beyond the tracked leaders" title="Wider market" copy="Live coverage beyond the tracked signal set. Open any asset for full regime analysis."/><div className="mx-auto mt-3 grid max-w-[1280px] grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{widerMarket.slice(0,scannerVisible).map(c=><MarketBreadthCard key={c.id} coin={c}/>)}</div>{scannerVisible<widerMarket.length&&<div className="mt-5 text-center"><button onClick={()=>setScannerVisible(v=>v+60)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm">Load 60 more</button><p className="mt-1.5 text-[9px] text-slate-400">Showing {Math.min(scannerVisible,widerMarket.length)} of {widerMarket.length} wider-market assets</p></div>}</section>}
 </div>;
}
