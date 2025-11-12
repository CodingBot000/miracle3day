/* eslint-disable react/prop-types */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTopicList, useSurgeryProtocols } from "@/hooks/useTreatmentData";
import type { TopicWithAreas, Locale } from "@/app/models/treatmentData.dto";
import { useCookieLanguage } from "@/hooks/useCookieLanguage";
import LottieLoading from "@/components/atoms/LottieLoading";

import TopicCard from "./_demo/TopicCard";
import SurgeryCard from "./_demo/SurgeryCard";

const OutlineButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={
      "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium " +
      "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 " +
      (props.className ?? "")
    }
  />
);

OutlineButton.displayName = 'OutlineButton';

const STORAGE_KEY = 'treatment-protocol-category';

export default function TreatmentProtocol() {
  const router = useRouter();
  const { language } = useCookieLanguage();
  const locale = language as Locale;

  // Initialize category from localStorage or default to 'skin'
  const [category, setCategory] = React.useState<'skin' | 'surgery'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved === 'surgery' ? 'surgery' : 'skin') as 'skin' | 'surgery';
    }
    return 'skin';
  });

  // Fetch topic list from database using the new API
  const { data: topicListResponse, isLoading: topicsLoading, error: topicsError } = useTopicList();

  // Fetch surgery protocols
  const { data: surgeryResponse, isLoading: surgeryLoading, error: surgeryError } = useSurgeryProtocols();

  const topics = React.useMemo(() => {
    return topicListResponse?.data || [];
  }, [topicListResponse]);

  const surgeryCategories = React.useMemo(() => {
    return surgeryResponse?.categories || [];
  }, [surgeryResponse]);

  const isLoading = category === 'skin' ? topicsLoading : surgeryLoading;
  const error = category === 'skin' ? topicsError : surgeryError;

  React.useEffect(() => {
    if (topicListResponse) {
      console.log("[TreatmentProtocol] loaded topics:", topicListResponse.data.length, topicListResponse.data);
    }
  }, [topicListResponse]);

  React.useEffect(() => {
    if (error) {
      console.error("[TreatmentProtocol] topic list error:", error);
    }
  }, [error]);

  // Handle category change and save to localStorage
  const handleCategoryChange = React.useCallback((newCategory: 'skin' | 'surgery') => {
    setCategory(newCategory);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newCategory);
    }
  }, []);

  // 공통 네비게이션 함수
  const navigateToProtocol = React.useCallback((topic_id: string, area_id: string) => {
    const params = new URLSearchParams({
      topic_id,
      area_id
    });
    router.push(`/treatment-protocol/treatment-landing-v2/protocol?${params.toString()}`);
  }, [router]);

  if (isLoading) {
    return (
      <div className="py-6 space-y-5 min-h-screen">
        <div className="flex justify-center items-center min-h-[400px]">
          <LottieLoading size={200} />
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

  return (
    <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
      {/* Hero */}
      <section className="pt-10 pb-2">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900">
            Premium Beauty Care
          </h1>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="flex justify-center gap-4 px-4">
        <button
          onClick={() => handleCategoryChange('skin')}
          className={`
            flex flex-col items-center px-6 py-4 rounded-xl
            transition-all duration-200 border-2
            ${category === 'skin'
              ? 'bg-gradient-to-br from-[#FDF5F0] to-[#F8E8E0] border-[#E8B4A0] shadow-lg scale-105'
              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
            }
          `}
        >

          <span className="font-bold text-sm md:text-lg">
            {locale === 'ko' ? '피부과 시술' : 'Skin Treatments'}
          </span>
          <span className="text-xs md:text-sm text-gray-600">
            {locale === 'ko' ? '비수술 케어' : 'Non-surgical Care'}
          </span>
        </button>

        <button
          onClick={() => handleCategoryChange('surgery')}
          className={`
            flex flex-col items-center px-6 py-4 rounded-xl
            transition-all duration-200 border-2
            ${category === 'surgery'
              ? 'bg-gradient-to-br from-[#F0F5FD] to-[#E0E8F8] border-[#3B82F6] shadow-lg scale-105'
              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
            }
          `}
        >



          <span className="font-bold text-sm md:text-lg">
            {locale === 'ko' ? '성형외과 수술' : 'Plastic Surgery'}
          </span>
          <span className="text-xs md:text-sm text-gray-600">
            {locale === 'ko' ? '외과 수술' : 'Surgical Procedures'}
          </span>
        </button>
      </section>
      {/* <header className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Treatment Catalog </h1> 
          <p className="text-neutral-600">Search · Sort · Compare · Booking/Contact Stubs</p>
        </div>
      </header> */}

      {/* <SearchSortBar
        query={query}
        onQueryChange={setQuery}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSortKeyChange={setSortKey}
        onSortOrderChange={setSortOrder}
        maxPain={maxPain}
        onMaxPainChange={setMaxPain}
        locale={locale}
      /> */}

      {/* Content - Conditional Rendering */}
      <div className="space-y-6">
        {category === 'skin' && (
          <>
            {topics.map((topic) => (
              <TopicCard
                key={topic.topic_id}
                topic={topic}
                locale={locale}
                onAreaClick={navigateToProtocol}
                onTopicClick={navigateToProtocol}
              />
            ))}
          </>
        )}

        {category === 'surgery' && (
          <>
            {surgeryCategories.map((surgeryCategory, index) => (
              <SurgeryCard
                key={surgeryCategory.category}
                data={surgeryCategory}
                locale={locale}
                categoryIndex={index}
              />
            ))}
          </>
        )}
      </div>

      {/* 기존 상세 카테고리 섹션 (주석처리) */}
      {/* {filteredCategories.slice(0, 3).map(cat => (
        <CategorySection
          key={cat.category_key}
          category={cat}
          locale={locale}
          onSelect={(t) => toggle(t)}
          onBook={(t) => { setBookingTarget(t); setOpenBooking(true); }}
          onContact={() => setOpenContact(true)}
          buildInfoLine={buildInfoLine}
        />
      ))} */}


    
    </div>
  );
}
