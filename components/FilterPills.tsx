"use client";

interface FilterPillsProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function FilterPills({ categories, active, onChange }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100/70 p-1.5">
      {categories.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={isActive
              ? "rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-[0_4px_12px_rgba(20,35,75,0.07)] ring-1 ring-slate-200/70 transition-all"
              : "rounded-lg px-3.5 py-2 text-xs font-medium text-slate-500 transition-all hover:bg-white/75 hover:text-slate-900"}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
