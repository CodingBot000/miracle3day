"use client";

import { log } from '@/utils/logger';


import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTopicDetail } from "@/hooks/useTreatmentData";
import type { Benefits, Locale, SequenceStep, SequenceTitle, LocalizedText } from "@/app/models/treatmentData.dto";
import { useLocale } from "next-intl";
import TreatmentDetailCard from "../_demo/TreatmentDetailCard";
import { buildInfoLine } from "@/constants/treatment/types";
import { ArrowLeft } from "lucide-react";
import { InfoIcon } from "@/components/icons/InfoIcon";
import LottieLoading from '@/components/atoms/LottieLoading';

function getTitleByLocale(title: SequenceTitle, locale: Locale): string {
  if (locale === "ko") return title.ko ?? title.en ?? "";
  return title.en ?? title.ko ?? "";
}

function pickLocale<T extends { ko?: string | null; en?: string | null }>(
  value: T | undefined,
  locale: Locale
): string {
  if (!value) {
    return "";
  }

  return locale === "ko"
    ? value.ko ?? value.en ?? ""
    : value.en ?? value.ko ?? "";
}

type SequenceTimelineProps = {
  steps: SequenceStep[];
  locale: Locale;
  stepCount?: number;
};

function SequenceTimeline({ steps, locale, stepCount }: SequenceTimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const showStepNumber = sortedSteps.length > 1;

  if (!sortedSteps.length) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/75 via-white/65 to-white/55 p-6 shadow-[0_18px_40px_rgba(212,165,154,0.18)] backdrop-blur-xl md:p-8">
      <div className="border-l-4 border-[#d4a59a] pl-4">

        <h3 className="mt-1 text-2xl font-semibold text-[#6b4e44]">
          {locale === "ko" ? "시술 순서" : "Treatment Plan"}
        </h3>
 
      </div>

      <ol className="mt-8 space-y-6">
        {sortedSteps.map((step, index) => {
          const waitMin = step.timing?.waitMinDays ?? null;
          const waitMax = step.timing?.waitMaxDays ?? null;
          const hasWaitInfo = waitMin !== null || waitMax !== null;

          return (
            <li key={step.order}>
              <div className="flex gap-4 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_16px_30px_rgba(212,165,154,0.16)] backdrop-blur-xl md:gap-6 md:p-6">
                {showStepNumber && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border-4 border-white/70 bg-[#d4a59a] text-xl font-semibold text-white shadow-[0_8px_16px_rgba(212,165,154,0.35)]">
                    {index + 1}
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-semibold text-[#6b4e44]">
                      {getTitleByLocale(step.title, locale)}
                    </p>
                    {step.timing?.afterWeeks && (
                      <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-[#a88f84] shadow-inner">
                        {locale === "ko"
                          ? `${step.timing.afterWeeks}주 후`
                          : `~${step.timing.afterWeeks} weeks later`}
                      </span>
                    )}
                  </div>

                  {hasWaitInfo && (
                    <p className="text-xs text-[#a88f84]">
                      {locale === "ko"
                        ? `다음 단계까지 ${waitMin ?? ""}${
                            waitMax !== null ? `~${waitMax}` : ""
                          }일`
                        : `Wait ${waitMin ?? ""}${
                            waitMax !== null ? `~${waitMax}` : ""
                          } days`}
                    </p>
                  )}

                  {step.note && (
                    <p className="text-sm leading-relaxed text-[#8b7266]">
                      {step.note}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

type BenefitsProps = {
  benefits: Benefits | null | undefined;
  locale: Locale;
};

const defaultEmojis = ["✨", "💫", "🌟", "💎", "🌸", "🌼"];

function BenefitsBlock({ benefits, locale }: BenefitsProps) {
  if (!benefits) {
    return null;
  }

  const inputs = Array.isArray(benefits.inputs) ? benefits.inputs : [];
  const result = benefits.result;
  const resultText = pickLocale(result?.title, locale);
  const hasInputs = inputs.length > 0;

  if (!hasInputs && !resultText) {
    return (
      <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/75 via-white/65 to-white/55 p-6 text-[#8b7266] shadow-[0_18px_40px_rgba(212,165,154,0.18)] backdrop-blur-xl md:p-8">
        {locale === "ko"
          ? "등록된 효과 정보가 없습니다."
          : "No benefits available."}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/75 via-white/65 to-white/55 p-6 shadow-[0_18px_40px_rgba(212,165,154,0.18)] backdrop-blur-xl md:p-8">
      <div className="border-l-4 border-[#d4a59a] pl-4">

        <h3 className="mt-1 text-2xl font-semibold text-[#6b4e44]">
          {locale === "ko" ? "효과 & 결과" : "Benefits & Result"}
        </h3>
        <p className="mt-1 text-sm text-[#8b7266]">
          {locale === "ko"
            ? "어떤 변화를 기대할 수 있을까요?"
            : "What positive changes to expect"}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {hasInputs && (
          <div className="grid gap-4 md:grid-cols-2">
            {inputs.map((input, index) => {
              const emoji =
                (input.meta && typeof input.meta.emoji === "string"
                  ? input.meta.emoji
                  : undefined) ?? defaultEmojis[index % defaultEmojis.length];

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_14px_30px_rgba(212,165,154,0.16)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:p-6"
                >
                  <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-[#d4a59a]/20 blur-2xl" />
                  <div className="flex items-center gap-3">
                    <span className="text-3xl drop-shadow-sm">{emoji}</span>
                    <div>
                      
                      <p className="mt-1 text-base font-semibold text-[#6b4e44]">
                        {pickLocale(input.title, locale)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center text-xl text-[#d4a59a] drop-shadow-sm md:text-4xl">
          ↓
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 text-center shadow-[0_18px_36px_rgba(212,165,154,0.2)] backdrop-blur-xl md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#a88f84]">
            {locale === "ko" ? "결과" : "Result"}
          </p>
          <p className="mt-3 text-2xl font-semibold text-[#6b4e44] md:text-3xl">
            {resultText}
          </p>
          {result?.meta?.description && (
            <p className="mt-2 text-sm text-[#8b7266]">
              {String(result.meta.description)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type CautionsProps = {
  cautions: LocalizedText | null | undefined;
  locale: Locale;
};

function CautionsBlock({ cautions, locale }: CautionsProps) {
  const text = pickLocale(cautions ?? undefined, locale).trim();

  if (!text) {
    return (
      <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/75 via-white/65 to-white/55 p-6 text-[#8b7266] shadow-[0_18px_40px_rgba(212,165,154,0.18)] backdrop-blur-xl md:p-8">
        {locale === "ko"
          ? "등록된 주의사항이 없습니다."
          : "No cautions available."}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/75 via-white/65 to-white/55 p-6 shadow-[0_18px_40px_rgba(212,165,154,0.18)] backdrop-blur-xl md:p-8">
      <div className="border-l-4 border-[#d4a59a] pl-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[#a88f84]">
          {locale === "ko" ? "Important Notes" : "Important Notes"}
        </p>
        <h3 className="mt-1 text-2xl font-semibold text-[#6b4e44]">
          {locale === "ko" ? "주의사항" : "Cautions"}
        </h3>
        <p className="mt-1 text-sm text-[#8b7266]">
          {locale === "ko"
            ? "시술 전 꼭 확인해주세요"
            : "Please review before the treatment"}
        </p>
      </div>

      <div className="mt-6 flex gap-4">
        <span className="mt-1 text-3xl drop-shadow-sm">⚠️</span>
        <p className="text-sm leading-relaxed text-[#8b7266] md:text-base">
          {text}
        </p>
      </div>
    </div>
  );
}

export default function ProtocolPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale() as 'ko' | 'en';

  const topic_id = searchParams.get("topic_id");
  const area_id = searchParams.get("area_id");

  // Always call hooks first - fetch topic detail data
  const { data: topicDetail, isLoading, error } = useTopicDetail(
    topic_id || "", 
    area_id || ""
  );

  React.useEffect(() => {
    if (topicDetail) {
      log.debug("[ProtocolPage] topic detail:", topicDetail);
    }
  }, [topicDetail]);

  React.useEffect(() => {
    if (error) {
      console.error("[ProtocolPage] failed to load detail:", error);
    }
  }, [error]);

  // Callback functions (hooks must be called before any conditional returns)
  const handleBook = React.useCallback((treatment: any) => {
    log.debug('Book treatment:', treatment.id);
  }, []);

  const handleContact = React.useCallback((treatment: any) => {
    log.debug('Contact for treatment:', treatment.id);
  }, []);

  const handleAreaChange = React.useCallback((newAreaId: string) => {
    if (!topic_id) return;
    const params = new URLSearchParams({
      topic_id: topic_id,
      area_id: newAreaId
    });
    router.push(`/treatment-protocol/treatment-landing-v2/protocol?${params.toString()}`);
  }, [topic_id, router]);

  // Now do conditional returns after all hooks are called
  if (!topic_id || !area_id) {
    return (
      <div className="py-6 space-y-5 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Parameters</h1>
          <p className="text-gray-600 mt-2">Please provide both topic_id and area_id.</p>
          <button
            onClick={() => router.back()}
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
        <LottieLoading size={200} className="min-h-[400px]" />
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
          {/* <button
            onClick={() => router.push('/treatment-landing-v2')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </button> */}
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
          {areas.map((area) => {
            const isSelected = area.area_id === area_id;
            const areaName = locale === 'ko' ? area.area_name_ko : area.area_name_en;

            return (
              <Link
                key={area.area_id}
                href={`/treatment-protocol/treatment-landing-v2/protocol?topic_id=${topic_id}&area_id=${area.area_id}`}
                replace
                className={`
                  px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
                  ${isSelected
                    ? 'bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {areaName}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Treatment Content */}
      <div className="space-y-10">
        <div className="rounded-3xl border border-white/40 bg-gradient-to-br from-[#fff5f0] via-[#fff9f5] to-[#fde6dc] p-6 shadow-[0_25px_55px_rgba(212,165,154,0.18)] backdrop-blur-xl md:p-10">
          <div className="space-y-10">
            {content.sequence?.length ? (
              <SequenceTimeline
                steps={content.sequence}
                locale={locale}
                stepCount={content.step_count}
              />
            ) : (
              <div className="rounded-3xl border border-white/60 bg-white/70 p-6 text-center text-[#8b7266] shadow-[0_18px_40px_rgba(212,165,154,0.18)] backdrop-blur-xl md:p-8">
                {locale === 'ko'
                  ? '등록된 시술 순서가 없습니다.'
                  : 'No treatment sequence available.'}
              </div>
            )}

            <BenefitsBlock benefits={content.benefits} locale={locale} />
            <CautionsBlock cautions={content.cautions} locale={locale} />
          </div>
        </div>

        {/* Primary Treatments */}
        {content.primary_treatments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#8B4513] mb-4">
              {locale === 'ko' ? '대표 시술' : 'Primary Treatments'} <InfoIcon kind="primary" />
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
                  onBook={(treatment) => log.debug('Book treatment:', treatment.id)}
                  onContact={(treatment) => log.debug('Contact for treatment:', treatment.id)}
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
              {locale === 'ko' ? '대체/보완 시술' : 'Alternative Treatments'} <InfoIcon kind="alternative" />
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
                  onBook={(treatment) => log.debug('Book treatment:', treatment.id)}
                  onContact={(treatment) => log.debug('Contact for treatment:', treatment.id)}
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
              {locale === 'ko' ? '병합 권장 시술' : 'Combination Treatments'} <InfoIcon kind="combo" />
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
                  onBook={(treatment) => log.debug('Book treatment:', treatment.id)}
                  onContact={(treatment) => log.debug('Contact for treatment:', treatment.id)}
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
