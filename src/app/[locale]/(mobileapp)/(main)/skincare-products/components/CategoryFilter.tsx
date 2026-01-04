'use client';

import { ChevronDown } from 'lucide-react';

interface SubCategory {
  value: string;
  label_ko: string;
  count: number;
}

interface Category {
  mainCategory: string;
  label_ko: string;
  count: number;
  subcategories: SubCategory[];
}

interface CategoryFilterProps {
  categories: Category[];
  subcategories: SubCategory[];
  mainCategory: string | null;
  subCategory: string | null;
  onMainCategoryChange: (value: string | null) => void;
  onSubCategoryChange: (value: string | null) => void;
  allLabel: string;
  locale: string;
}

const text = {
  ko: {
    mainCategory: '대분류',
    subCategory: '세부분류',
  },
  en: {
    mainCategory: 'Category',
    subCategory: 'Subcategory',
  },
};

export default function CategoryFilter({
  categories,
  subcategories,
  mainCategory,
  subCategory,
  onMainCategoryChange,
  onSubCategoryChange,
  allLabel,
  locale,
}: CategoryFilterProps) {
  const t = text[locale as keyof typeof text] || text.en;

  return (
    <div className="flex gap-2">
      {/* Main Category 드롭다운 (대분류) */}
      <div className="relative flex-1">
        <select
          value={mainCategory || ''}
          onChange={(e) => onMainCategoryChange(e.target.value || null)}
          className="w-full appearance-none bg-gray-100 text-sm py-2.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 cursor-pointer"
        >
          <option value="">{t.mainCategory} ({allLabel})</option>
          {categories.map((cat) => (
            <option key={cat.mainCategory} value={cat.mainCategory}>
              {cat.label_ko} ({cat.count})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>

      {/* Sub Category 드롭다운 (세부분류 = category1) */}
      <div className="relative flex-1">
        <select
          value={subCategory || ''}
          onChange={(e) => onSubCategoryChange(e.target.value || null)}
          disabled={!mainCategory}
          className="w-full appearance-none bg-gray-100 text-sm py-2.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{t.subCategory} ({allLabel})</option>
          {subcategories.map((sub) => (
            <option key={sub.value} value={sub.value}>
              {sub.label_ko} ({sub.count})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}
