"use client";

interface FilterPillsProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function FilterPills({ categories, active, onChange }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-6">
      {categories.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={
              isActive
                ? "rounded-full border border-blue-50 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 transition-colors"
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
