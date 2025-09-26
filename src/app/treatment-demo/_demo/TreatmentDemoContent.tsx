"use client";

import * as React from "react";
import { categories } from "../../../constants/treatment/sample-data";
import type { Category, Treatment } from "../../../constants/treatment/types";
import { buildInfoLine } from "../../../constants/treatment/types";

import LanguageToggle from "./LanguageToggle";
import SearchSortBar, { type SortKey, type SortOrder } from "./SearchSortBar";
import CompareModal from "./CompareModal";
import CategorySection from "./CategorySection";
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
    <div className="container mx-auto px-4 py-6 space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Treatment Catalog Demo</h1>
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

      {/* 데모에선 상위 3개 카테고리만 표시. 필요시 slice 제거 */}
      {filteredCategories.slice(0, 3).map(cat => (
        <CategorySection
          key={cat.category_key}
          category={cat}
          locale={locale}
          onSelect={(t) => toggle(t)}
          onBook={(t) => { setBookingTarget(t); setOpenBooking(true); }}
          onContact={() => setOpenContact(true)}
          buildInfoLine={buildInfoLine}
        />
      ))}

      {/* 비교 바 */}
      {selected.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 mx-auto w-full max-w-3xl px-4">
          <div className="flex items-center gap-3 bg-white border rounded-2xl shadow-xl p-3">
            <div className="text-sm">
              {locale === "ko" ? "선택됨:" : "Selected:"}{" "}
              {selected.map(s => s.name[locale]).join(", ")}
            </div>
            <div className="ml-auto flex gap-2">
              <OutlineButton onClick={() => setOpenCompare(true)}>
                {locale === "ko" ? "비교" : "Compare"} ({selected.length})
              </OutlineButton>
              <OutlineButton onClick={clear}>
                {locale === "ko" ? "초기화" : "Clear"}
              </OutlineButton>
            </div>
          </div>
        </div>
      )}

      {/* 비교 모달 */}
      <CompareModal
        open={openCompare}
        onOpenChange={setOpenCompare}
        treatments={selected}
        locale={locale}
      />

      {/* 예약 모달 (stub: alert로 결과 확인) */}
      <CompareModal
        open={openBooking}
        onOpenChange={setOpenBooking}
        treatments={[]}
        locale={locale}
      >
        <BookingForm
          locale={locale}
          selected={bookingTarget}
          onSubmit={(payload) => {
            alert(JSON.stringify(payload, null, 2));
            setOpenBooking(false);
          }}
        />
      </CompareModal>

      {/* 문의 모달 (stub: alert로 결과 확인) */}
      <CompareModal
        open={openContact}
        onOpenChange={setOpenContact}
        treatments={[]}
        locale={locale}
        title={locale === "ko" ? "문의" : "Contact"}
      >
        <ContactForm
          locale={locale}
          onSubmit={(payload) => {
            alert(JSON.stringify(payload, null, 2));
            setOpenContact(false);
          }}
        />
      </CompareModal>
    </div>
  );
}