"use client";

import { useState } from "react";
import Link from "next/link";
import { Coin } from "@/types/coin";
import { getSignalTier, TIER_CONFIG } from "@/lib/tiers";
import { getSparkScore } from "@/lib/sparkScore";
import CurrencyAmount from "@/components/CurrencyAmount";
import WatchlistButton from "@/components/WatchlistButton";

export default function ScannerCard({ coin }: { coin: Coin }) {
  const [open,setOpen]=useState(false);
  const tier = getSignalTier(coin);
  const config = TIER_CONFIG[tier];
  const positive = coin.change24hPct >= 0;
  const spark = getSparkScore(coin);

  return (
    <article className="group relative overflow-hidden rounded-[14px] border border-slate-200/70 bg-white/84 text-center shadow-[0_5px_16px_rgba(20,35,75,0.03)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_24px_rgba(20,35,75,0.07)]">
      <div className="absolute right-2 top-2 z-10"><WatchlistButton coinId={coin.id} compact /></div>
      <Link href={`/coin/${coin.id}`} className="block p-3 pb-2 pt-3.5">
        <div className="flex items-center justify-center gap-2 pr-7">
          {coin.logoUrl ? <img src={coin.logoUrl} alt="" className="h-6 w-6 rounded-full object-contain" /> : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[7px] font-bold text-slate-500">{coin.symbol.slice(0, 3)}</span>}
          <div className="min-w-0 text-left"><p className="truncate text-[12px] font-semibold leading-none text-slate-900">{coin.name}</p><p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-slate-400">{coin.symbol}</p></div>
        </div>
        <p className="mt-2.5 truncate text-[15px] font-semibold leading-none tracking-[-0.03em] text-slate-950"><CurrencyAmount usd={coin.price} /></p>
        <p className={`mt-1 text-[9px] font-medium ${positive ? "text-emerald-600" : "text-rose-600"}`}>{positive ? "+" : ""}{coin.change24hPct.toFixed(2)}% 24h</p>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-950 px-2 py-1.5 text-white"><span className="text-[8px] font-bold uppercase tracking-[0.08em]">Spark {spark.score}</span><span className="text-[8px] text-slate-300">{spark.label}</span></div>
        <div className={`mt-2 rounded-lg ${config.bg} px-2 py-1.5`}><div className="flex items-center justify-between gap-1"><p className={`text-[8px] font-bold tracking-[0.08em] ${config.text}`}>{config.label.toUpperCase()}</p><p className={`text-[8px] ${config.text} opacity-70`}>{coin.confidencePct.toFixed(0)}%</p></div><div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full" style={{ width: `${coin.confidencePct}%`, backgroundColor: config.dot }} /></div></div>
      </Link>
      <button type="button" onClick={()=>setOpen(v=>!v)} className="mb-2 text-[8px] font-semibold uppercase tracking-[0.09em] text-slate-400 hover:text-slate-700">Why this signal? {open?"−":"+"}</button>
      {open&&<div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2.5 text-left"><div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[8px]"><span className="text-slate-400">Confidence</span><strong className="text-right text-slate-700">{spark.confidence.toFixed(0)}</strong><span className="text-slate-400">Freshness</span><strong className="text-right text-slate-700">{spark.freshness.toFixed(0)}</strong><span className="text-slate-400">Flip pressure</span><strong className="text-right text-slate-700">{spark.transitionPressure.toFixed(0)}</strong><span className="text-slate-400">24h movement</span><strong className="text-right text-slate-700">{spark.marketMove.toFixed(0)}</strong></div><p className="mt-2 text-[8px] leading-4 text-slate-400">SparkScore describes behavioural activity, not expected return or a buy/sell recommendation.</p></div>}
    </article>
  );
}
