// app/(site)/treatments/TreatmentsViewer.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import data from "@/constants/treatments_info.json"
import { useCookieLanguage } from "@/hooks/useCookieLanguage";
import BackButton from "@/components/common/BackButton";

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

function pickLang(lang: "ko" | "en", val?: LocalizedText) {
  if (!val) return "";
  return (val[lang] ?? val.ko ?? val.en ?? "").trim();
}

// Helper function to normalize key for comparison (remove spaces and convert to lowercase)
function normalizeKey(key: string): string {
  return key.replace(/\s+/g, "").toLowerCase();
}

export default function TreatmentsViewer() {
  const searchParams = useSearchParams();
  const { language } = useCookieLanguage();
  const lang = (language === "ko" ? "ko" : "en") as "ko" | "en";
  
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
  return (list as unknown[]).filter(isTreatment) as Treatment[];
}, []);

  // Find matching treatment based on URL parameter with normalized key comparison
  const treatmentFromUrl = useMemo(() => {
    const treatmentParam = searchParams.get('treatment');
    if (!treatmentParam) return null;
    
    const normalizedParam = normalizeKey(treatmentParam);
    return treatments.find(treatment => {
      const normalizedTreatmentKey = normalizeKey(treatment.key);
      return normalizedTreatmentKey === normalizedParam;
    }) || null;
  }, [searchParams, treatments]);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Set initial active key based on URL parameter or default to first treatment (only once)
  useEffect(() => {
    if (isInitialized) return;
    
    if (treatmentFromUrl) {
      setActiveKey(treatmentFromUrl.key);
      setIsInitialized(true);
    } else if (treatments.length > 0) {
      setActiveKey(treatments[0].key);
      setIsInitialized(true);
    }
  }, [treatmentFromUrl, treatments, isInitialized]);

  const active = useMemo(() => {
    return treatments.find((t) => t.key === activeKey) ?? null;
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
    setActiveKey(newKey);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-1 mb-[-40px]">
      {/* Mobile: Select Dropdown - Show on screens smaller than 768px */}
      <div className="block md:hidden mb-6">
      
         <div className="mt-6 mb-6 flex items-center gap-2">
   
            {/* <BackButton size="lg" strokeWidth={2.5} /> */}
           <h2 className="text-2xl font-semibold mb-3 flex-shrink-0">
            {lang === "ko" ? "시술 선택" : "Select Treatment"}
            </h2>
        </div>
        {/* <h2 className="text-xl font-semibold mb-4">
          {lang === "ko" ? "시술 선택" : "Select Treatment"}
        </h2> */}
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
        <aside className="hidden md:flex md:flex-col md:col-span-4">
         <div className="mt-6 mb-6 flex items-center gap-2">
   
            {/* <BackButton size="lg" strokeWidth={2.5} /> */}
           <h2 className="text-xl md:text-2xl font-semibold mb-3 flex-shrink-0">
              {lang === "ko" ? "시술 리스트" : "Treatments"}
            </h2>
        </div>
            
          <div className="rounded-2xl border p-2 md:max-h-[600px]">
            <div className="md:max-h-[550px] overflow-y-auto">
              <ul className="flex flex-col">
                {treatments.map((t) => {
                  const isActive = t.key === activeKey;
                  const title = pickLang(lang, t.title) || t.key;
                  return (
                    <li key={t.key}>
                      <button
                        onClick={() => setActiveKey(t.key)}
                        className={[
                          "w-full text-left px-4 py-3 rounded-xl",
                          "hover:bg-neutral-100 transition",
                          isActive ? "bg-neutral-100 font-medium" : "",
                        ].join(" ")}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {/* <div className="text-sm text-neutral-500">{t.key}</div> */}
                        <div className="text-base">{title}</div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>

        {/* Content: Treatment Details */}
        <section className="w-full md:col-span-8 mt-3 md:mt-20" key={activeKey}>
          <div className="md:max-h-[600px] md:overflow-y-auto">
            {active ? (
              <div className="space-y-6 md:pr-2">
                <header className="space-y-1">
                  {/* <div className="text-sm text-neutral-500">{active.key}</div> */}
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
          </div>
        </section>
      </div>
    </div>
  );
}
