"use client";

import { useMemo, useState } from "react";
import FilterPills from "@/components/FilterPills";
import CoinCard from "@/components/CoinCard";
import MarketRegimeSummary from "@/components/MarketRegimeSummary";
import SortControl, { SortOption } from "@/components/SortControl";
import { Coin } from "@/types/coin";
import { getSignalTier } from "@/lib/tiers";

interface HomeClientProps {
  coins: Coin[];
  categories: string[];
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

export default function HomeClient({ coins, categories }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("All coins");
  const [sort, setSort] = useState<SortOption>("closest-to-flip");

  const filteredCoins = useMemo(() => {
    const base = activeCategory === "All coins" ? coins : coins.filter((c) => c.category === activeCategory);
    return sortCoins(base, sort);
  }, [coins, activeCategory, sort]);

  // Top signals: highest-confidence awakening/volatile coins -- the ones
  // actually showing meaningful movement right now.
  const topSignals = useMemo(() => {
    return [...coins]
      .filter((c) => getSignalTier(c) === "volatile" || getSignalTier(c) === "awakening")
      .sort((a, b) => b.confidencePct - a.confidencePct)
      .slice(0, 4);
  }, [coins]);

  // Watching: calm coins with the LOWEST confidence -- genuinely closest to
  // a real regime flip, based on the same real confidence score.
  const watching = useMemo(() => {
    return [...coins]
      .filter((c) => getSignalTier(c) === "building")
      .sort((a, b) => a.confidencePct - b.confidencePct)
      .slice(0, 4);
  }, [coins]);

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-6">
      <MarketRegimeSummary coins={coins} />

      {topSignals.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">⚡ Top signals</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {topSignals.map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        </section>
      )}

      {watching.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">👀 Watching</h2>
          <p className="-mt-2 mb-3 text-xs text-gray-400">
            Calm coins with the lowest model confidence -- statistically closest to a regime change.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {watching.map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <FilterPills categories={categories} active={activeCategory} onChange={setActiveCategory} />
          <SortControl value={sort} onChange={setSort} />
        </div>

        {filteredCoins.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">No coins in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredCoins.map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
