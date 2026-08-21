"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FilterPills from "@/components/FilterPills";
import CoinCard from "@/components/CoinCard";
import { mockCoins, categories } from "@/lib/mockData";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All coins");

  const filteredCoins = useMemo(() => {
    if (activeCategory === "All coins") return mockCoins;
    return mockCoins.filter((coin) => coin.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="flex-1 bg-gray-50">
      <Header />
      <Hero />
      <FilterPills categories={categories} active={activeCategory} onChange={setActiveCategory} />

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
    </div>
  );
}
