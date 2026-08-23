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
    <label htmlFor="sort" className="flex items-center gap-2 rounded-xl bg-slate-100/70 p-1.5 pl-3 text-xs font-medium text-slate-500">
      <span>Sort</span>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-[0_3px_10px_rgba(20,35,75,0.05)] outline-none"
      >
        {Object.entries(SORT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </label>
  );
}
