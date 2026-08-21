"use client";

import { useMemo, useState } from "react";
import FilterPills from "@/components/FilterPills";
import CoinCard from "@/components/CoinCard";
import { Coin } from "@/types/coin";

interface HomeClientProps {
  coins: Coin[];
  categories: string[];
}

export default function HomeClient({ coins, categories }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("All coins");

  const filteredCoins = useMemo(() => {
    if (activeCategory === "All coins") return coins;
    return coins.filter((coin) => coin.category === activeCategory);
  }, [coins, activeCategory]);

  return (
    <>
      <div className="mx-auto max-w-6xl px-6">
        <FilterPills categories={categories} active={activeCategory} onChange={setActiveCategory} />
      </div>
      <main className="mx-auto max-w-6xl px-6 py-6">
        {filteredCoins.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            No coins in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredCoins.map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
