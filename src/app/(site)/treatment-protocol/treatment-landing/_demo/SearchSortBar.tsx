"use client";

import * as React from "react";

export type SortKey = "relevance" | "price" | "pain" | "duration";
export type SortOrder = "asc" | "desc";

export default function SearchSortBar({
  query, onQueryChange,
  sortKey, sortOrder, onSortKeyChange, onSortOrderChange,
  maxPain, onMaxPainChange,
  locale = "ko"
}: {
  query: string;
  onQueryChange: (v: string) => void;
  sortKey: SortKey;
  sortOrder: SortOrder;
  onSortKeyChange: (v: SortKey) => void;
  onSortOrderChange: (v: SortOrder) => void;
  maxPain: number;
  onMaxPainChange: (v: number) => void;
  locale?: "ko" | "en";
}) {
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
      <div className="flex-1">
        <label className="block text-xs text-neutral-600 mb-1">{t("검색", "Search")}</label>
        <input
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder={t("시술/태그/요약 검색…", "Search treatment/tag/summary…")}
          className="w-full rounded-lg border px-3 py-2 text-sm border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
        <div>
          <label className="block text-xs text-neutral-600 mb-1">{t("정렬 기준", "Sort by")}</label>
          <select
            value={sortKey}
            onChange={e => onSortKeyChange(e.target.value as SortKey)}
            className="w-full rounded-lg border px-3 py-2 text-sm border-neutral-300"
          >
            <option value="relevance">{t("관련도", "Relevance")}</option>
            <option value="price">{t("가격", "Price")}</option>
            <option value="pain">{t("통증", "Pain")}</option>
            <option value="duration">{t("유지기간", "Duration")}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-600 mb-1">{t("정렬 방향", "Order")}</label>
          <select
            value={sortOrder}
            onChange={e => onSortOrderChange(e.target.value as SortOrder)}
            className="w-full rounded-lg border px-3 py-2 text-sm border-neutral-300"
          >
            <option value="asc">{t("오름차순", "Ascending")}</option>
            <option value="desc">{t("내림차순", "Descending")}</option>
          </select>
        </div>
      </div>
      <div className="w-full md:w-[260px]">
        <label className="block text-xs text-neutral-600 mb-1">{t("최대 통증 (0–10)", "Max pain (0–10)")} : {maxPain}</label>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={maxPain}
          onChange={(e) => onMaxPainChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
