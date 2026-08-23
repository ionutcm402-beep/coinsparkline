"use client";

import Link from "next/link";
import { Coin } from "@/types/coin";
import { getSignalTier, TIER_CONFIG } from "@/lib/tiers";
import { useCurrency } from "@/components/CurrencyProvider";

export default function ScannerCard({ coin }: { coin: Coin }) {
  const { formatMoney } = useCurrency();
  const tier = getSignalTier(coin);
  const config = TIER_CONFIG[tier];
  const positive = coin.change24hPct >= 0;

  return (
    <Link href={`/coin/${coin.id}`} className="group rounded-[18px] border border-slate-200/70 bg-white/84 p-4 text-center shadow-[0_8px_24px_rgba(20,35,75,0.035)] transition-all hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-[0_14px_34px_rgba(20,35,75,0.08)]">
      <div className="flex items-center justify-center gap-2.5">
        {coin.logoUrl ? <img src={coin.logoUrl} alt="" className="h-7 w-7 rounded-full object-contain" /> : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[8px] font-bold text-slate-500">{coin.symbol.slice(0, 3)}</span>}
        <div className="min-w-0 text-left"><p className="truncate text-sm font-semibold text-slate-900">{coin.name}</p><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{coin.symbol}</p></div>
      </div>
      <p className="mt-3 truncate text-[17px] font-semibold tracking-[-0.03em] text-slate-950">{formatMoney(coin.price)}</p>
      <p className={`mt-0.5 text-[10px] font-medium ${positive ? "text-emerald-600" : "text-rose-600"}`}>{positive ? "+" : ""}{coin.change24hPct.toFixed(2)}% 24h</p>
      <div className={`mt-3 rounded-xl ${config.bg} px-2 py-2`}><p className={`text-[9px] font-bold tracking-[0.1em] ${config.text}`}>{config.label.toUpperCase()}</p><div className="mx-auto mt-1.5 h-1 w-[84%] overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full" style={{ width: `${coin.confidencePct}%`, backgroundColor: config.dot }} /></div><p className={`mt-1 text-[9px] ${config.text} opacity-75`}>{coin.confidencePct.toFixed(0)}% signal</p></div>
    </Link>
  );
}
