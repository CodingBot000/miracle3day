"use client";

import * as React from "react";
import type { Treatment } from "@/constants/treatment/types";

export default function TreatmentCard({
  t, locale, onCompare, onBook, onContact, infoLine,
}: {
  t: Treatment;
  locale: "ko" | "en";
  infoLine: string;
  onCompare: () => void;
  onBook: () => void;
  onContact: () => void;
}) {
  const selected = false; // 데모 카드 자체에서는 표시만, 비교선택은 상위에서 관리

  return (
    <div className="rounded-2xl border border-neutral-200 p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t.name[locale]}</h3>
        <button
          className={"text-xs px-2 py-1 rounded-full border bg-white"}
          onClick={onCompare}
        >
          {locale==="ko" ? "비교" : "Compare"}
        </button>
      </div>
      <p className="text-sm text-neutral-600 mt-1">{t.summary[locale]}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {t.tags.map((tag, i) => (
          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-neutral-100">{tag[locale]}</span>
        ))}
      </div>
      <div className="mt-3 text-sm">{infoLine}</div>
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-2 rounded-lg border" onClick={onBook}>{locale==="ko" ? "예약요청" : "Book"}</button>
        <button className="px-3 py-2 rounded-lg border" onClick={onContact}>{locale==="ko" ? "문의" : "Contact"}</button>
      </div>
    </div>
  );
}
