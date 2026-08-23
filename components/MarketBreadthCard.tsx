"use client";

import Link from "next/link";
import CurrencyAmount from "@/components/CurrencyAmount";
import WatchlistButton from "@/components/WatchlistButton";

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
    <article className="group relative rounded-[14px] border border-slate-200/70 bg-white/84 text-center shadow-[0_5px_16px_rgba(20,35,75,0.03)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_24px_rgba(20,35,75,0.07)]">
      <div className="absolute right-2 top-2 z-10"><WatchlistButton coinId={coin.id} compact /></div>
      <Link href={`/coin/${coin.id}`} className="block p-3 pt-3.5">
        <div className="flex items-center justify-center gap-2 pr-7">
          {coin.image ? <img src={coin.image} alt="" className="h-6 w-6 rounded-full object-contain" /> : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[7px] font-bold text-slate-500">{coin.symbol.slice(0, 3).toUpperCase()}</span>}
          <div className="min-w-0 text-left"><p className="truncate text-[12px] font-semibold leading-none text-slate-900">{coin.name}</p><p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-slate-400">{coin.symbol.toUpperCase()} · #{coin.market_cap_rank ?? "—"}</p></div>
        </div>
        <p className="mt-2.5 truncate text-[15px] font-semibold leading-none tracking-[-0.03em] text-slate-950"><CurrencyAmount usd={coin.current_price} /></p>
        <p className={`mt-1 text-[9px] font-medium ${positive ? "text-emerald-600" : "text-rose-600"}`}>{positive ? "+" : ""}{move.toFixed(2)}% 24h</p>
        <div className="mt-2.5 rounded-lg bg-slate-50/85 px-2 py-1.5"><div className="flex items-center justify-between gap-2"><p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-500">Live</p><p className="text-[8px] text-slate-400">Analyse ↗</p></div></div>
      </Link>
    </article>
  );
}
