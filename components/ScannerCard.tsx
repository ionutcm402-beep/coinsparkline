"use client";

import { useEffect, useState } from "react";
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

  useEffect(()=>{
    if(!open) return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape") setOpen(false)};
    window.addEventListener("keydown",onKey);
    const old=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return()=>{window.removeEventListener("keydown",onKey);document.body.style.overflow=old};
  },[open]);

  return <>
    <article className="group relative overflow-hidden rounded-[13px] border border-slate-200/70 bg-white/88 text-center shadow-[0_4px_14px_rgba(20,35,75,0.025)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_9px_22px_rgba(20,35,75,0.065)]">
      <div className="absolute right-1.5 top-1.5 z-10 scale-90"><WatchlistButton coinId={coin.id} compact/></div>
      <Link href={`/coin/${coin.id}`} className="block px-2.5 pb-2 pt-3">
        <div className="flex items-center justify-center gap-1.5 pr-6">{coin.logoUrl?<img src={coin.logoUrl} alt="" className="h-5 w-5 rounded-full object-contain"/>:<span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[6px] font-bold text-slate-500">{coin.symbol.slice(0,3)}</span>}<div className="min-w-0 text-left"><p className="truncate text-[11px] font-semibold leading-none text-slate-900">{coin.name}</p><p className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-400">{coin.symbol}</p></div></div>
        <div className="mt-2 flex items-baseline justify-center gap-1.5"><p className="truncate text-[14px] font-semibold leading-none tracking-[-0.03em] text-slate-950"><CurrencyAmount usd={coin.price}/></p><p className={`text-[8px] font-medium ${positive?"text-emerald-600":"text-rose-600"}`}>{positive?"+":""}{coin.change24hPct.toFixed(2)}%</p></div>
        <div className="mt-2 flex items-center justify-between rounded-md bg-slate-950 px-2 py-1 text-white"><span className="text-[7px] font-bold uppercase tracking-[0.08em]">Spark {spark.score}</span><span className="text-[7px] text-slate-300">{spark.label}</span></div>
        <div className={`mt-1.5 rounded-md ${config.bg} px-2 py-1`}><div className="flex items-center justify-between gap-1"><p className={`text-[7px] font-bold tracking-[0.08em] ${config.text}`}>{config.label.toUpperCase()}</p><p className={`text-[7px] ${config.text} opacity-70`}>{coin.confidencePct.toFixed(0)}%</p></div><div className="mt-1 h-[2px] overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full" style={{width:`${coin.confidencePct}%`,backgroundColor:config.dot}}/></div></div>
      </Link>
      <div className="mb-1.5 flex items-center justify-center gap-1 px-1.5"><button type="button" onClick={()=>setOpen(true)} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[8px] font-semibold text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700">Why?</button><AlertRuleButton coinId={coin.id} compact/></div>
    </article>

    {open&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]" onMouseDown={()=>setOpen(false)}>
      <section role="dialog" aria-modal="true" aria-label={`${coin.name} signal explanation`} onMouseDown={e=>e.stopPropagation()} className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-[22px] border border-white/70 bg-white p-5 text-left shadow-[0_30px_90px_rgba(15,23,42,.28)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">{coin.logoUrl?<img src={coin.logoUrl} alt="" className="h-10 w-10 rounded-full object-contain"/>:<span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">{coin.symbol.slice(0,3)}</span>}<div><p className="text-[18px] font-extrabold text-slate-950">{coin.name}</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">{coin.symbol} · Why this signal?</p></div></div>
          <button onClick={()=>setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-500 hover:bg-slate-50">×</button>
        </div>
        <div className={`mt-5 rounded-2xl ${config.bg} p-4`}><div className="flex items-center justify-between gap-3"><div><p className={`text-[11px] font-extrabold uppercase tracking-[.1em] ${config.text}`}>{config.label}</p><p className="mt-1 text-[22px] font-black tracking-[-.03em] text-slate-950">SparkScore {spark.score}</p></div><div className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-bold text-slate-700">{coin.confidencePct.toFixed(0)}% confidence</div></div></div>
        <h3 className="mt-5 text-[17px] font-extrabold text-slate-950">{explanation.headline}</h3>
        <p className="mt-2 text-[13px] leading-6 text-slate-600">{explanation.summary}</p>
        <div className="mt-4 space-y-2.5">{explanation.reasons.map((reason,i)=><div key={i} className="flex gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5"><span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-violet-500"/><p className="text-[12px] leading-5 text-slate-600">{reason}</p></div>)}</div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{[["Confidence",spark.confidence],["Freshness",spark.freshness],["Flip pressure",spark.transitionPressure],["24h activity",spark.marketMove]].map(([label,value])=><div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-3 text-center"><p className="text-[9px] font-bold uppercase tracking-[.08em] text-slate-400">{label}</p><p className="mt-1 text-[17px] font-extrabold text-slate-900">{Number(value).toFixed(0)}</p></div>)}</div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="max-w-[360px] text-[10px] leading-4 text-slate-400">{explanation.caution}</p><Link href={`/coin/${coin.id}`} onClick={()=>setOpen(false)} className="rounded-full bg-slate-950 px-4 py-2 text-[11px] font-bold text-white hover:bg-violet-700">Full coin analysis →</Link></div>
      </section>
    </div>}
  </>;
}
