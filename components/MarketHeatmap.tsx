"use client";

import Link from "next/link";
import {useMemo,useState} from "react";
import {Coin} from "@/types/coin";
import {getSignalTier,TIER_CONFIG,SignalTier} from "@/lib/tiers";
import {getSparkScore} from "@/lib/sparkScore";
import CurrencyAmount from "@/components/CurrencyAmount";

type Filter="all"|SignalTier;

const FILTERS:[Filter,string][]=[
  ["all","All"],
  ["calm","Calm"],
  ["building","Building"],
  ["awakening","Awakening"],
  ["volatile","Volatile"],
];

function tileClass(rank:number|null|undefined){
  const r=rank??9999;
  if(r<=2)return "md:col-span-4 md:row-span-2";
  if(r<=8)return "md:col-span-3 md:row-span-2";
  if(r<=20)return "md:col-span-2 md:row-span-2";
  return "md:col-span-2 md:row-span-1";
}

function tone(tier:SignalTier){
  if(tier==="volatile")return "from-rose-50 via-white to-rose-100/70 border-rose-200 hover:border-rose-300";
  if(tier==="awakening")return "from-orange-50 via-white to-amber-100/70 border-orange-200 hover:border-orange-300";
  if(tier==="building")return "from-amber-50 via-white to-yellow-100/70 border-amber-200 hover:border-amber-300";
  return "from-emerald-50 via-white to-teal-100/70 border-emerald-200 hover:border-emerald-300";
}

export default function MarketHeatmap({coins}:{coins:Coin[]}){
  const[filter,setFilter]=useState<Filter>("all");
  const[limit,setLimit]=useState(48);
  const eligible=useMemo(()=>coins.filter(c=>!["usdt","usdc","dai","busd","tusd","usdp"].includes(c.symbol.toLowerCase())),[coins]);
  const rows=useMemo(()=>eligible
    .filter(c=>filter==="all"||getSignalTier(c)===filter)
    .sort((a,b)=>(a.marketCapRank??9999)-(b.marketCapRank??9999))
    .slice(0,limit),[eligible,filter,limit]);
  const counts=useMemo(()=>({
    calm:eligible.filter(c=>getSignalTier(c)==="calm").length,
    building:eligible.filter(c=>getSignalTier(c)==="building").length,
    awakening:eligible.filter(c=>getSignalTier(c)==="awakening").length,
    volatile:eligible.filter(c=>getSignalTier(c)==="volatile").length,
  }),[eligible]);

  return <section id="heatmap" className="csl2-section"><div className="csl-shell">
    <div className="csl2-section-head"><div><p className="csl-kicker">Whole-market signal map</p><h2 className="csl-section-title mt-2">Market Heatmap</h2><p className="csl-subtitle mt-2">Tile size follows market-cap rank. Colour shows CoinSparkLine signal state. SparkScore shows where behaviour is becoming more unusual.</p></div><div className="text-right"><p className="text-[28px] font-extrabold tracking-[-.04em]">{eligible.length}</p><p className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-400">Assets mapped</p></div></div>

    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-slate-200/70 bg-white/85 p-3 shadow-sm">
      <div className="flex flex-wrap gap-2">{FILTERS.map(([key,label])=><button key={key} onClick={()=>{setFilter(key);setLimit(48)}} className={`rounded-full px-3.5 py-2 text-[10px] font-extrabold transition ${filter===key?"bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm":"bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-700"}`}>{label}{key!=="all"?` · ${counts[key]}`:""}</button>)}</div>
      <div className="flex flex-wrap gap-3 text-[9px] font-bold uppercase tracking-[.08em] text-slate-400"><span className="text-emerald-600">● Calm</span><span className="text-amber-600">● Building</span><span className="text-orange-600">● Awakening</span><span className="text-rose-600">● Volatile</span></div>
    </div>

    <div className="grid auto-rows-[112px] grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-12 md:auto-rows-[102px]">{rows.map(coin=>{
      const tier=getSignalTier(coin);const spark=getSparkScore(coin);const cfg=TIER_CONFIG[tier];const positive=coin.change24hPct>=0;
      return <Link key={coin.id} href={`/coin/${coin.id}`} className={`${tileClass(coin.marketCapRank)} group relative overflow-hidden rounded-[22px] border bg-gradient-to-br ${tone(tier)} p-3.5 shadow-[0_8px_24px_rgba(15,23,42,.035)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,130,246,.10)]`}>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/70"><div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" style={{width:`${spark.score}%`}}/></div>
        <div className="flex h-full min-w-0 flex-col justify-between gap-2"><div className="flex min-w-0 items-start justify-between gap-2"><div className="flex min-w-0 items-center gap-2.5">{coin.logoUrl?<img src={coin.logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-contain shadow-sm"/>:<span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[9px] font-black text-slate-500">{coin.symbol.slice(0,3)}</span>}<div className="min-w-0"><p className="truncate text-[12px] font-black tracking-[-.02em] text-slate-950 sm:text-[13px]">{coin.name}</p><p className="mt-0.5 text-[8px] font-bold uppercase tracking-[.12em] text-slate-400">{coin.symbol}{coin.marketCapRank?` · #${coin.marketCapRank}`:""}</p></div></div><span className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-extrabold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span></div>
        <div className="flex items-end justify-between gap-2"><div className="min-w-0"><p className="truncate text-[12px] font-extrabold text-slate-800 sm:text-[13px]"><CurrencyAmount usd={coin.price}/></p><p className={`mt-1 text-[9px] font-bold ${positive?"text-emerald-600":"text-rose-600"}`}>{positive?"+":""}{coin.change24hPct.toFixed(2)}%</p></div><div className="text-right"><p className="text-[8px] font-bold uppercase tracking-[.08em] text-slate-400">Spark</p><p className="text-[19px] font-black tracking-[-.05em] text-indigo-600">{spark.score}</p></div></div></div>
      </Link>})}</div>

    {rows.length<eligible.filter(c=>filter==="all"||getSignalTier(c)===filter).length&&<div className="mt-5 text-center"><button onClick={()=>setLimit(v=>v+48)} className="csl-btn-soft">Map 48 more</button></div>}
    <p className="mt-4 text-center text-[10px] leading-5 text-slate-400">The heatmap visualises current market behaviour. It is not a prediction of future returns.</p>
  </div></section>;
}
