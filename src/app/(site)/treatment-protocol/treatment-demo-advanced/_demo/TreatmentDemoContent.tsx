/* eslint-disable react/prop-types */
"use client";

import * as React from "react";
import { categories } from "@/constants/treatment/sample-data";
import type { Category, Treatment } from "@/constants/treatment/types";
import { buildInfoLine } from "@/constants/treatment/types";

import LanguageToggle from "./LanguageToggle";
import SearchSortBar, { type SortKey, type SortOrder } from "./SearchSortBar";
import CompareModal from "./CompareModal";
import CategorySection from "./CategorySection";
import CategoryGridCard from "./CategoryGridCard";
import useCompareSelection from "./useCompareSelection";
import { sortTreatments, matchScore } from "./utils-search-sort";
import BookingForm from "./BookingForm";
import ContactForm from "./ContactForm";

type Locale = "ko" | "en";

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

export default function TreatmentDemoContent() {
  const [locale, setLocale] = React.useState<Locale>("ko");
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("relevance");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc");
  const [maxPain, setMaxPain] = React.useState(10);

  const { selected, toggle, clear } = useCompareSelection();
  const [openCompare, setOpenCompare] = React.useState(false);

  const [openBooking, setOpenBooking] = React.useState(false);
  const [bookingTarget, setBookingTarget] = React.useState<Treatment | null>(null);

  const [openContact, setOpenContact] = React.useState(false);

  // 필터/정렬 적용된 카테고리
  const filteredCategories: Category[] = React.useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      treatments: sortTreatments(
        cat.treatments
          .filter(t => t.attributes.pain.pain_score_0_10 <= maxPain)
          .filter(t => !query || matchScore(t, query, locale) > 0),
        sortKey,
        sortOrder,
        query,
        locale
      )
    }));
  }, [query, sortKey, sortOrder, maxPain, locale]);

  return (
    <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
          {/* Hero */}
          <section className="pt-10 pb-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Premium Beauty Care
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            Find your perfect Korean beauty treatment in 1 minute.
          </p>
        </div>
      </section>
      <header className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Treatment Catalog </h1>
          <p className="text-neutral-600">Search · Sort · Compare · Booking/Contact Stubs</p>
        </div>
        <LanguageToggle value={locale} onChange={setLocale} />
      </header>

      <SearchSortBar
        query={query}
        onQueryChange={setQuery}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSortKeyChange={setSortKey}
        onSortOrderChange={setSortOrder}
        maxPain={maxPain}
        onMaxPainChange={setMaxPain}
        locale={locale}
      />

      {/* 1뎁스 카테고리 그리드 카드 표시 */}
      <div className="space-y-4">
        {categories.map((cat, index) => (
          <CategoryGridCard
            key={cat.category_key}
            category={cat}
            locale={locale}
            categoryIndex={index}
            onClick={(category) => {
              log.debug('Category clicked:', category.category_key);
            }}
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