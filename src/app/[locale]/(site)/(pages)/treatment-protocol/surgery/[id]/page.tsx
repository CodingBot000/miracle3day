'use client';

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSurgeryDetail, useSurgeryCategories } from "@/hooks/useTreatmentData";
import type { Locale } from "@/models/surgeryData.dto";
import { useLocale } from "next-intl";
import LottieLoading from "@/components/atoms/LottieLoading";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default function SurgeryDetailPage({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale() as 'ko' | 'en';

  const { data: surgery, isLoading, error } = useSurgeryDetail(params.id);

  // Get category from URL params or from surgery data
  const categoryParam = searchParams.get('category');
  const surgeryCategory = surgery?.category || categoryParam;

  // Fetch all surgeries in the same category for navigation
  const { data: categoriesData } = useSurgeryCategories(surgeryCategory || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LottieLoading size={200} />
      </div>
    );
  }

  if (error || !surgery) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {locale === 'ko' ? '수술 정보를 불러올 수 없습니다' : 'Failed to load surgery details'}
        </h2>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {locale === 'ko' ? '뒤로 가기' : 'Go Back'}
        </button>
      </div>
    );
  }

  const areaName = locale === 'ko' ? surgery.area_name_ko : surgery.area_name_en;

  // Get all surgeries in the same category
  const surgeries = categoriesData?.categories[0]?.surgeries || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F5FD] via-white to-[#E0E8F8] py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">
            {locale === 'ko' ? '목록으로' : 'Back to List'}
          </span>
        </button>

        {/* Surgery Navigation Tabs */}
        {surgeries.length > 0 && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              {locale === 'ko' ? '부위' : 'Area'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {surgeries.map((item) => {
                const isSelected = item.id === params.id;
                const itemName = locale === 'ko' ? item.area_name_ko : item.area_name_en;

                return (
                  <Link
                    key={item.id}
                    href={`/treatment-protocol/surgery/${item.id}?category=${surgeryCategory}`}
                    replace
                    className={`
                      px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
                      ${isSelected
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {itemName}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Header */}
        <header className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">💉</span>
            <h1 className="text-3xl font-bold text-[#1E3A8A]">
              {areaName}
            </h1>
          </div>

          {/* Tagline */}
          {surgery.preparation?.tagline && (
            <div className="mb-4">
              <p className="text-2xl text-[#3B82F6] italic font-medium">
                {locale === 'ko' ? surgery.preparation.tagline.ko : surgery.preparation.tagline.en}
              </p>
            </div>
          )}

          {/* Description */}
          {surgery.preparation?.description && (
            <p className="text-lg text-gray-700 leading-relaxed">
              {locale === 'ko' ? surgery.preparation.description.ko : surgery.preparation.description.en}
            </p>
          )}
        </header>

        {/* Preparation Section */}
        <Section
          title={locale === 'ko' ? '수술 전 준비' : 'Preparation'}
          titleEn="Pre-Surgery Preparation"
          icon="📋"
        >
          <ul className="space-y-3">
            {Object.entries(surgery.preparation || {}).map(([key, value]) => {
              if (key === 'tagline' || key === 'description') return null;
              if (typeof value === 'object' && value && 'ko' in value && 'en' in value) {
                return (
                  <li key={key} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span className="text-gray-800">
                      {locale === 'ko' ? value.ko : value.en}
                    </span>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </Section>

        {/* Recovery Timeline */}
        <Section
          title={locale === 'ko' ? '회복 과정' : 'Recovery Timeline'}
          titleEn="Post-Surgery Recovery"
          icon="📅"
        >
          <div className="space-y-4">
            {Object.entries(surgery.recovery_timeline || {}).map(([key, value]) => {
              if (!value || typeof value !== 'object' || !('ko' in value) || !('en' in value)) {
                return null;
              }
              return (
                <div key={key} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⏰</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-[#1E3A8A] mb-1">
                      {formatTimelineKey(key, locale)}
                    </h4>
                    
                    <p className="text-gray-700 mb-1">{locale === 'ko' ? value.ko : value.en}</p>
                    
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Expected Results */}
        <Section
          title={locale === 'ko' ? '기대 효과' : 'Expected Results'}
          titleEn="What to Expect"
          icon="✨"
        >
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
            {/* Duration */}
            {surgery.expected_results?.duration && (
              <div className="mb-4 pb-4 border-b border-blue-200">
                <span className="text-sm text-gray-600 block mb-1">
                  {locale === 'ko' ? '지속 기간' : 'Duration'}
                </span>
                <p className="text-2xl font-bold text-blue-600">
                  {locale === 'ko'
                    ? surgery.expected_results.duration.ko
                    : surgery.expected_results.duration.en
                  }
                </p>
              </div>
            )}

            {/* Benefits */}
            <div>
              <h4 className="font-semibold text-lg text-[#1E3A8A] mb-3">
                {locale === 'ko' ? '주요 효과' : 'Key Benefits'}
              </h4>
              <ul className="space-y-2">
                {surgery.expected_results?.benefits?.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 text-xl mt-0.5">✓</span>
                    <span className="text-gray-800">
                      {locale === 'ko' ? benefit.ko : (benefit.en || benefit.ko)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Cautions */}
        <Section
          title={locale === 'ko' ? '주의사항' : 'Important Notes'}
          titleEn="Cautions & Considerations"
          icon="⚠️"
        >
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <p className="text-gray-800 leading-relaxed">
              {locale === 'ko' ? surgery.cautions?.ko : surgery.cautions?.en}
            </p>
          </div>
        </Section>

        {/* Contact/Booking CTA */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {locale === 'ko' ? '상담 예약' : 'Book a Consultation'}
          </h3>
          <p className="text-gray-600 mb-6">
            {locale === 'ko'
              ? '전문의와 상담하고 맞춤형 수술 계획을 세워보세요'
              : 'Consult with our specialists to create a personalized surgery plan'
            }
          </p>
          <button
            onClick={() => router.push('/hospital')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            {locale === 'ko' ? '병원 찾기' : 'Find Hospitals'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Section Component
function Section({
  title,
  titleEn,
  icon,
  children,
}: {
  title: string;
  titleEn: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-blue-100">
        <span className="text-3xl">{icon}</span>
        <div>
          <h2 className="text-2xl font-bold text-[#1E3A8A]">{title}</h2>
          <p className="text-sm text-gray-500">{titleEn}</p>
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}

// Timeline Key Formatter
function formatTimelineKey(key: string, locale: Locale): string {
  const formatMap: Record<string, { ko: string; en: string }> = {
    'immediate': { ko: '수술 직후', en: 'Immediately After' },
    'day_1_3': { ko: '수술 후 1~3일', en: 'Days 1-3' },
    'day_3_4': { ko: '수술 후 3~4일', en: 'Days 3-4' },
    'pod_1_3': { ko: '수술 후 1~3일', en: 'Post-Op Days 1-3' },
    'pod_7': { ko: '수술 후 7일', en: 'Post-Op Day 7' },
    'pod_14': { ko: '수술 후 14일', en: 'Post-Op Day 14' },
    'week_1': { ko: '1주차', en: 'Week 1' },
    'week_2': { ko: '2주차', en: 'Week 2' },
    'week_1_2': { ko: '1~2주', en: 'Weeks 1-2' },
    'week_2_4': { ko: '2~4주', en: 'Weeks 2-4' },
    'month_1': { ko: '1개월', en: 'Month 1' },
    'month_2_3': { ko: '2~3개월', en: 'Months 2-3' },
    'month_3_6': { ko: '3~6개월', en: 'Months 3-6' },
    'month_6_plus': { ko: '6개월 이후', en: 'After 6 Months' },
  };

  const formatted = formatMap[key];
  if (formatted) {
    return locale === 'ko' ? formatted.ko : formatted.en;
  }

  // Fallback: capitalize and format the key
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
