/* eslint-disable react/prop-types */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTopicList } from "@/hooks/useTreatmentData";
import type { TopicWithAreas, Locale } from "@/app/models/treatmentData.dto";
import { useCookieLanguage } from "@/hooks/useCookieLanguage";
import LottieLoading from "@/components/atoms/LottieLoading";

import TopicCard from "./_demo/TopicCard";

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

export default function TreatmentProtocol() {
  const router = useRouter();
  const { language } = useCookieLanguage();
  const locale = language as Locale;

  // Fetch topic list from database using the new API
  const { data: topicListResponse, isLoading, error } = useTopicList();

  const topics = React.useMemo(() => {
    return topicListResponse?.data || [];
  }, [topicListResponse]);

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

  // 공통 네비게이션 함수
  const navigateToProtocol = React.useCallback((topic_id: string, area_id: string) => {
    const params = new URLSearchParams({
      topic_id,
      area_id
    });
    router.push(`/treatment-landing-v2/protocol?${params.toString()}`);
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
          <h1 className="text-2xl md:text-4xl font-bold font-bold tracking-tight text-gray-900">
          
            Premium Beauty Care
          </h1>
          {/* <p className="mt-3 text-base sm:text-lg text-gray-600">
            Find your perfect Korean beauty treatment in 1 minute.
          </p> */}
        </div>
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

      {/* Topic Cards with Area Buttons */}
      <div className="space-y-6">
        {topics.map((topic, index) => (
          <TopicCard
            key={topic.topic_id}
            topic={topic}
            locale={locale}
            topicIndex={index}
            onAreaClick={navigateToProtocol}
            onTopicClick={navigateToProtocol}
          />
        ))}
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
