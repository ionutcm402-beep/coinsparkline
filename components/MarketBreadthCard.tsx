"use client";

import Link from "next/link";
import CurrencyAmount from "@/components/CurrencyAmount";

export interface MarketBreadthCoin {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
  current_price: number;
  image: string;
  price_change_percentage_24h: number | null;
  market_cap: number | null;
}

export default function MarketBreadthCard({ coin }: { coin: MarketBreadthCoin }) {
  const move = coin.price_change_percentage_24h ?? 0;
  const positive = move >= 0;

  return (
    <Link
      href={`/coin/${coin.id}`}
      className="group rounded-[18px] border border-slate-200/70 bg-white/84 p-4 text-center shadow-[0_8px_24px_rgba(20,35,75,0.035)] transition-all hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-[0_14px_34px_rgba(20,35,75,0.08)]"
    >
      <div className="flex items-center justify-center gap-2.5">
        {coin.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coin.image} alt="" className="h-7 w-7 rounded-full object-contain" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[8px] font-bold text-slate-500">{coin.symbol.slice(0, 3).toUpperCase()}</span>
        )}
        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-semibold text-slate-900">{coin.name}</p>
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{coin.symbol.toUpperCase()} · #{coin.market_cap_rank ?? "—"}</p>
        </div>
      </div>

      <p className="mt-3 truncate text-[17px] font-semibold tracking-[-0.03em] text-slate-950"><CurrencyAmount usd={coin.current_price} /></p>
      <p className={`mt-0.5 text-[10px] font-medium ${positive ? "text-emerald-600" : "text-rose-600"}`}>
        {positive ? "+" : ""}{move.toFixed(2)}% 24h
      </p>

      <div className="mt-3 rounded-xl bg-slate-50/85 px-2 py-2.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">Live market</p>
        <p className="mt-1 text-[9px] text-slate-400">Open for full regime analysis</p>
      </div>
    </Link>
  );
}
