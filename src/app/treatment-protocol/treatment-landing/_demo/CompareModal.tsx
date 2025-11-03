"use client";

import * as React from "react";
import type { Treatment } from "../../../../constants/treatment/types";
import { formatCurrencyKRW } from "../../../../constants/treatment/types";

export default function CompareModal({
  open,
  onOpenChange,
  treatments,
  locale = "ko",
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  treatments: Treatment[];
  locale?: "ko" | "en";
  title?: string;
  children?: React.ReactNode;
}) {
  if (!open) return null;

  const cols = treatments.map(t => ({
    title: t.name[locale],
    summary: t.summary[locale],
    onset: t.attributes.effect.onset_label[locale],
    duration: `${t.attributes.effect.duration_months_min}–${t.attributes.effect.duration_months_max}m`,
    downtime: t.attributes.downtime[locale],
    pain: `${t.attributes.pain.pain_score_0_10}/10`,
    cost: formatCurrencyKRW(t.attributes.cost.from) + "+",
    sessions: `${t.attributes.recommended.sessions_min}${
      t.attributes.recommended.sessions_max > t.attributes.recommended.sessions_min
        ? "–" + t.attributes.recommended.sessions_max
        : ""
    }`,
    interval: `${t.attributes.recommended.interval_weeks}w`,
    tags: t.tags.map(tag => tag[locale]).join(", "),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 max-w-6xl w-[92vw] bg-white rounded-2xl shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {title ?? (locale === "ko" ? "비교 보기" : "Compare")}
          </h3>
          <button
            className="text-sm px-2 py-1 rounded-lg border hover:bg-neutral-50"
            onClick={() => onOpenChange(false)}
          >
            {locale === "ko" ? "닫기" : "Close"}
          </button>
        </div>

        {children ? (
          <div>{children}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2"></th>
                  {cols.map((c, i) => (
                    <th key={i} className="text-left p-2 min-w-[180px]">{c.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: locale==="ko" ? "한줄 요약" : "Summary", values: cols.map(c => c.summary) },
                  { label: "✨ Onset / Duration", values: cols.map(c => `${c.onset} / ${c.duration}`) },
                  { label: "🤕 Downtime", values: cols.map(c => c.downtime) },
                  { label: "😖 Pain", values: cols.map(c => c.pain) },
                  { label: "💰 Cost", values: cols.map(c => c.cost) },
                  { label: locale==="ko" ? "권장 회차 / 간격" : "Sessions / Interval", values: cols.map(c => `${c.sessions} / ${c.interval}`) },
                  { label: "🏷️ Tags", values: cols.map(c => c.tags) },
                ].map((row, idx) => (
                  <tr key={idx} className="border-t">
                    <th className="text-left p-2 whitespace-nowrap">{row.label}</th>
                    {row.values.map((v, i) => <td key={i} className="p-2">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
