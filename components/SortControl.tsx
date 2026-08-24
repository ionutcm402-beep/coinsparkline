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
    <label htmlFor="sort" className="flex w-full items-center gap-2 rounded-[18px] border border-slate-200/70 bg-slate-50/85 p-1.5 pl-3.5 text-[11px] font-semibold text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,.9)] sm:w-auto sm:text-xs">
      <span className="shrink-0">Sort</span>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="min-h-11 min-w-0 flex-1 rounded-[14px] border border-slate-200/70 bg-white px-3.5 py-2 text-[11px] font-bold text-slate-900 shadow-[0_6px_18px_rgba(15,23,42,0.06)] outline-none transition focus:border-indigo-200 focus:ring-2 focus:ring-indigo-100 sm:min-h-9 sm:flex-none sm:text-xs"
      >
        {Object.entries(SORT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </label>
  );
}
