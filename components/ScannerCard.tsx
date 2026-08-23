"use client";

import Link from "next/link";
import { Coin } from "@/types/coin";
import { getSignalTier, TIER_CONFIG } from "@/lib/tiers";
import { getSparkScore } from "@/lib/sparkScore";
import CurrencyAmount from "@/components/CurrencyAmount";
import WatchlistButton from "@/components/WatchlistButton";

export default function ScannerCard({ coin }: { coin: Coin }) {
  const tier = getSignalTier(coin);
  const config = TIER_CONFIG[tier];
  const positive = coin.change24hPct >= 0;
  const spark = getSparkScore(coin);

  return (
    <article className="group relative rounded-[14px] border border-slate-200/70 bg-white/84 text-center shadow-[0_5px_16px_rgba(20,35,75,0.03)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_24px_rgba(20,35,75,0.07)]">
      <div className="absolute right-2 top-2 z-10"><WatchlistButton coinId={coin.id} compact /></div>
      <Link href={`/coin/${coin.id}`} className="block p-3 pt-3.5">
        <div className="flex items-center justify-center gap-2 pr-7">
          {coin.logoUrl ? <img src={coin.logoUrl} alt="" className="h-6 w-6 rounded-full object-contain" /> : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[7px] font-bold text-slate-500">{coin.symbol.slice(0, 3)}</span>}
          <div className="min-w-0 text-left"><p className="truncate text-[12px] font-semibold leading-none text-slate-900">{coin.name}</p><p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-slate-400">{coin.symbol}</p></div>
        </div>
        <div className="mt-2.5 flex items-end justify-center gap-2"><p className="truncate text-[15px] font-semibold leading-none tracking-[-0.03em] text-slate-950"><CurrencyAmount usd={coin.price} /></p><span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[8px] font-bold text-slate-600" title="SparkScore measures behavioural activity, not bullishness">Spark {spark.score}</span></div>
        <p className={`mt-1 text-[9px] font-medium ${positive ? "text-emerald-600" : "text-rose-600"}`}>{positive ? "+" : ""}{coin.change24hPct.toFixed(2)}% 24h</p>
        <div className={`mt-2.5 rounded-lg ${config.bg} px-2 py-1.5`}><div className="flex items-center justify-between gap-1"><p className={`text-[8px] font-bold tracking-[0.08em] ${config.text}`}>{config.label.toUpperCase()}</p><p className={`text-[8px] ${config.text} opacity-70`}>{coin.confidencePct.toFixed(0)}%</p></div><div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full" style={{ width: `${coin.confidencePct}%`, backgroundColor: config.dot }} /></div></div>
      </Link>
    </article>
  );
}
