"use client";

export type SortOption = "closest-to-flip" | "signal-strength" | "biggest-move" | "market-cap";

const SORT_LABELS: Record<SortOption, string> = {
  "closest-to-flip": "Closest to flip",
  "signal-strength": "Signal strength",
  "biggest-move": "Biggest move",
  "market-cap": "Market cap",
};

export default function SortControl({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="sort" className="text-gray-500">
        Sort by
      </label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700"
      >
        {Object.entries(SORT_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
