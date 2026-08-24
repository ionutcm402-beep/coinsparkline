"use client";

interface FilterPillsProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function FilterPills({ categories, active, onChange }: FilterPillsProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-1 rounded-[18px] border border-slate-200/70 bg-slate-50/85 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.9)] sm:flex sm:w-auto sm:flex-wrap">
      {categories.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={isActive
              ? "min-h-11 rounded-[14px] bg-white px-4 py-2 text-[11px] font-bold text-slate-950 shadow-[0_6px_18px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 transition-all hover:-translate-y-px sm:min-h-9 sm:text-xs"
              : "min-h-11 rounded-[14px] px-4 py-2 text-[11px] font-semibold text-slate-500 transition-all hover:-translate-y-px hover:bg-white/80 hover:text-slate-900 sm:min-h-9 sm:text-xs"}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
