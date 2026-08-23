"use client";

import { useMemo, useState } from "react";
import FilterPills from "@/components/FilterPills";
import CoinCard from "@/components/CoinCard";
import ScannerCard from "@/components/ScannerCard";
import MarketBreadthCard, { MarketBreadthCoin } from "@/components/MarketBreadthCard";
import MarketRegimeSummary from "@/components/MarketRegimeSummary";
import SortControl, { SortOption } from "@/components/SortControl";
import { Coin } from "@/types/coin";
import { getSignalTier } from "@/lib/tiers";
import { isStablecoin } from "@/lib/categories";

interface HomeClientProps {
  coins: Coin[];
  marketCoins?: MarketBreadthCoin[];
  categories: string[];
  updatedLabel?: string;
}

function sortCoins(coins: Coin[], sort: SortOption): Coin[] {
  const sorted = [...coins];
  switch (sort) {
    case "signal-strength": return sorted.sort((a, b) => b.confidencePct - a.confidencePct);
    case "biggest-move": return sorted.sort((a, b) => Math.abs(b.change24hPct) - Math.abs(a.change24hPct));
    case "market-cap": return sorted.sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
    default: return sorted.sort((a, b) => a.medianDaysToFlip - b.medianDaysToFlip);
  }
}

export default function HomeClient({ coins, marketCoins = [], categories, updatedLabel }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("All coins");
  const [sort, setSort] = useState<SortOption>("closest-to-flip");
  const [scannerVisible, setScannerVisible] = useState(50);

  const eligible = useMemo(() => coins.filter((c) => !isStablecoin(c.id, c.symbol)), [coins]);
  const trackedIds = useMemo(() => new Set(eligible.map((c) => c.id)), [eligible]);

  const discovery = useMemo(() => {
    const base = activeCategory === "All coins" ? eligible : eligible.filter((c) => c.category === activeCategory);
    return sortCoins(base, sort);
  }, [eligible, activeCategory, sort]);

  const widerMarket = useMemo(() => {
    return marketCoins
      .filter((coin) => !isStablecoin(coin.id, coin.symbol))
      .filter((coin) => !trackedIds.has(coin.id))
      .sort((a, b) => (a.market_cap_rank ?? Number.MAX_SAFE_INTEGER) - (b.market_cap_rank ?? Number.MAX_SAFE_INTEGER));
  }, [marketCoins, trackedIds]);

  const topSignals = useMemo(() => eligible.filter((c) => ["volatile", "awakening"].includes(getSignalTier(c))).sort((a, b) => b.confidencePct - a.confidencePct).slice(0, 4), [eligible]);
  const watching = useMemo(() => eligible.filter((c) => getSignalTier(c) === "building").sort((a, b) => a.confidencePct - b.confidencePct).slice(0, 3), [eligible]);

  return (
    <div className="mx-auto max-w-[1240px] space-y-10 px-5 sm:px-6">
      <MarketRegimeSummary coins={coins} updatedLabel={updatedLabel} />

      {topSignals.length > 0 && (
        <section className="csl-signal-section csl-signal-section-top">
          <div className="mx-auto max-w-2xl text-center"><p className="csl-kicker">Signal intelligence</p><h2 className="mt-1">Top signals</h2><p className="mt-2 text-sm text-slate-500">Strongest regime signals across the market.</p></div>
          <div className="csl-signal-grid mt-7">{topSignals.map((c) => <CoinCard key={c.id} coin={c} />)}</div>
        </section>
      )}

      {watching.length > 0 && (
        <section className="csl-signal-section csl-signal-section-early">
          <div className="mx-auto max-w-2xl text-center"><p className="csl-kicker">Transition watch</p><h2 className="mt-1">Early signals</h2><p className="mt-2 text-sm text-slate-500">Assets showing the earliest signs of a regime shift.</p></div>
          <div className="csl-transition-radar mt-7">{watching.map((c, i) => <div key={c.id} className="csl-radar-candidate"><span className="csl-radar-rank">0{i + 1}</span><CoinCard coin={c} /></div>)}</div>
        </section>
      )}

      <section className="csl-market-browser">
        <div className="mx-auto max-w-2xl text-center"><p className="csl-kicker">Market discovery</p><h2 className="mt-1">Top 30 discovery</h2><p className="mt-2 text-sm text-slate-500">The tracked leaders, compact enough to scan quickly without losing the signal.</p></div>
        <div className="mx-auto mt-7 flex max-w-5xl flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-[0_10px_30px_rgba(20,35,75,0.04)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"><FilterPills categories={categories} active={activeCategory} onChange={setActiveCategory} /><div className="self-end sm:self-auto"><SortControl value={sort} onChange={setSort} /></div></div>
        {discovery.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">No coins in this category yet.</p>
        ) : (
          <div className="mx-auto mt-5 grid max-w-[1160px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{discovery.map((c) => <ScannerCard key={c.id} coin={c} />)}</div>
        )}
      </section>

      {widerMarket.length > 0 && (
        <section className="pb-12 pt-2">
          <div className="mx-auto max-w-2xl text-center"><p className="csl-kicker">Beyond the tracked leaders</p><h2 className="mt-1">Wider market</h2><p className="mt-2 text-sm text-slate-500">Live market coverage beyond the tracked signal set. Open any asset for a full on-demand regime analysis.</p></div>
          <div className="mx-auto mt-5 grid max-w-[1160px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{widerMarket.slice(0, scannerVisible).map((c) => <MarketBreadthCard key={c.id} coin={c} />)}</div>
          {scannerVisible < widerMarket.length && (
            <div className="mt-7 text-center"><button onClick={() => setScannerVisible((v) => v + 50)} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">Load 50 more</button><p className="mt-2 text-[10px] text-slate-400">Showing {Math.min(scannerVisible, widerMarket.length)} of {widerMarket.length} wider-market assets</p></div>
          )}
        </section>
      )}
    </div>
  );
}
