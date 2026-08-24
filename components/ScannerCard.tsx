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
    <article className="premium-scanner-card group relative overflow-hidden text-left">
      <div className="absolute right-3 top-3 z-10"><WatchlistButton coinId={coin.id} compact/></div>
      <Link href={`/coin/${coin.id}`} className="block px-4 pb-3 pt-4 sm:px-5 sm:pb-4 sm:pt-5">
        <div className="flex items-center gap-3 pr-9">
          {coin.logoUrl?<img src={coin.logoUrl} alt="" className="h-9 w-9 rounded-full object-contain shadow-sm"/>:<span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">{coin.symbol.slice(0,3)}</span>}
          <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-bold tracking-[-0.02em] text-slate-950 sm:text-[14px]">{coin.name}</p><p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">{coin.symbol}</p></div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Price</p><p className="mt-1 truncate text-[19px] font-semibold leading-none tracking-[-0.045em] text-slate-950 sm:text-[21px]"><CurrencyAmount usd={coin.price}/></p></div>
          <p className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${positive?"bg-emerald-50 text-emerald-600":"bg-rose-50 text-rose-600"}`}>{positive?"+":""}{coin.change24hPct.toFixed(2)}%</p>
        </div>

        <div className="mt-5 rounded-[16px] bg-[#0b0b10] px-3.5 py-3 text-white shadow-[0_12px_28px_rgba(15,23,42,.13)]">
          <div className="flex items-center justify-between gap-2"><span className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/65">SparkScore</span><span className="text-[9px] font-semibold text-white/65">{spark.label}</span></div>
          <div className="mt-1 flex items-end justify-between gap-2"><span className="text-[24px] font-black leading-none tracking-[-0.055em]">{spark.score}</span><span className="pb-0.5 text-[8px] font-semibold text-white/50">/ 100</span></div>
        </div>

        <div className={`mt-3 rounded-[15px] ${config.bg} px-3.5 py-3`}>
          <div className="flex items-center justify-between gap-2"><p className={`text-[8px] font-extrabold uppercase tracking-[0.12em] ${config.text}`}>{config.label}</p><p className={`text-[9px] font-semibold ${config.text} opacity-75`}>{coin.confidencePct.toFixed(0)}% confidence</p></div>
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/75"><div className="h-full rounded-full" style={{width:`${coin.confidencePct}%`,backgroundColor:config.dot}}/></div>
        </div>
      </Link>

      <div className="flex items-center gap-2 border-t border-slate-100/80 px-3.5 py-3 sm:px-4">
        <button type="button" onClick={()=>setOpen(true)} className="premium-card-action flex-1">Why this signal?</button>
        <div className="flex-1 [&>button]:w-full [&>button]:min-h-[34px] [&>button]:rounded-full [&>button]:border [&>button]:border-slate-200/80 [&>button]:bg-white [&>button]:px-3 [&>button]:text-[9px] [&>button]:font-bold [&>button]:text-slate-600 [&>button]:shadow-[0_4px_12px_rgba(15,23,42,.035)] [&>button]:transition-all hover:[&>button]:-translate-y-px hover:[&>button]:border-indigo-200 hover:[&>button]:text-indigo-600"><AlertRuleButton coinId={coin.id} compact/></div>
      </div>
    </article>

    {open&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]" onMouseDown={()=>setOpen(false)}>
      <section role="dialog" aria-modal="true" aria-label={`${coin.name} signal explanation`} onMouseDown={e=>e.stopPropagation()} className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-[24px] border border-white/70 bg-white p-5 text-left shadow-[0_30px_90px_rgba(15,23,42,.28)] sm:p-6">
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
