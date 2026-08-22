"use client";

interface FilterPillsProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function FilterPills({ categories, active, onChange }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={
              isActive
                ? "rounded-full border border-transparent bg-gradient-to-r from-[#2563eb] to-[#8b5cf6] px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors"
                : "rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
            }
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
