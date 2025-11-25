"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { categories } from "@/constants/treatment/sample-data";
import type { Treatment } from "@/constants/treatment/types";
import { buildInfoLine } from "@/constants/treatment/types";
import CategorySection from "../_demo/CategorySection";

type Locale = "ko" | "en";

export default function TreatmentListPage() {
  const searchParams = useSearchParams();
  const categoryKey = searchParams.get("category");
  const locale = (searchParams.get("locale") || "ko") as Locale;

  // URL parameter로 전달받은 category 찾기
  const selectedCategory = React.useMemo(() => {
    return categories.find(cat => cat.category_key === categoryKey);
  }, [categoryKey]);

  // 더미 핸들러들 (현재는 콘솔 로그만)
  const handleSelect = React.useCallback((treatment: Treatment) => {
    log.debug('Treatment selected:', treatment.id);
  }, []);

  const handleBook = React.useCallback((treatment: Treatment) => {
    log.debug('Book treatment:', treatment.id);
  }, []);

  const handleContact = React.useCallback(() => {
    log.debug('Contact clicked');
  }, []);

  if (!selectedCategory) {
    return (
      <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
          <p className="text-gray-600 mt-2">Please select a valid category.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
      {/* Category header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          {selectedCategory[locale]}
        </h1>
        {/* <p className="mt-3 text-base sm:text-lg text-gray-600">
          {selectedCategory.concern_copy[locale]}
        </p> */}
      </div>

      {/* Areas horizontal list */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#8B4513] mb-4">Treatment Areas</h2>
        <div className="flex flex-wrap gap-2">
          {selectedCategory.areas.map((area) => (
            <div
              key={area.key}
              className="px-4 py-2 bg-gradient-to-br from-[#FDF5F0] to-[#F8E8E0] rounded-full border border-[#E8B4A0]/30 text-[#8B4513] text-sm font-medium"
            >
              {area[locale]}
            </div>
          ))}
        </div>
      </div>

      {/* Treatments cards display */}
      <CategorySection
        category={selectedCategory}
        locale={locale}
        onSelect={handleSelect}
        onBook={handleBook}
        onContact={handleContact}
        buildInfoLine={buildInfoLine}
      />
    </div>
  );
}