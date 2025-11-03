"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useAllTreatmentCategories } from "@/hooks/useTreatmentData";
import type { TreatmentCategoryResponse, Locale } from "@/app/models/treatmentData.dto";
import { buildInfoLine } from "../../../../constants/treatment/types";
import type { Treatment } from "../../../../constants/treatment/types";
import CategorySection from "../_demo/CategorySection";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function TreatmentListPage() {
  const searchParams = useSearchParams();
  const categoryKey = searchParams.get("category");
  const locale = (searchParams.get("locale") || "ko") as Locale;

  // Fetch treatment categories from database
  const { data: treatmentCategories, isLoading, error } = useAllTreatmentCategories();

  // 디버깅 로그 추가
  console.log("=== TreatmentListPage Debug ===");
  console.log("categoryKey from URL:", categoryKey);
  console.log("locale from URL:", locale);
  
  // Convert database format to legacy format for compatibility
  const categories = React.useMemo(() => {
    if (!treatmentCategories || !Array.isArray(treatmentCategories)) return [];
    
    return treatmentCategories.map((category: TreatmentCategoryResponse) => ({
      category_key: category.topic_id,
      ko: category.topic_title_ko,
      en: category.topic_title_en,
      concern_copy: {
        ko: category.concern_copy_ko || '',
        en: category.concern_copy_en || ''
      },
      areas: category.areas.map((area: any) => ({
        key: area.area_id,
        ko: area.area_name_ko,
        en: area.area_name_en
      })),
      treatments: category.areas.flatMap((area: any, areaIndex: number) => 
        area.primary_treatments.map((treatment: any, treatmentIndex: number) => {
          console.log('Treatment summary type:', typeof treatment.summary, treatment.summary);
          return {
            id: `${treatment.id}_${areaIndex}_${treatmentIndex}`, // 고유 키 생성
            originalId: treatment.id, // 원본 ID 보존
            name: {
              ko: treatment.ko,
              en: treatment.en
            },
            summary: treatment.summary,
            tags: treatment.tags.map((tag: string) => ({ ko: tag, en: tag })),
            attributes: treatment.attributes
          };
        })
      )
    }));
  }, [treatmentCategories]);

  console.log("Database categories:", categories.map(cat => cat.category_key));

  // URL parameter로 전달받은 category 찾기 (대소문자 구분 없음)
  const selectedCategory = React.useMemo(() => {
    const found = categories.find(cat => 
      cat.category_key.toLowerCase() === categoryKey?.toLowerCase()
    );
    console.log("selectedCategory found:", found ? found.category_key : "NOT FOUND");
    console.log("Case-insensitive comparison - Input:", categoryKey?.toLowerCase(), "Found:", found?.category_key.toLowerCase());
    return found;
  }, [categoryKey, categories]);

  // 더미 핸들러들 (현재는 콘솔 로그만) - Hook들을 early return 전에 호출
  const handleSelect = React.useCallback((treatment: Treatment) => {
    console.log('Treatment selected:', treatment.id);
  }, []);

  const handleBook = React.useCallback((treatment: Treatment) => {
    console.log('Book treatment:', treatment.id);
  }, []);

  const handleContact = React.useCallback(() => {
    console.log('Contact clicked');
  }, []);

  if (isLoading) {
    return (
      <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
        <div className="flex justify-center items-center min-h-[400px]">
          <DotLottieReact
            src="/logo/loading_logo.lottie"
            loop
            autoplay
            style={{ width: 200, height: 200 }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg text-red-600">Error loading treatment categories</div>
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    console.error("=== CATEGORY NOT FOUND ===");
    console.error("Searched for categoryKey:", categoryKey);
    console.error("Available category keys (from database):", categories.map(cat => cat.category_key));
    console.error("Total categories count:", categories.length);
    console.error("Data source: treatment_care_protocols.topic_id");
    
    return (
      <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
          <p className="text-gray-600 mt-2">Please select a valid category.</p>
          <div className="mt-4 p-4 bg-red-100 rounded-lg text-left max-w-2xl mx-auto">
            <p className="text-sm text-red-800"><strong>Debug Info (Database):</strong></p>
            <p className="text-sm text-red-600">Searched for: <code>{categoryKey || 'null'}</code></p>
            <p className="text-sm text-red-600">Available keys: <code>{categories.map(cat => cat.category_key).join(', ')}</code></p>
            <p className="text-sm text-red-600">Source: treatment_care_protocols.topic_id</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
      {/* Category header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          {locale === 'ko' ? selectedCategory.ko : selectedCategory.en}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600">
          {selectedCategory.concern_copy[locale]}
        </p>
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
              {locale === 'ko' ? area.ko : area.en}
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