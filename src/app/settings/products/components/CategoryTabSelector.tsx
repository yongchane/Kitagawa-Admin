"use client";

import { Level2Category } from "@/api/products";

interface CategoryTabSelectorProps {
  categories: Level2Category[];
  selectedCategory: Level2Category | null;
  onSelectCategory: (category: Level2Category) => void;
}

export default function CategoryTabSelector({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryTabSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-gray-700 mb-3">
        중간 카테고리 설정 (필수)
      </h3>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onSelectCategory(category)}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
              selectedCategory?._id === category._id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400"
            }`}
          >
            {category.nameKo || category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
