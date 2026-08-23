"use client";

import { useEffect, useState } from "react";

const KEY = "csl-watchlist-v1";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") as string[]; } catch { return []; }
}

export default function WatchlistButton({ coinId, compact = false }: { coinId: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => { setSaved(readIds().includes(coinId)); }, [coinId]);

  function toggle() {
    const ids = readIds();
    const next = ids.includes(coinId) ? ids.filter((id) => id !== coinId) : [...ids, coinId];
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(next.includes(coinId));
    window.dispatchEvent(new CustomEvent("csl-watchlist-change", { detail: next }));
  }

  return (
    <button type="button" onClick={toggle} aria-label={saved ? "Remove from watchlist" : "Add to watchlist"} aria-pressed={saved}
      className={`${compact ? "h-7 w-7 text-sm" : "h-8 w-8 text-base"} inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 ${saved ? "text-amber-500" : "text-slate-300 hover:text-slate-600"}`}>
      {saved ? "★" : "☆"}
    </button>
  );
}

export { KEY as WATCHLIST_KEY };
