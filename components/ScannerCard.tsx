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
  const scoreTone=spark.score>=70?"from-fuchsia-500 via-violet-500 to-indigo-500":spark.score>=55?"from-violet-500 via-indigo-500 to-sky-500":"from-sky-500 via-cyan-500 to-emerald-400";

  useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",onKey);const old=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{window.removeEventListener("keydown",onKey);document.body.style.overflow=old}},[open]);

  return <>
    <article className="premium-scanner-card group relative overflow-hidden text-left">
      <div className="absolute right-4 top-4 z-10"><WatchlistButton coinId={coin.id} compact/></div>
      <Link href={`/coin/${coin.id}`} className="block px-5 pb-4 pt-5">
        <div className="flex min-w-0 items-center gap-3 pr-12">
          {coin.logoUrl?<img src={coin.logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-contain shadow-sm"/>:<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">{coin.symbol.slice(0,3)}</span>}
          <div className="min-w-0 flex-1"><p className="break-words text-[15px] font-extrabold leading-[1.15] tracking-[-0.025em] text-slate-950">{coin.name}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">{coin.symbol}</p></div>
        </div>
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
          <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Price</p><p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-[17px] font-bold leading-tight tracking-[-0.035em] text-slate-950 sm:text-[18px]"><CurrencyAmount usd={coin.price}/></p></div>
          <p className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-extrabold ${positive?"bg-emerald-50 text-emerald-700":"bg-rose-50 text-rose-700"}`}>{positive?"+":""}{coin.change24hPct.toFixed(2)}%</p>
        </div>
        <div className="mt-4 rounded-[18px] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/80 to-sky-50 px-4 py-3.5 shadow-[0_10px_28px_rgba(79,70,229,.08)]">
          <div className="flex items-center justify-between gap-2"><span className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-slate-600">SparkScore</span><span className="text-[10px] font-bold text-indigo-600">{spark.label}</span></div>
          <div className="mt-2.5 flex items-end justify-between gap-3"><div className="flex shrink-0 items-end gap-1"><span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-[30px] font-black leading-none tracking-[-0.06em] text-transparent">{spark.score}</span><span className="pb-1 text-[10px] font-extrabold text-slate-500">/100</span></div><div className="mb-1 h-2.5 min-w-[62px] flex-1 overflow-hidden rounded-full bg-white shadow-inner"><div className={`h-full rounded-full bg-gradient-to-r ${scoreTone}`} style={{width:`${Math.max(4,spark.score)}%`}}/></div></div>
        </div>
        <div className={`mt-3 rounded-[16px] ${config.bg} px-4 py-3.5`}><div className="flex items-center justify-between gap-2"><p className={`text-[9px] font-black uppercase tracking-[0.11em] ${config.text}`}>{config.label}</p><p className={`whitespace-nowrap text-[10px] font-bold ${config.text}`}>{coin.confidencePct.toFixed(0)}% confidence</p></div><div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full" style={{width:`${coin.confidencePct}%`,backgroundColor:config.dot}}/></div></div>
      </Link>
      <div className="flex items-center gap-2 border-t border-slate-100/80 px-4 py-3"><button type="button" onClick={()=>setOpen(true)} className="premium-card-action flex-1">Why this signal?</button><div className="flex-1 [&>button]:w-full [&>button]:min-h-[38px] [&>button]:rounded-full [&>button]:border [&>button]:border-indigo-100 [&>button]:bg-gradient-to-b [&>button]:from-white [&>button]:to-indigo-50/70 [&>button]:px-3 [&>button]:text-[10px] [&>button]:font-bold [&>button]:text-indigo-600"><AlertRuleButton coinId={coin.id} compact/></div></div>
    </article>
    {open&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]" onMouseDown={()=>setOpen(false)}><section role="dialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()} className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-[24px] border border-white/70 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,.28)]"><div className="flex items-start justify-between gap-4"><div><p className="text-[18px] font-extrabold text-slate-950">{coin.name}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">Why this signal?</p></div><button onClick={()=>setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200">×</button></div><h3 className="mt-5 text-[17px] font-extrabold">{explanation.headline}</h3><p className="mt-2 text-[13px] leading-6 text-slate-600">{explanation.summary}</p><div className="mt-4 space-y-2">{explanation.reasons.map((r,i)=><div key={i} className="rounded-xl bg-slate-50 px-3 py-2.5 text-[12px] leading-5 text-slate-600">{r}</div>)}</div><Link href={`/coin/${coin.id}`} onClick={()=>setOpen(false)} className="mt-5 inline-block rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-[11px] font-bold text-white">Full coin analysis →</Link></section></div>}
  </>;
}
