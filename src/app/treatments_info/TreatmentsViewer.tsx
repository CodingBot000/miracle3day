// app/(site)/treatments/TreatmentsViewer.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import data from "@/constants/treatments_info.json"

type LocalizedText = { ko?: string; en?: string };
type Treatment = {
  key: string;
  title: LocalizedText;
  overview?: LocalizedText;
  effectsDuration?: LocalizedText;
  painAnesthesia?: LocalizedText;
  downtime?: LocalizedText;
  sideEffectsSafety?: LocalizedText;
  sessionFrequency?: LocalizedText;
  candidatesContraindications?: LocalizedText;
  costKRW?: LocalizedText;
  reviewsSummary?: LocalizedText;
  precautions?: LocalizedText;
  providerNotes?: LocalizedText;
};

type Props = {
  lang: "ko" | "en";
};

function pickLang(lang: "ko" | "en", val?: LocalizedText) {
  if (!val) return "";
  return (val[lang] ?? val.ko ?? val.en ?? "").trim();
}

// Helper function to normalize key for comparison (remove spaces and convert to lowercase)
function normalizeKey(key: string): string {
  return key.replace(/\s+/g, "").toLowerCase();
}

export default function TreatmentsViewer({ lang }: Props) {
  const searchParams = useSearchParams();
  
  // Debug: Log component initialization
  console.log('🔧 TreatmentsViewer initialized with lang:', lang);
  console.log('🔧 SearchParams:', Object.fromEntries(searchParams.entries()));
  
  // Alternative method to get URL parameters (fallback)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const treatmentFromWindow = urlParams.get('treatment');
      console.log('🌐 Window URL treatment param:', treatmentFromWindow);
      console.log('🌐 Full URL:', window.location.href);
    }
  }, []);
  
  // 루트 키가 treatments 또는 오타(treatemtns) 모두 지원
type RawJson = { treatments?: unknown; treatemtns?: unknown };

function isLocalizedText(v: unknown): v is LocalizedText {
  return !!v && typeof v === "object" && (
    typeof (v as any).ko === "string" || typeof (v as any).en === "string"
  );
}
function isTreatment(v: unknown): v is Treatment {
  const o = v as any;
  return !!o && typeof o.key === "string" && isLocalizedText(o.title);
}

