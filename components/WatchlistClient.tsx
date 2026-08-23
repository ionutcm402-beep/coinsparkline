"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CurrencyAmount from "@/components/CurrencyAmount";
import WatchlistButton, { WATCHLIST_KEY } from "@/components/WatchlistButton";

export interface WatchlistItem {
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  change24h: number;
  rank: number | null;
  regime?: string;
  confidence?: number;
}

export default function WatchlistClient({ items }: { items: WatchlistItem[] }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const read = () => {
      try { setIds(JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]")); } catch { setIds([]); }
    };
    read();
    window.addEventListener("csl-watchlist-change", read as EventListener);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener("csl-watchlist-change", read as EventListener); window.removeEventListener("storage", read); };
  }, []);

  const saved = useMemo(() => ids.map(id => items.find(item => item.id === id)).filter(Boolean) as WatchlistItem[], [ids, items]);

  if (saved.length === 0) return (
    <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="text-3xl text-amber-400">☆</div>
      <h2 className="mt-3 text-xl font-semibold">Your watchlist is empty</h2>
      <p className="mt-2 text-xs leading-5 text-slate-500">Tap the star on any coin in Market Discovery, Wider Market or the coin page. Your list is saved on this device — no account required.</p>
      <Link href="/" className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">Browse the market</Link>
    </div>
  );

  return <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">{saved.map(item => {
    const positive=item.change24h>=0;
    return <article key={item.id} className="relative rounded-2xl border border-slate-200/75 bg-white p-4 shadow-[0_6px_20px_rgba(20,35,75,0.035)]">
      <div className="absolute right-3 top-3"><WatchlistButton coinId={item.id} compact /></div>
      <Link href={`/coin/${item.id}`} className="block pr-8">
        <div className="flex items-center gap-3">{item.image?<img src={item.image} alt="" className="h-9 w-9 rounded-full object-contain"/>:<span className="h-9 w-9 rounded-full bg-slate-100"/>}<div><p className="text-sm font-semibold text-slate-900">{item.name}</p><p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">{item.symbol} {item.rank?`· #${item.rank}`:""}</p></div></div>
        <div className="mt-4 flex items-end justify-between gap-4"><div><p className="text-lg font-semibold tracking-tight"><CurrencyAmount usd={item.price}/></p><p className={`mt-1 text-[10px] font-medium ${positive?"text-emerald-600":"text-rose-600"}`}>{positive?"+":""}{item.change24h.toFixed(2)}% 24h</p></div><div className="text-right">{item.regime?<><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{item.regime}</p><p className="mt-1 text-[10px] text-slate-400">{item.confidence?.toFixed(0)}% signal</p></>:<><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Live market</p><p className="mt-1 text-[10px] text-slate-400">Open to analyse</p></>}</div></div>
      </Link>
    </article>
  })}</div>;
}
