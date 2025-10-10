"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTopicDetail } from "@/hooks/useTreatmentData";
import type { Locale } from "@/app/models/treatmentData.dto";
import { useLanguage } from "@/contexts/LanguageContext";
import TreatmentDetailCard from "../_demo/TreatmentDetailCard";
import { buildInfoLine } from "../../../constants/treatment/types";
import { ArrowLeft } from "lucide-react";
import { InfoIcon } from "@/components/icons/InfoIcon";

export default function ProtocolPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const topic_id = searchParams.get("topic_id");
  const area_id = searchParams.get("area_id");
  const locale = language as Locale;

  // Always call hooks first - fetch topic detail data
  const { data: topicDetail, isLoading, error } = useTopicDetail(
    topic_id || "", 
    area_id || ""
  );

  // Callback functions (hooks must be called before any conditional returns)
  const handleBook = React.useCallback((treatment: any) => {
    console.log('Book treatment:', treatment.id);
  }, []);

  const handleContact = React.useCallback((treatment: any) => {
    console.log('Contact for treatment:', treatment.id);
  }, []);

  const handleAreaChange = React.useCallback((newAreaId: string) => {
    if (!topic_id) return;
    const params = new URLSearchParams({
      topic_id: topic_id,
      area_id: newAreaId
    });
    router.push(`/treatment-landing-v2/protocol?${params.toString()}`);
  }, [topic_id, router]);

  // Now do conditional returns after all hooks are called
  if (!topic_id || !area_id) {
    return (
      <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Parameters</h1>
          <p className="text-gray-600 mt-2">Please provide both topic_id and area_id.</p>
          <button
            onClick={() => router.push('/treatment-landing-v2')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading treatment details...</div>
        </div>
      </div>
    );
  }

  if (error || !topicDetail) {
    return (
      <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error Loading Data</h1>
          <p className="text-gray-600 mt-2">Failed to load treatment details.</p>
          <button
            onClick={() => router.push('/treatment-landing-v2')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  const { areas, content } = topicDetail;

  return (
    <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <button
            onClick={() => router.push('/treatment-landing-v2')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-extrabold">
            {locale === 'ko' ? content.topic_title_ko : content.topic_title_en}
          </h1>
          {/* <p className="text-neutral-600">
            {locale === 'ko' ? content.area_name_ko : content.area_name_en}
          </p> */}
        </div>
      </header>

      {/* Area Tabs */}
      <div className="bg-white rounded-lg p-4 shadow-sm">

        <div className="flex flex-wrap gap-2">
          {areas.map((area) => (
            <button
              key={area.area_id}
              onClick={() => {
                const params = new URLSearchParams({
                  topic_id: topic_id!,
                  area_id: area.area_id
                });
                router.push(`/treatment-landing-v2/protocol?${params.toString()}`);
              }}
              className={`
                px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
                ${area.area_id === area_id
                  ? 'bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {locale === 'ko' ? area.area_name_ko : area.area_name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Treatment Content */}
      <div className="space-y-8">
        {/* Benefits & Sequence & Cautions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
                     
          <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === 'ko' ? '시술 순서' : 'Treatment Sequence'}
              </h3>
              <p className="text-gray-700">
                {locale === 'ko' ? content.sequence_ko : content.sequence_en}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === 'ko' ? '효과' : 'Benefits'}
              </h3>
              <p className="text-gray-700">
                {locale === 'ko' ? content.benefits_ko : content.benefits_en}
              </p>
            </div>
   
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === 'ko' ? '주의사항' : 'Cautions'}
              </h3>
              <p className="text-gray-700">
                {locale === 'ko' ? content.cautions_ko : content.cautions_en}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Treatments */}
        {content.primary_treatments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#8B4513] mb-4">
              {locale === 'ko' ? '대표 시술' : 'Primary Treatments'} <InfoIcon locale={locale} kind="primary" />
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {content.primary_treatments.map((treatment, index) => (
                <TreatmentDetailCard
                  key={`primary-${treatment.id}-${index}`}
                  data={{
                    id: treatment.id,
                    name: { ko: treatment.ko, en: treatment.en },
                    summary: {
                      ko: treatment.summary?.ko || treatment.summary?.kr || '',
                      en: treatment.summary?.en || treatment.summary?.eng || ''
                    },
                    tags: Array.isArray(treatment.tags) 
                      ? treatment.tags.map((tag: any) => 
                          typeof tag === 'string' 
                            ? { ko: tag, en: tag } 
                            : tag
                        )
                      : [],
                    attributes: {
                      effect: {
                        onset_label: {
                          ko: '효과 발현',
                          en: 'Effect Onset'
                        },
                        onset_weeks_min: treatment.attributes?.effect?.onset_weeks_min || 0,
                        onset_weeks_max: treatment.attributes?.effect?.onset_weeks_max || 0,
                        duration_months_min: treatment.attributes?.effect?.duration_months_min || 0,
                        duration_months_max: treatment.attributes?.effect?.duration_months_max || 0
                      },
                      downtime: {
                        ko: treatment.attributes?.downtime?.ko || '',
                        en: treatment.attributes?.downtime?.en || ''
                      },
                      pain: {
                        level: (treatment.attributes?.pain?.level as any) || 'none',
                        pain_score_0_10: treatment.attributes?.pain?.pain_score_0_10 || 0
                      },
                      cost: {
                        currency: treatment.attributes?.cost?.currency || 'KRW',
                        from: treatment.attributes?.cost?.from || 0
                      },
                      recommended: {
                        sessions_min: treatment.attributes?.recommended?.sessions_min || 1,
                        sessions_max: treatment.attributes?.recommended?.sessions_max || 1,
                        interval_weeks: treatment.attributes?.recommended?.interval_weeks || 0,
                        maintenance_note: {
                          ko: treatment.attributes?.recommended?.maintenance_note?.ko || '',
                          en: treatment.attributes?.recommended?.maintenance_note?.en || ''
                        }
                      }
                    }
                  }}
                  locale={locale}
                  onBook={(treatment) => console.log('Book treatment:', treatment.id)}
                  onContact={(treatment) => console.log('Contact for treatment:', treatment.id)}
                  buildInfoLine={buildInfoLine}
                />
              ))}
            </div>
          </div>
        )}

        {/* Alternative Treatments */}
        {content.alt_treatments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#8B4513] mb-4">
              {locale === 'ko' ? '대체/보완 시술' : 'Alternative Treatments'} <InfoIcon locale={locale} kind="alternative" />
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {content.alt_treatments.map((treatment, index) => (
                <TreatmentDetailCard
                  key={`alt-${treatment.id}-${index}`}
                  data={{
                    id: treatment.id,
                    name: { ko: treatment.ko, en: treatment.en },
                    summary: {
                      ko: treatment.summary?.ko || treatment.summary?.kr || '',
                      en: treatment.summary?.en || treatment.summary?.eng || ''
                    },
                    tags: Array.isArray(treatment.tags) 
                      ? treatment.tags.map((tag: any) => 
                          typeof tag === 'string' 
                            ? { ko: tag, en: tag } 
                            : tag
                        )
                      : [],
                    attributes: {
                      effect: {
                        onset_label: {
                          ko: '효과 발현',
                          en: 'Effect Onset'
                        },
                        onset_weeks_min: treatment.attributes?.effect?.onset_weeks_min || 0,
                        onset_weeks_max: treatment.attributes?.effect?.onset_weeks_max || 0,
                        duration_months_min: treatment.attributes?.effect?.duration_months_min || 0,
                        duration_months_max: treatment.attributes?.effect?.duration_months_max || 0
                      },
                      downtime: {
                        ko: treatment.attributes?.downtime?.ko || '',
                        en: treatment.attributes?.downtime?.en || ''
                      },
                      pain: {
                        level: (treatment.attributes?.pain?.level as any) || 'none',
                        pain_score_0_10: treatment.attributes?.pain?.pain_score_0_10 || 0
                      },
                      cost: {
                        currency: treatment.attributes?.cost?.currency || 'KRW',
                        from: treatment.attributes?.cost?.from || 0
                      },
                      recommended: {
                        sessions_min: treatment.attributes?.recommended?.sessions_min || 1,
                        sessions_max: treatment.attributes?.recommended?.sessions_max || 1,
                        interval_weeks: treatment.attributes?.recommended?.interval_weeks || 0,
                        maintenance_note: {
                          ko: treatment.attributes?.recommended?.maintenance_note?.ko || '',
                          en: treatment.attributes?.recommended?.maintenance_note?.en || ''
                        }
                      }
                    }
                  }}
                  locale={locale}
                  onBook={(treatment) => console.log('Book treatment:', treatment.id)}
                  onContact={(treatment) => console.log('Contact for treatment:', treatment.id)}
                  buildInfoLine={buildInfoLine}
                />
              ))}
            </div>
          </div>
        )}

        {/* Combo Treatments */}
        {content.combo_treatments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#8B4513] mb-4">
              {locale === 'ko' ? '병합 권장 시술' : 'Combination Treatments'} <InfoIcon locale={locale} kind="combo" />
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {content.combo_treatments.map((treatment, index) => (
                <TreatmentDetailCard
                  key={`combo-${treatment.id}-${index}`}
                  data={{
                    id: treatment.id,
                    name: { ko: treatment.ko, en: treatment.en },
                    summary: {
                      ko: treatment.summary?.ko || treatment.summary?.kr || '',
                      en: treatment.summary?.en || treatment.summary?.eng || ''
                    },
                    tags: Array.isArray(treatment.tags) 
                      ? treatment.tags.map((tag: any) => 
                          typeof tag === 'string' 
                            ? { ko: tag, en: tag } 
                            : tag
                        )
                      : [],
                    attributes: {
                      effect: {
                        onset_label: {
                          ko: '효과 발현',
                          en: 'Effect Onset'
                        },
                        onset_weeks_min: treatment.attributes?.effect?.onset_weeks_min || 0,
                        onset_weeks_max: treatment.attributes?.effect?.onset_weeks_max || 0,
                        duration_months_min: treatment.attributes?.effect?.duration_months_min || 0,
                        duration_months_max: treatment.attributes?.effect?.duration_months_max || 0
                      },
                      downtime: {
                        ko: treatment.attributes?.downtime?.ko || '',
                        en: treatment.attributes?.downtime?.en || ''
                      },
                      pain: {
                        level: (treatment.attributes?.pain?.level as any) || 'none',
                        pain_score_0_10: treatment.attributes?.pain?.pain_score_0_10 || 0
                      },
                      cost: {
                        currency: treatment.attributes?.cost?.currency || 'KRW',
                        from: treatment.attributes?.cost?.from || 0
                      },
                      recommended: {
                        sessions_min: treatment.attributes?.recommended?.sessions_min || 1,
                        sessions_max: treatment.attributes?.recommended?.sessions_max || 1,
                        interval_weeks: treatment.attributes?.recommended?.interval_weeks || 0,
                        maintenance_note: {
                          ko: treatment.attributes?.recommended?.maintenance_note?.ko || '',
                          en: treatment.attributes?.recommended?.maintenance_note?.en || ''
                        }
                      }
                    }
                  }}
                  locale={locale}
                  onBook={(treatment) => console.log('Book treatment:', treatment.id)}
                  onContact={(treatment) => console.log('Contact for treatment:', treatment.id)}
                  buildInfoLine={buildInfoLine}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}