import * as React from "react";
import type { Treatment, PainLevel } from "../../../constants/treatment/types";

// Use existing Treatment type from constants

// -------------------------------
// Utilities
// -------------------------------
const CURRENCY_SYMBOL: Record<string, string> = {
  KRW: "₩",
  USD: "$",
  EUR: "€",
  JPY: "¥",
};


function fmtCurrency(amount?: number, currency: string = "KRW") {
  if (amount == null) return "";
  const symbol = CURRENCY_SYMBOL[currency] ?? "";
  // KRW: show thousands separators with no decimals
  if (currency === "KRW") {
    return `${symbol}${amount.toLocaleString()}`;
  }
  // Fallback to Intl for others
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${symbol}${amount.toLocaleString()}`;
  }
}

function t(loc?: { ko: string; en: string }, locale: "ko" | "en" = "ko") {
  if (!loc) return "";
  return locale === "ko" ? loc.ko : loc.en;
}

function painLabel(level?: PainLevel, score?: number, locale: "ko" | "en" = "ko") {
  const base = (() => {
    switch (level) {
      case "none": return locale === "ko" ? "통증 없음" : "No pain";
      case "low": return locale === "ko" ? "매우 약함" : "Very mild";
      case "low_medium": return locale === "ko" ? "약~중간" : "Mild to moderate";
      case "medium": return locale === "ko" ? "중간" : "Moderate";
      case "medium_high": return locale === "ko" ? "중간~강함" : "Moderate to strong";
      case "high": return locale === "ko" ? "강함" : "Strong";
      default: return locale === "ko" ? "가벼움" : "Mild";
    }
  })();
  return score != null ? `${base} (${score}/10)` : base;
}

function effectLabel(attr: Treatment["attributes"] | undefined, locale: "ko" | "en") {
  if (!attr?.effect) return "";
  const e = attr.effect;
  const parts: string[] = [];
  
  // Main line - safely access ko/en properties
  const note = (e as any)?.ko || (e as any)?.en;
  if (note) {
    const effectText = locale === "ko" ? ((e as any)?.ko || (e as any)?.en || "") : ((e as any)?.en || (e as any)?.ko || "");
    if (effectText) parts.push(effectText);
  }
  
  // Onset & duration
  const onset = t((e as any)?.onset_label, locale) ||
    ((e as any)?.onset_weeks_min != null ? `${(e as any)?.onset_weeks_min}${(e as any)?.onset_weeks_max && (e as any)?.onset_weeks_max !== (e as any)?.onset_weeks_min ? `–${(e as any)?.onset_weeks_max}` : ""}${locale === "ko" ? "주" : " weeks"}` : "");
  if (onset) parts.push(locale === "ko" ? `시술 후 ${onset}부터 효과가 보입니다.` : `Effects typically appear after ${onset}.`);

  const dur = (() => {
    if ((e as any)?.duration_months_min == null && (e as any)?.duration_months_max == null) return "";
    const min = (e as any)?.duration_months_min ?? (e as any)?.duration_months_max;
    const max = (e as any)?.duration_months_max && (e as any)?.duration_months_max !== min ? `–${(e as any)?.duration_months_max}` : "";
    return `${min}${max}${locale === "ko" ? "개월" : " months"}`;
  })();
  if (dur) parts.push(locale === "ko" ? `효과는 약 ${dur} 지속됩니다.` : `Results last about ${dur}.`);
  return parts.join(" ");
}

// -------------------------------
// Component
// -------------------------------
export interface TreatmentDetailCardProps {
  data: Treatment;
  locale?: "ko" | "en";
  className?: string;
  onBook?: (data: Treatment) => void;
  onContact?: (data: Treatment) => void;
  buildInfoLine?: (t: Treatment, locale: "ko" | "en") => string;
}

export default function TreatmentDetailCard({
  data,
  locale = "ko",
  className,
  onBook,
  onContact,
  buildInfoLine,
}: TreatmentDetailCardProps) {
  const name = t(data.name, locale);
  const summary = t(data.summary, locale);
  const attr = data.attributes;

  const costFrom = fmtCurrency(attr?.cost?.from, attr?.cost?.currency);
  const costNote = locale === "ko" ? attr?.cost?.note_ko : attr?.cost?.note_en;

  const rec = attr?.recommended;
  const sessionsStr = rec?.sessions_min || rec?.sessions_max
    ? (locale === "ko"
        ? `${rec?.sessions_min ?? rec?.sessions_max}–${rec?.sessions_max ?? rec?.sessions_min}회 권장`
        : `${rec?.sessions_min ?? rec?.sessions_max}–${rec?.sessions_max ?? rec?.sessions_min} sessions recommended`)
    : "";
  const intervalStr = rec?.interval_weeks
    ? (locale === "ko" ? `${rec?.interval_weeks}주 간격` : `${rec?.interval_weeks}-week interval`)
    : "";
  const maintenanceStr = rec?.maintenance_note ? t(rec.maintenance_note, locale) : "";

  const effectStr = effectLabel(attr, locale);
  const downtimeStr = t(attr?.downtime, locale);
  const painStr = painLabel(attr?.pain?.level, attr?.pain?.pain_score_0_10, locale);

  return (
    <section
      className={[
        "w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm",
        "transition hover:shadow-md",
        className || "",
      ].join(" ")}
      aria-label={name}
    >
      {/* Header */}
      <header className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {t(tag, locale)}
                </span>
              ))}
            </div>
          )}
        </div>
        {summary && <p className="mt-1 text-sm text-gray-600">{summary}</p>}
      </header>

      {/* Body: line-by-line, icon + label */}
      <div className="space-y-3">
        {effectStr && (
          <InfoRow icon="✨" label={locale === "ko" ? "효과" : "Effect"}>
            {effectStr}
          </InfoRow>
        )}

        {(sessionsStr || intervalStr || maintenanceStr) && (
          <InfoRow icon="📅" label={locale === "ko" ? "시술 계획" : "Plan"}>
            <ul className="list-inside list-disc space-y-1 text-gray-700">
              {sessionsStr && <li>{sessionsStr}</li>}
              {intervalStr && <li>{intervalStr}</li>}
              {maintenanceStr && <li>{maintenanceStr}</li>}
            </ul>
          </InfoRow>
        )}

        {downtimeStr && (
          <InfoRow icon="⏳" label={locale === "ko" ? "회복 기간" : "Downtime"}>
            {downtimeStr}
          </InfoRow>
        )}

        {(attr?.pain?.level || attr?.pain?.pain_score_0_10 != null) && (
          <InfoRow icon="😊" label={locale === "ko" ? "통증 정도" : "Pain"}>
            {painStr}
          </InfoRow>
        )}

        {(attr?.cost?.from != null || costNote) && (
          <InfoRow icon="💰" label={locale === "ko" ? "비용" : "Cost"}>
            <div className="flex flex-wrap items-center gap-2">
              {attr?.cost?.from != null && (
                <span className="font-medium text-gray-900">
                  {costFrom}
                  {locale === "ko" ? "부터" : "+"}
                </span>
              )}
              {costNote && <span className="text-gray-600">({costNote})</span>}
            </div>
          </InfoRow>
        )}
      </div>

      {/* Actions */}
      {(onBook || onContact) && (
        <footer className="mt-5 flex gap-2">
          {onBook && (
            <button
              type="button"
              onClick={() => onBook?.(data)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            >
              {locale === "ko" ? "예약요청" : "Book"}
            </button>
          )}
          {onContact && (
            <button
              type="button"
              onClick={() => onContact?.(data)}
              className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
            >
              {locale === "ko" ? "문의" : "Contact"}
            </button>
          )}
        </footer>
      )}
    </section>
  );
}

function InfoRow({ icon, label, children }: { icon?: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 select-none text-base leading-6" aria-hidden>{icon}</span>
      <div className="min-w-24 flex-1">
        <div className="mb-0.5 text-sm font-medium text-gray-900">{label}</div>
        <div className="text-sm leading-6 text-gray-700">{children}</div>
      </div>
    </div>
  );
}

// -------------------------------
// Example usage (remove in prod):
//
// <TreatmentDetailCard
//   locale="ko"
//   data={picoData}
//   onReserve={(d) => console.log("reserve", d.id)}
//   onInquiry={(d) => console.log("inquiry", d.id)}
// />
//
// const picoData: TreatmentData = {
//   id: "pico_pores",
//   name: { ko: "피코 레이저(모공)", en: "Pico Laser (Pores)" },
//   summary: { ko: "미세 타깃으로 모공·결 개선", en: "Micro-targeting pores & texture" },
//   tags: [{ ko: "정밀", en: "Precision" }],
//   attributes: {
//     effect: {
//       onset_label: { ko: "1–2주 / 회차 누적", en: "1–2 weeks; cumulative" },
//       onset_weeks_min: 1,
//       onset_weeks_max: 2,
//       duration_months_min: 3,
//       duration_months_max: 6,
//       ko: "3–5회 이상 권장",
//       en: "3–5+ sessions recommended",
//     },
//     downtime: { ko: "홍조 1–2일", en: "Redness 1–2 days" },
//     pain: { level: "low_medium", pain_score_0_10: 3 },
//     cost: { currency: "KRW", from: 250000, note_ko: "프로토콜별", note_en: "By protocol" },
//     recommended: { sessions_min: 3, sessions_max: 5, interval_weeks: 2, maintenance_note: { ko: "월 1회 관리", en: "Monthly care" } },
//   },
// };
