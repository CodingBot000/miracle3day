'use client';

import React, { useState } from 'react';
import { Sparkles, Droplet, Stethoscope, Scissors, FlaskConical, Film, Heart } from 'lucide-react';
import Link from 'next/link';

interface Section {
  id: number;
  title: {
    ko: string;
    en: string;
  };
  description: {
    ko: string;
    en: string;
  };
  slug: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface Props {
  params: {
    locale: string;
  };
}

export default function KBeautyIndexPage({ params }: Props) {
  const { locale } = params;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sections: Section[] = [
    {
      id: 1,
      title: {
        ko: "왜 한국 미용의료가 세계 제일인가?",
        en: "Why Korean Medical Aesthetics Leads the World"
      },
      description: {
        ko: "한국 미용의료가 세계를 선도하는 독특한 요인들을 발견하세요",
        en: "Discover the unique factors that make Korean medical aesthetics a global pioneer"
      },
      slug: "why-k-beauty-is-best",
      icon: Sparkles,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50"
    },
    {
      id: 2,
      title: {
        ko: "K-스킨케어의 비밀",
        en: "The Secret of K-Skincare"
      },
      description: {
        ko: "한국 스킨케어 혁명의 혁신적인 방법과 성분을 공개합니다",
        en: "Unveil the innovative methods and ingredients behind Korea's skincare revolution"
      },
      slug: "k-skincare-secret",
      icon: Droplet,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      title: {
        ko: "피부과 치료",
        en: "Dermatology Treatments"
      },
      description: {
        ko: "첨단 피부과 시술과 최신 기술을 탐험하세요",
        en: "Explore advanced dermatological procedures and cutting-edge technologies"
      },
      slug: "dermatology-treatments",
      icon: Stethoscope,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50"
    },
    {
      id: 4,
      title: {
        ko: "성형외과 철학",
        en: "Plastic Surgery Philosophy"
      },
      description: {
        ko: "한국식 미적 개선과 자연미에 대한 접근을 이해하세요",
        en: "Understanding the Korean approach to aesthetic enhancement and natural beauty"
      },
      slug: "plastic-surgery-philosophy",
      icon: Scissors,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50"
    },
    {
      id: 5,
      title: {
        ko: "과학과 R&D",
        en: "Science and R&D"
      },
      description: {
        ko: "한국 뷰티 혁신을 주도하는 연구 개발",
        en: "The research and development driving Korea's beauty innovation"
      },
      slug: "science-and-rd",
      icon: FlaskConical,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50"
    },
    {
      id: 6,
      title: {
        ko: "K-문화의 영향",
        en: "K-Culture Impact"
      },
      description: {
        ko: "한국 대중문화가 세계 뷰티 기준과 트렌드를 형성하는 방법",
        en: "How Korean pop culture shapes global beauty standards and trends"
      },
      slug: "k-culture-impact",
      icon: Film,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50"
    },
    {
      id: 7,
      title: {
        ko: "뷰티 라이프스타일",
        en: "Beauty Lifestyle"
      },
      description: {
        ko: "한국식 뷰티 관리법을 일상에 통합하기",
        en: "Integrating Korean beauty practices into your daily routine"
      },
      slug: "beauty-lifestyle",
      icon: Heart,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50"
    }
  ];

  const isKorean = locale === 'ko';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" style={{ fontFamily: "'Crimson Pro', 'Noto Serif KR', serif" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
              {isKorean ? 'K-뷰티 가이드' : 'K-Beauty Guide'}
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              {isKorean
                ? '한국 미용의료, 스킨케어, 뷰티 혁신의 세계를 탐험하세요'
                : 'Explore the world of Korean medical aesthetics, skincare, and beauty innovation'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isHovered = hoveredIndex === index;

            return (
              <Link
                key={section.id}
                href={`/contents/post/${locale}/${section.slug}/`}
                className="group block"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className={`
                  relative h-full p-6 rounded-2xl border-2 border-slate-200
                  transition-all duration-300 ease-out
                  ${isHovered ? 'shadow-2xl scale-105 border-transparent' : 'shadow-md hover:shadow-xl'}
                  ${section.bgColor}
                `}>
                  {/* Gradient Overlay on Hover */}
                  <div className={`
                    absolute inset-0 rounded-2xl bg-gradient-to-br ${section.color} opacity-0
                    transition-opacity duration-300
                    ${isHovered ? 'opacity-10' : ''}
                  `} />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`
                      inline-flex p-3 rounded-xl bg-gradient-to-br ${section.color}
                      transition-transform duration-300
                      ${isHovered ? 'scale-110' : ''}
                      mb-4
                    `}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Number Badge */}
                    <div className="absolute top-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-700">{section.id}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
                      {isKorean ? section.title.ko : section.title.en}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {isKorean ? section.description.ko : section.description.en}
                    </p>

                    {/* Arrow Indicator */}
                    <div className={`
                      flex items-center text-sm font-semibold
                      bg-gradient-to-r ${section.color} bg-clip-text text-transparent
                      transition-transform duration-300
                      ${isHovered ? 'translate-x-2' : ''}
                    `}>
                      <span>{isKorean ? '탐험하기' : 'Explore'}</span>
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
            <p className="text-slate-600 mb-4">
              {isKorean
                ? 'K-뷰티의 비밀을 발견할 준비가 되셨나요?'
                : 'Ready to discover the secrets of K-Beauty?'}
            </p>
            <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {isKorean
                ? '위에서 여정을 시작하세요'
                : 'Start your journey above'}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>
            {isKorean
              ? '한국 뷰티 혁신의 종합 가이드'
              : 'Your comprehensive guide to Korean beauty innovation'}
          </p>
        </div>
      </footer>
    </div>
  );
}
