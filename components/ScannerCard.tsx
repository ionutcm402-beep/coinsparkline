"use client";

import { useState } from "react";
import Link from "next/link";
import { Coin } from "@/types/coin";
import { getSignalTier, TIER_CONFIG } from "@/lib/tiers";
import { getSparkScore } from "@/lib/sparkScore";
import { explainSignal } from "@/lib/signalExplanation";
import CurrencyAmount from "@/components/CurrencyAmount";
import WatchlistButton from "@/components/WatchlistButton";
import AlertRuleButton from "@/components/AlertRuleButton";

export default function ScannerCard({ coin }: { coin: Coin }) {
  const [open,setOpen]=useState(false);
  const tier=getSignalTier(coin);
  const config=TIER_CONFIG[tier];
  const positive=coin.change24hPct>=0;
  const spark=getSparkScore(coin);
  const explanation=explainSignal(coin);

  return <article className="group relative overflow-hidden rounded-[13px] border border-slate-200/70 bg-white/88 text-center shadow-[0_4px_14px_rgba(20,35,75,0.025)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_9px_22px_rgba(20,35,75,0.065)]">
    <div className="absolute right-1.5 top-1.5 z-10 scale-90"><WatchlistButton coinId={coin.id} compact/></div>
    <Link href={`/coin/${coin.id}`} className="block px-2.5 pb-2 pt-3">
      <div className="flex items-center justify-center gap-1.5 pr-6">{coin.logoUrl?<img src={coin.logoUrl} alt="" className="h-5 w-5 rounded-full object-contain"/>:<span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[6px] font-bold text-slate-500">{coin.symbol.slice(0,3)}</span>}<div className="min-w-0 text-left"><p className="truncate text-[11px] font-semibold leading-none text-slate-900">{coin.name}</p><p className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-400">{coin.symbol}</p></div></div>
      <div className="mt-2 flex items-baseline justify-center gap-1.5"><p className="truncate text-[14px] font-semibold leading-none tracking-[-0.03em] text-slate-950"><CurrencyAmount usd={coin.price}/></p><p className={`text-[8px] font-medium ${positive?"text-emerald-600":"text-rose-600"}`}>{positive?"+":""}{coin.change24hPct.toFixed(2)}%</p></div>
      <div className="mt-2 flex items-center justify-between rounded-md bg-slate-950 px-2 py-1 text-white"><span className="text-[7px] font-bold uppercase tracking-[0.08em]">Spark {spark.score}</span><span className="text-[7px] text-slate-300">{spark.label}</span></div>
      <div className={`mt-1.5 rounded-md ${config.bg} px-2 py-1`}><div className="flex items-center justify-between gap-1"><p className={`text-[7px] font-bold tracking-[0.08em] ${config.text}`}>{config.label.toUpperCase()}</p><p className={`text-[7px] ${config.text} opacity-70`}>{coin.confidencePct.toFixed(0)}%</p></div><div className="mt-1 h-[2px] overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full" style={{width:`${coin.confidencePct}%`,backgroundColor:config.dot}}/></div></div>
    </Link>
    <div className="mb-1.5 flex items-center justify-center gap-1 px-1.5"><button type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[8px] font-semibold text-slate-500 hover:border-violet-200 hover:text-violet-700">Why? {open?"−":"+"}</button><AlertRuleButton coinId={coin.id} compact/></div>
    {open&&<div className="border-t border-slate-100 bg-slate-50/90 px-3 py-3 text-left">
      <p className="text-[9px] font-extrabold text-slate-900">{explanation.headline}</p>
      <p className="mt-1.5 text-[8px] leading-3.5 text-slate-600">{explanation.summary}</p>
      <div className="mt-2 space-y-1.5">{explanation.reasons.map((reason,i)=><div key={i} className="flex gap-1.5"><span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400"/><p className="text-[7.5px] leading-3.5 text-slate-500">{reason}</p></div>)}</div>
      <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 rounded-lg border border-slate-200 bg-white/80 p-2 text-[7.5px]"><span className="text-slate-400">Confidence</span><strong className="text-right text-slate-700">{spark.confidence.toFixed(0)}</strong><span className="text-slate-400">Freshness</span><strong className="text-right text-slate-700">{spark.freshness.toFixed(0)}</strong><span className="text-slate-400">Flip pressure</span><strong className="text-right text-slate-700">{spark.transitionPressure.toFixed(0)}</strong><span className="text-slate-400">24h activity</span><strong className="text-right text-slate-700">{spark.marketMove.toFixed(0)}</strong></div>
      <p className="mt-2 text-[7px] leading-3 text-slate-400">{explanation.caution}</p>
    </div>}
  </article>;
}
