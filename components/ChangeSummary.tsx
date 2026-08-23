"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CurrencyAmount from "@/components/CurrencyAmount";
import { Coin } from "@/types/coin";
import { getSignalTier, SignalTier, TIER_CONFIG } from "@/lib/tiers";
import { getSparkScore } from "@/lib/sparkScore";
import { isStablecoin } from "@/lib/categories";

interface Props {
  coins: Coin[];
  previousCoins?: Coin[];
  previousScannedAt?: string;
}

type ChangeKey = "awakening" | "volatile" | "heated" | "cooled";
type ChangeRow = {
  current: Coin;
  now: SignalTier;
  before: SignalTier;
  delta: number;
  confidenceDelta: number;
};

const LEVEL: Record<SignalTier, number> = { calm: 0, building: 1, awakening: 2, volatile: 3 };
const styles = {
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
  orange: "bg-orange-50 text-orange-600",
  blue: "bg-blue-50 text-blue-600",
} as const;

const cards: Array<{ key: ChangeKey; label: string; icon: string; color: keyof typeof styles }> = [
  { key: "awakening", label: "Entered Awakening", icon: "↑", color: "emerald" },
  { key: "volatile", label: "Entered Volatile", icon: "↘", color: "rose" },
  { key: "heated", label: "Heated Up", icon: "↗", color: "orange" },
  { key: "cooled", label: "Cooled Down", icon: "↓", color: "blue" },
];

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ChangeSummary({ coins, previousCoins = [], previousScannedAt }: Props) {
  const [selected, setSelected] = useState<ChangeKey | null>(null);

  const groups = useMemo(() => {
    const oldMap = new Map(previousCoins.map((coin) => [coin.id, coin] as const));
    const rows: ChangeRow[] = coins
      .filter((coin) => !isStablecoin(coin.id, coin.symbol))
      .flatMap((current) => {
        const old = oldMap.get(current.id);
        if (!old) return [];
        const now = getSignalTier(current);
        const before = getSignalTier(old);
        return [{
          current,
          now,
          before,
          delta: LEVEL[now] - LEVEL[before],
          confidenceDelta: current.confidencePct - old.confidencePct,
        }];
      });

    return {
      awakening: rows.filter((row) => row.now === "awakening" && row.before !== "awakening"),
      volatile: rows.filter((row) => row.now === "volatile" && row.before !== "volatile"),
      heated: rows.filter((row) => row.delta > 0),
      cooled: rows.filter((row) => row.delta < 0),
    };
  }, [coins, previousCoins]);

  const activeRows = selected ? groups[selected] : [];
  const activeCard = selected ? cards.find((card) => card.key === selected) : undefined;

  return (
    <section className="mx-auto mt-3 max-w-[1390px] px-3 sm:px-5">
      <div className="rounded-[16px] border border-slate-200/70 bg-white/84 p-4 shadow-[0_6px_20px_rgba(20,35,75,.03)]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[13px] font-extrabold uppercase tracking-[.015em] text-slate-950 sm:text-[14px]">What changed today?</div>
          <span className="text-[10px] font-medium text-slate-400">
            {previousScannedAt ? `vs ${new Date(previousScannedAt).toLocaleDateString()}` : "Waiting for next saved scan"}
          </span>
        </div>

        {previousCoins.length ? (
          <>
            <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {cards.map((card) => {
                const count = groups[card.key].length;
                const isActive = selected === card.key;
                return (
                  <button
                    key={card.key}
                    type="button"
                    disabled={count === 0}
                    onClick={() => setSelected(isActive ? null : card.key)}
                    aria-expanded={isActive}
                    className={`rounded-xl border px-3 py-3 text-left transition ${count === 0 ? "cursor-default border-slate-200/70 bg-white opacity-65" : "cursor-pointer border-slate-200/70 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"} ${isActive ? "ring-2 ring-slate-200" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${styles[card.color]}`}>{card.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-900">{card.label}</p>
                        <p className="text-[10px] text-slate-500">{count} {count === 1 ? "coin" : "coins"}</p>
                        {count > 0 && <p className="mt-0.5 text-[8px] font-semibold text-slate-400">{isActive ? "Hide coins ↑" : "View coins →"}</p>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selected && activeCard && activeRows.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-900">{activeCard.label}</p>
                    <p className="text-[8px] text-slate-400">Coins that changed between the last two saved scans</p>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="rounded-full px-2 py-1 text-[10px] font-semibold text-slate-400 hover:bg-white hover:text-slate-700">✕</button>
                </div>

                <div className="divide-y divide-slate-200">
                  {activeRows.map((row) => {
                    const spark = getSparkScore(row.current);
                    const cfg = TIER_CONFIG[row.now];
                    return (
                      <Link key={row.current.id} href={`/coin/${row.current.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-white/70 px-3 py-3 transition hover:bg-white sm:grid-cols-[minmax(0,1.3fr)_minmax(150px,.8fr)_90px_80px]">
                        <div className="flex min-w-0 items-center gap-2.5">
                          {row.current.logoUrl ? <img src={row.current.logoUrl} alt="" className="h-7 w-7 rounded-full" /> : <span className="h-7 w-7 rounded-full bg-slate-100" />}
                          <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold text-slate-900">{row.current.name} <span className="uppercase text-slate-400">{row.current.symbol}</span></p>
                            <p className="text-[8px] text-slate-400">Open coin analysis →</p>
                          </div>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-[8px] uppercase tracking-wide text-slate-400">Regime change</p>
                          <p className="mt-0.5 text-[9px] font-semibold text-slate-700">{titleCase(row.before)} → <span className={cfg.text}>{titleCase(row.now)}</span></p>
                        </div>
                        <div className="hidden text-right sm:block">
                          <p className="text-[8px] uppercase tracking-wide text-slate-400">Price</p>
                          <p className="mt-0.5 text-[9px] font-semibold text-slate-800"><CurrencyAmount usd={row.current.price} /></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] uppercase tracking-wide text-slate-400">Spark</p>
                          <p className="mt-0.5 text-[10px] font-bold text-slate-900">{spark.score}</p>
                          <p className={`text-[8px] font-semibold ${row.confidenceDelta >= 0 ? "text-emerald-600" : "text-blue-600"}`}>{row.confidenceDelta >= 0 ? "+" : ""}{row.confidenceDelta.toFixed(0)} conf.</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="mt-3 rounded-xl bg-slate-50 p-5 text-center text-[10px] text-slate-400">Waiting for the next saved scan.</p>
        )}
      </div>
    </section>
  );
}
