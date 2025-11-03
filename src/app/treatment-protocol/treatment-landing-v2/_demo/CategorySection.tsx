"use client";

import * as React from "react";
import type { Category, Treatment } from "../../../../constants/treatment/types";
import TreatmentDetailCard from "./TreatmentDetailCard";

export default function CategorySection({
  category, locale, onSelect, onBook, onContact, buildInfoLine
}: {
  category: Category;
  locale: "ko" | "en";
  onSelect: (t: Treatment) => void;
  onBook: (t: Treatment) => void;
  onContact: () => void;
  buildInfoLine: (t: Treatment, locale: "ko" | "en") => string;
}) {
  return (
    <section className="my-6">
      <div className="mb-2">
        <h2 className="text-xl font-bold">{locale === 'ko' ? category.ko : category.en}</h2>
        <p className="text-sm text-neutral-600">{category.concern_copy[locale]}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {category.treatments.map(t => (
          <TreatmentDetailCard
            key={t.id}
            data={t}
            locale={locale}
            onBook={() => onBook(t)}
            onContact={() => onContact()}
            buildInfoLine={buildInfoLine}
          />
        ))}
      </div>
    </section>
  );
}
