"use client";

import { useMemo, useState } from "react";
import FilterPills from "@/components/FilterPills";
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

function SectionHeading({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <p className="csl-kicker text-[9px] tracking-[0.16em]">{kicker}</p>
      <h2 className="mt-1 text-[1.45rem] sm:text-[1.65rem]">{title}</h2>
      <p className="mt-1 text-[11px] leading-5 text-slate-500">{copy}</p>
    </div>
  );
}

export default function HomeClient({ coins, marketCoins = [], categories, updatedLabel }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("All coins");
  const [sort, setSort] = useState<SortOption>("closest-to-flip");
  const [scannerVisible, setScannerVisible] = useState(60);

  const eligible = useMemo(() => coins.filter((c) => !isStablecoin(c.id, c.symbol)), [coins]);
  const trackedIds = useMemo(() => new Set(eligible.map((c) => c.id)), [eligible]);

  const discovery = useMemo(() => {
    const base = activeCategory === "All coins" ? eligible : eligible.filter((c) => c.category === activeCategory);
    return sortCoins(base, sort);
  }, [eligible, activeCategory, sort]);

  const widerMarket = useMemo(() => marketCoins
    .filter((coin) => !isStablecoin(coin.id, coin.symbol))
    .filter((coin) => !trackedIds.has(coin.id))
    .sort((a, b) => (a.market_cap_rank ?? Number.MAX_SAFE_INTEGER) - (b.market_cap_rank ?? Number.MAX_SAFE_INTEGER)), [marketCoins, trackedIds]);

  const topSignals = useMemo(() => eligible.filter((c) => ["volatile", "awakening"].includes(getSignalTier(c))).sort((a, b) => b.confidencePct - a.confidencePct).slice(0, 5), [eligible]);
  const watching = useMemo(() => eligible.filter((c) => getSignalTier(c) === "building").sort((a, b) => a.confidencePct - b.confidencePct).slice(0, 5), [eligible]);

  return (
    <div className="mx-auto max-w-[1320px] space-y-7 px-4 sm:px-5">
      <MarketRegimeSummary coins={coins} updatedLabel={updatedLabel} />

      {topSignals.length > 0 && (
        <section className="csl-signal-section csl-signal-section-top">
          <SectionHeading kicker="Signal intelligence" title="Top signals" copy="Strongest regime signals across the market." />
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">{topSignals.map((c) => <ScannerCard key={c.id} coin={c} />)}</div>
        </section>
      )}

      {watching.length > 0 && (
        <section className="csl-signal-section csl-signal-section-early">
          <SectionHeading kicker="Transition watch" title="Early signals" copy="Assets showing the earliest signs of a regime shift." />
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">{watching.map((c) => <ScannerCard key={c.id} coin={c} />)}</div>
        </section>
      )}

      <section className="csl-market-browser">
        <SectionHeading kicker="Market discovery" title="Top 30 discovery" copy="The tracked leaders, compact enough to scan quickly without losing the signal." />
        <div className="mx-auto mt-3 flex max-w-[1180px] flex-col gap-2 rounded-xl border border-slate-200/70 bg-white/70 p-2 shadow-[0_5px_18px_rgba(20,35,75,0.03)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"><FilterPills categories={categories} active={activeCategory} onChange={setActiveCategory} /><div className="self-end sm:self-auto"><SortControl value={sort} onChange={setSort} /></div></div>
        {discovery.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">No coins in this category yet.</p>
        ) : (
          <div className="mx-auto mt-3 grid max-w-[1240px] grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">{discovery.map((c) => <ScannerCard key={c.id} coin={c} />)}</div>
        )}
      </section>

      {widerMarket.length > 0 && (
        <section className="pb-8 pt-1">
          <SectionHeading kicker="Beyond the tracked leaders" title="Wider market" copy="Live coverage beyond the tracked signal set. Open any asset for full regime analysis." />
          <div className="mx-auto mt-3 grid max-w-[1280px] grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{widerMarket.slice(0, scannerVisible).map((c) => <MarketBreadthCard key={c.id} coin={c} />)}</div>
          {scannerVisible < widerMarket.length && (
            <div className="mt-5 text-center"><button onClick={() => setScannerVisible((v) => v + 60)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">Load 60 more</button><p className="mt-1.5 text-[9px] text-slate-400">Showing {Math.min(scannerVisible, widerMarket.length)} of {widerMarket.length} wider-market assets</p></div>
          )}
        </section>
      )}
    </div>
  );
}
