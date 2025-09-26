"use client";

import * as React from "react";
import type { Category, Treatment } from "../../../constants/treatment/types";
import TreatmentCard from "./TreatmentCard";

export default function CategorySection({
  category, locale, onSelect, onBook, onContact, buildInfoLine,
}: {
  category: Category;
  locale: "ko" | "en";
  onSelect: (t: Treatment) => void;
  onBook: (t: Treatment) => void;
  onContact: (t: Treatment) => void;
  buildInfoLine: (t: Treatment, locale: "ko" | "en") => string;
}) {
  return (
    <section className="my-6">
      <div className="mb-2">
        <h2 className="text-xl font-bold">{category[locale]}</h2>
        <p className="text-sm text-neutral-600">{category.concern_copy[locale]}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.treatments.map(t => (
          <TreatmentCard
            key={t.id}
            t={t}
            locale={locale}
            infoLine={buildInfoLine(t, locale)}
            onCompare={() => onSelect(t)}
            onBook={() => onBook(t)}
            onContact={() => onContact(t)}
          />
        ))}
      </div>
    </section>
  );
}
