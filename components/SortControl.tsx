"use client";

export type SortOption = "closest-to-flip" | "signal-strength" | "biggest-move" | "market-cap";

const SORT_LABELS: Record<SortOption, string> = {
  "closest-to-flip": "Closest to flip",
  "signal-strength": "Signal strength",
  "biggest-move": "Biggest move",
  "market-cap": "Market cap",
};

export default function SortControl({ value, onChange }: { value: SortOption; onChange: (value: SortOption) => void }) {
  return (
    <label htmlFor="sort" className="flex w-full items-center gap-2 rounded-2xl bg-slate-100/75 p-1.5 pl-3 text-[11px] font-semibold text-slate-500 sm:w-auto sm:text-xs">
      <span className="shrink-0">Sort</span>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-[11px] font-bold text-slate-800 shadow-[0_3px_10px_rgba(20,35,75,0.05)] outline-none sm:min-h-0 sm:flex-none sm:text-xs"
      >
        {Object.entries(SORT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </label>
  );
}
