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
    const eligibleCoins = coins.filter((coin) => !isStablecoin(coin.id));
    const base = activeCategory === "All coins" ? eligibleCoins : eligibleCoins.filter((c) => c.category === activeCategory);
    return sortCoins(base, sort);
  }, [coins, activeCategory, sort]);

  // Top signals: highest-confidence awakening/volatile coins -- the ones
  // actually showing meaningful movement right now.
  const topSignals = useMemo(() => {
    return coins.filter((coin) => !isStablecoin(coin.id))
      .filter((c) => getSignalTier(c) === "volatile" || getSignalTier(c) === "awakening")
      .sort((a, b) => b.confidencePct - a.confidencePct)
      .slice(0, 4);
  }, [coins]);

  // Watching: calm coins with the LOWEST confidence -- genuinely closest to
  // a real regime flip, based on the same real confidence score.
  const watching = useMemo(() => {
    return coins.filter((coin) => !isStablecoin(coin.id))
      .filter((c) => getSignalTier(c) === "building")
      .sort((a, b) => a.confidencePct - b.confidencePct)
      .slice(0, 4);
  }, [coins]);

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-6">
      <MarketRegimeSummary coins={coins} updatedLabel={updatedLabel} />

      {topSignals.length > 0 && (
        <section className="csl-signal-section csl-signal-section-top">
          <div className="csl-signal-section-heading"><div><p className="csl-kicker">Signal intelligence</p><h2>Top signals</h2><p>Strongest regime signals across the market.</p></div></div>
          <div className="csl-signal-grid">
            {topSignals.map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        </section>
      )}

      {watching.length > 0 && (
        <section className="csl-signal-section csl-signal-section-early">
          <div className="csl-signal-section-heading"><div><p className="csl-kicker">Transition watch</p><h2>Early signals</h2><p>Assets showing the earliest signs of a regime shift.</p></div></div>
          <div className="csl-signal-grid">
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
