'use client';

import Link from 'next/link';
import { Globe, Calendar, ExternalLink, ChevronRight } from 'lucide-react';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';

type Language = 'ko' | 'en';

interface LocalizedText {
  ko: string;
  en: string;
}

interface GuideCard {
  icon: React.ReactNode;
  title: LocalizedText;
  description: LocalizedText;
  href: string | ((lang: Language) => string);
  ctaText: LocalizedText;
}

const guideCards: GuideCard[] = [
  {
    icon: <Globe className="w-6 h-6" />,
    title: { ko: '왜 한국인가?', en: 'Why Korea?' },
    description: {
      ko: '한국 피부과가 세계를 선도하는 7가지 이유',
      en: '7 reasons why Korean aesthetic dermatology leads the world',
    },
    href: (lang) => `/contents/post/${lang}`,
    ctaText: { ko: '자세히 보기', en: 'Learn More' },
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: { ko: '세대별 가이드', en: 'Generation Guide' },
    description: {
      ko: '모든 세대를 위한 전문 스킨케어 팁',
      en: 'Expert skincare tips tailored for every generation',
    },
    href: '/treatment-based-age-guide',
    ctaText: { ko: '가이드 보기', en: 'Read Guide' },
  },
  {
    icon: <ExternalLink className="w-6 h-6" />,
    title: { ko: 'K-뷰티 링크', en: 'K-Beauty Links' },
    description: {
      ko: '쇼핑부터 커뮤니티까지 20개 이상의 엄선된 리소스',
      en: '20+ curated resources from shopping to communities',
    },
    href: '/partners',
    ctaText: { ko: '둘러보기', en: 'Explore' },
  },
];

export default function KBeautyGuideSection() {
  const { language: lang } = useCookieLanguage();

  return (
    <section className="bg-stone-50 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-10">
          <div className="text-center text-2xl md:text-4xl font-bold tracking-tight">
            {lang === "ko" ? "KBeauty 살펴보기" : "Explore K-Beauty"}
          </div>
          
          {/* <p className="text-gray-500 text-sm lg:text-base">
              {lang === "ko" ? "가이드라인" : "Guides & Resources"}
          </p> */}
        </div>

        {/* Cards Grid */}
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {guideCards.map((card, index) => (
            <Link
              key={index}
              href={typeof card.href === 'function' ? card.href(lang) : card.href}
              className="group block bg-white rounded-2xl border border-gray-100 shadow-lg
                         p-6 transition-all duration-200
                         hover:shadow-md hover:border-orange-200
                         lg:flex-1"
            >
              {/* Icon + Title Row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 text-orange-500">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {card.title[lang]}
                </h3>
              </div>

              {/* Description */}
              <p className="text-gray-500 text-base md:text-lg font-semibold leading-relaxed mb-4">
                {card.description[lang]}
              </p>

              {/* CTA */}
              <div className="flex items-center text-orange-500 text-base md:text-lg font-medium group-hover:text-orange-600">
                <span>{card.ctaText[lang]}</span>
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
