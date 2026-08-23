"use client";

import { useMemo, useState } from "react";
import FilterPills from "@/components/FilterPills";
import CoinCard from "@/components/CoinCard";
import MarketRegimeSummary from "@/components/MarketRegimeSummary";
import SortControl, { SortOption } from "@/components/SortControl";
import { Coin } from "@/types/coin";
import { getSignalTier } from "@/lib/tiers";
import { isStablecoin } from "@/lib/categories";

interface HomeClientProps {
  coins: Coin[];
  categories: string[];
  updatedLabel?: string;
}

function sortCoins(coins: Coin[], sort: SortOption): Coin[] {
  const sorted = [...coins];
  switch (sort) {
    case "signal-strength":
      return sorted.sort((a, b) => b.confidencePct - a.confidencePct);
    case "biggest-move":
      return sorted.sort((a, b) => Math.abs(b.change24hPct) - Math.abs(a.change24hPct));
    case "market-cap":
      return sorted.sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
    case "closest-to-flip":
    default:
      return sorted.sort((a, b) => a.medianDaysToFlip - b.medianDaysToFlip);
  }
}

export default function HomeClient({ coins, categories, updatedLabel }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("All coins");
  const [sort, setSort] = useState<SortOption>("closest-to-flip");

  const filteredCoins = useMemo(() => {
    const eligibleCoins = coins.filter((coin) => !isStablecoin(coin.id, coin.symbol));
    const base = activeCategory === "All coins" ? eligibleCoins : eligibleCoins.filter((c) => c.category === activeCategory);
    return sortCoins(base, sort);
  }, [coins, activeCategory, sort]);

  const topSignals = useMemo(() => {
    return coins.filter((coin) => !isStablecoin(coin.id, coin.symbol))
      .filter((c) => getSignalTier(c) === "volatile" || getSignalTier(c) === "awakening")
      .sort((a, b) => b.confidencePct - a.confidencePct)
      .slice(0, 4);
  }, [coins]);

  const watching = useMemo(() => {
    return coins.filter((coin) => !isStablecoin(coin.id, coin.symbol))
      .filter((c) => getSignalTier(c) === "building")
      .sort((a, b) => a.confidencePct - b.confidencePct)
      .slice(0, 3);
  }, [coins]);

  return (
    <div className="mx-auto max-w-[1240px] space-y-10 px-5 sm:px-6">
      <MarketRegimeSummary coins={coins} updatedLabel={updatedLabel} />

      {topSignals.length > 0 && (
        <section className="csl-signal-section csl-signal-section-top">
          <div className="mx-auto max-w-2xl text-center">
            <p className="csl-kicker">Signal intelligence</p>
            <h2 className="mt-1">Top signals</h2>
            <p className="mt-2 text-sm text-slate-500">Strongest regime signals across the market.</p>
          </div>
          <div className="csl-signal-grid mt-7">
            {topSignals.map((coin) => <CoinCard key={coin.id} coin={coin} />)}
          </div>
        </section>
      )}

      {watching.length > 0 && (
        <section className="csl-signal-section csl-signal-section-early">
          <div className="mx-auto max-w-2xl text-center">
            <p className="csl-kicker">Transition watch</p>
            <h2 className="mt-1">Early signals</h2>
            <p className="mt-2 text-sm text-slate-500">Assets showing the earliest signs of a regime shift.</p>
          </div>
          <div className="csl-transition-radar mt-7">
            {watching.map((coin, index) => (
              <div key={coin.id} className="csl-radar-candidate">
                <span className="csl-radar-rank">0{index + 1}</span>
                <CoinCard coin={coin} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="csl-market-browser pb-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="csl-kicker">Market discovery</p>
          <h2 className="mt-1">Explore the market</h2>
          <p className="mt-2 text-sm text-slate-500">Scan the market and discover where momentum is forming.</p>
        </div>

        <div className="mx-auto mt-7 flex max-w-5xl flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-[0_10px_30px_rgba(20,35,75,0.04)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <FilterPills categories={categories} active={activeCategory} onChange={setActiveCategory} />
          <div className="self-end sm:self-auto"><SortControl value={sort} onChange={setSort} /></div>
        </div>

        {filteredCoins.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">No coins in this category yet.</p>
        ) : (
          <div className="mx-auto mt-5 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCoins.map((coin) => <CoinCard key={coin.id} coin={coin} />)}
          </div>
        )}
      </section>
    </div>
  );
}