const treatments: Treatment[] = useMemo(() => {
  const raw = data as unknown as RawJson;
  const list = Array.isArray(raw.treatments)
    ? raw.treatments
    : Array.isArray(raw.treatemtns)
      ? raw.treatemtns
      : [];
  const filteredTreatments = (list as unknown[]).filter(isTreatment) as Treatment[];
  console.log('📋 Loaded treatments:', filteredTreatments.length);
  console.log('📋 Treatment keys:', filteredTreatments.map(t => t.key));
  return filteredTreatments;
}, []);

  // Find matching treatment based on URL parameter with normalized key comparison
  const treatmentFromUrl = useMemo(() => {
    const treatmentParam = searchParams.get('treatment');
    console.log('🔍 URL treatment parameter:', treatmentParam);
    
    if (!treatmentParam) {
      console.log('🔍 No treatment parameter found in URL');
      return null;
    }
    
    const normalizedParam = normalizeKey(treatmentParam);
    console.log('🔍 Normalized URL param:', normalizedParam);
    
    const matchedTreatment = treatments.find(treatment => {
      const normalizedTreatmentKey = normalizeKey(treatment.key);
      const isMatch = normalizedTreatmentKey === normalizedParam;
      console.log(`🔍 Comparing: "${normalizedTreatmentKey}" === "${normalizedParam}" -> ${isMatch}`);
      return isMatch;
    });
    
    console.log('🔍 Matched treatment from URL:', matchedTreatment?.key || 'None');
    return matchedTreatment || null;
  }, [searchParams, treatments]);

  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Set initial active key based on URL parameter or default to first treatment
  useEffect(() => {
    console.log('⚡ useEffect triggered');
    console.log('⚡ treatmentFromUrl:', treatmentFromUrl?.key || 'None');
    console.log('⚡ treatments.length:', treatments.length);
    console.log('⚡ current activeKey:', activeKey);
    
    if (treatmentFromUrl) {
      console.log('⚡ Setting activeKey from URL:', treatmentFromUrl.key);
      setActiveKey(treatmentFromUrl.key);
    } else if (treatments.length > 0 && !activeKey) {
      console.log('⚡ Setting activeKey to first treatment:', treatments[0].key);
      setActiveKey(treatments[0].key);
    } else {
      console.log('⚡ No activeKey changes needed');
    }
  }, [treatmentFromUrl, treatments, activeKey]);

  const active = useMemo(() => {
    const foundTreatment = treatments.find((t) => t.key === activeKey) ?? null;
    console.log('🎯 Active treatment updated:', { activeKey, foundTitle: foundTreatment?.title });
    return foundTreatment;
  }, [treatments, activeKey]);

  // 상세 섹션 구성 (라벨 다국어)
  const sections: {
    field: keyof Treatment;
    label: { ko: string; en: string };
  }[] = [
    { field: "overview", label: { ko: "시술 기본 정보", en: "Overview" } },
    {
      field: "effectsDuration",
      label: { ko: "기대 효과·지속", en: "Effects & Duration" },
    },
    {
      field: "painAnesthesia",
      label: { ko: "통증·마취", en: "Pain & Anesthesia" },
    },
    { field: "downtime", label: { ko: "회복 기간", en: "Downtime" } },
    {
      field: "sideEffectsSafety",
      label: { ko: "부작용·안전성", en: "Side Effects & Safety" },
    },
    {
      field: "sessionFrequency",
      label: { ko: "시술 시간·주기", en: "Session & Frequency" },
    },
    {
      field: "candidatesContraindications",
      label: { ko: "시술 대상·금기", en: "Candidates & Contraindications" },
    },
    { field: "costKRW", label: { ko: "예상 비용", en: "Estimated Cost (KRW)" } },
    {
      field: "reviewsSummary",
      label: { ko: "후기 요약", en: "Reviews Summary" },
    },
    { field: "precautions", label: { ko: "주의 사항", en: "Precautions" } },
    { field: "providerNotes", label: { ko: "의료진 메모", en: "Provider Notes" } },
  ];

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKey = e.target.value;
    console.log('📱 Dropdown changed to:', newKey);
    setActiveKey(newKey);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Mobile: Select Dropdown - Show on screens smaller than 768px */}
      <div className="block md:hidden mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {lang === "ko" ? "시술 선택" : "Select Treatment"}
        </h2>
        <div className="relative">
          <select
            value={activeKey || ""}
            onChange={handleDropdownChange}
            className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 appearance-none cursor-pointer shadow-sm"
          >
            {treatments.length > 0 ? (
              treatments.map((t) => {
                const title = pickLang(lang, t.title) || t.key;
                return (
                  <option key={t.key} value={t.key}>
                    {title}
                  </option>
                );
              })
            ) : (
              <option value="">No treatments available</option>
            )}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-12 md:gap-6">
        {/* Desktop: Left Sidebar - Show on screens 768px and larger */}
        <aside className="hidden md:block md:col-span-4">
          <h2 className="text-xl font-semibold mb-3">
            {lang === "ko" ? "시술 리스트" : "Treatments"}
          </h2>
          <div className="rounded-2xl border p-2">
            <ul className="flex flex-col">
              {treatments.map((t) => {
                const isActive = t.key === activeKey;
                const title = pickLang(lang, t.title) || t.key;
                return (
                  <li key={t.key}>
                    <button
                      onClick={() => {
                        console.log('🖱️ Sidebar clicked:', t.key);
                        setActiveKey(t.key);
                      }}
                      className={[
                        "w-full text-left px-4 py-3 rounded-xl",
                        "hover:bg-neutral-100 transition",
                        isActive ? "bg-neutral-100 font-medium" : "",
                      ].join(" ")}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className="text-sm text-neutral-500">{t.key}</div>
                      <div className="text-base">{title}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Content: Treatment Details */}
        <section className="w-full md:col-span-8 mt-0">
        {active ? (
          <div className="space-y-6">
            <header className="space-y-1">
              <div className="text-sm text-neutral-500">{active.key}</div>
              <h1 className="text-2xl font-semibold">
                {pickLang(lang, active.title) || active.key}
              </h1>
            </header>

            <div className="space-y-5">
              {sections.map(({ field, label }) => {
                const text = pickLang(lang, active[field] as LocalizedText);
                if (!text) return null;
                return (
                  <div key={field} className="rounded-2xl border p-4">
                    <h3 className="font-medium mb-1">
                      {lang === "ko" ? label.ko : label.en}
                    </h3>
                    <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                      {text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-neutral-500">
            {lang === "ko"
              ? "시술을 선택하면 상세 정보가 표시됩니다."
              : "Select a treatment to view details."}
          </div>
        )}
        </section>
      </div>
    </div>
  );
}
