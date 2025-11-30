'use client';

import { Link } from '@/i18n/routing';
import { Globe, Calendar, ExternalLink, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function KBeautyGuideSection() {
  const t = useTranslations('Home');

  const guideCards = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: t('whyKoreaTitle'),
      description: t('whyKoreaDescription'),
      href: '/contents/post',
      ctaText: t('whyKoreaCta'),
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: t('generationGuideTitle'),
      description: t('generationGuideDescription'),
      href: '/treatment-based-age-guide',
      ctaText: t('generationGuideCta'),
    },
    {
      icon: <ExternalLink className="w-6 h-6" />,
      title: t('kbeautyLinksTitle'),
      description: t('kbeautyLinksDescription'),
      href: '/partners',
      ctaText: t('kbeautyLinksCta'),
    },
  ];

  return (
    <section className="bg-stone-50 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-10">
          <div className="text-center text-2xl md:text-4xl font-bold tracking-tight">
            {t('kbeautySectionTitle')}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {guideCards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
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
                  {card.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-gray-500 text-base md:text-lg font-semibold leading-relaxed mb-4">
                {card.description}
              </p>

              {/* CTA */}
              <div className="flex items-center text-orange-500 text-base md:text-lg font-medium group-hover:text-orange-600">
                <span>{card.ctaText}</span>
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
