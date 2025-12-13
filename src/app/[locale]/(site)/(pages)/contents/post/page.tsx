'use client';

import React, { useState } from 'react';
import { Sparkles, Droplet, Stethoscope, Scissors, FlaskConical, Film, Heart } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface Section {
  id: number;
  titleKey: string;
  descriptionKey: string;
  slug: string;
  icon: any;
  color: string;
  bgColor: string;
}

export default function KBeautyIndexPage() {
  const t = useTranslations();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sections: Section[] = [
    {
      id: 1,
      titleKey: 'sections.section1.title',
      descriptionKey: 'sections.section1.tagline',
      slug: 'why-k-beauty-is-best',
      icon: Sparkles,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50'
    },
    {
      id: 2,
      titleKey: 'sections.section2.title',
      descriptionKey: 'sections.section2.tagline',
      slug: 'k-skincare-secret',
      icon: Droplet,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 3,
      titleKey: 'sections.section3.title',
      descriptionKey: 'sections.section3.tagline',
      slug: 'dermatology-treatments',
      icon: Stethoscope,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50'
    },
    {
      id: 4,
      titleKey: 'sections.section4.title',
      descriptionKey: 'sections.section4.tagline',
      slug: 'plastic-surgery-philosophy',
      icon: Scissors,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50'
    },
    {
      id: 5,
      titleKey: 'sections.section5.title',
      descriptionKey: 'sections.section5.tagline',
      slug: 'science-and-rd',
      icon: FlaskConical,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 6,
      titleKey: 'sections.section6.title',
      descriptionKey: 'sections.section6.tagline',
      slug: 'k-culture-impact',
      icon: Film,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50'
    },
    {
      id: 7,
      titleKey: 'sections.section7.title',
      descriptionKey: 'sections.section7.tagline',
      slug: 'beauty-lifestyle',
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" style={{ fontFamily: "'Crimson Pro', 'Noto Serif KR', serif" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        {/* <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
              {t('navigation.sections')}
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              {t('navigation.about')}
            </p>
          </div>
        </div> */}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isHovered = hoveredIndex === index;
            const title = t(section.titleKey);
            const description = t(section.descriptionKey);

            return (
              <Link
                key={section.id}
                href={`/contents/post/${section.slug}`}
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
                    {/* <div className="absolute top-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-700">{section.id}</span>
                    </div> */}

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
                      {title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {description}
                    </p>

                    {/* Arrow Indicator */}
                    <div className={`
                      flex items-center text-sm font-semibold
                      bg-gradient-to-r ${section.color} bg-clip-text text-transparent
                      transition-transform duration-300
                      ${isHovered ? 'translate-x-2' : ''}
                    `}>
                      <span>{t('common.readMore')}</span>
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
        {/* <div className="mt-16 text-center">
          <div className="inline-block p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
            <p className="text-slate-600 mb-4">
              {t('navigation.about')}
            </p>
            <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t('navigation.home')}
            </p>
          </div>
        </div> */}
      </main>

      {/* Footer */}
      {/* <footer className="mt-20 py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>
            {t('navigation.sections')}
          </p>
        </div>
      </footer> */}
    </div>
  );
}
