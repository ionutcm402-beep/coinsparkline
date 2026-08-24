"use client";

interface FilterPillsProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function FilterPills({ categories, active, onChange }: FilterPillsProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-1.5 rounded-2xl bg-slate-100/75 p-1.5 sm:flex sm:w-auto sm:flex-wrap">
      {categories.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={isActive
              ? "min-h-10 rounded-xl bg-slate-950 px-3.5 py-2 text-[11px] font-bold text-white shadow-[0_5px_14px_rgba(15,23,42,0.14)] transition-all sm:min-h-0 sm:bg-white sm:text-xs sm:text-slate-900 sm:ring-1 sm:ring-slate-200/70"
              : "min-h-10 rounded-xl px-3.5 py-2 text-[11px] font-semibold text-slate-500 transition-all hover:bg-white/80 hover:text-slate-900 sm:min-h-0 sm:text-xs"}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
