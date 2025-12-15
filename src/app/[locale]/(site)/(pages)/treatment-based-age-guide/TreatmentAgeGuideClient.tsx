'use client';

import { useState } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { ageBasedData } from '@/constants/treatment/antiaging-agebased';
import { HeroSection } from './components/HeroSection';
import { IntroSection } from './components/IntroSection';
import { ConcernsSection } from './components/ConcernsSection';
import { TreatmentsSection } from './components/TreatmentsSection';
import { SkinTypesSection } from './components/SkinTypesSection';
import { SpecialTipsSection } from './components/SpecialTipsSection';
import { useLocale, useTranslations } from 'next-intl';

const ageGroups = ['20s', '30s', '40s', '50s', '60s', '70s+'];

export default function TreatmentAgeGuideClient() {
  const [activeTab, setActiveTab] = useState('20s');
  const rawLocale = useLocale();
  const { navigate } = useNavigation();
  const t = useTranslations('TreatmentAgedGuide');

  // Fallback to 'en' for unsupported locales
  const locale = (rawLocale === 'ko' || rawLocale === 'en'
    || rawLocale === 'ja' || rawLocale === 'zh-CN' || rawLocale === 'zh-TW'
  ) ? rawLocale : 'en';

  const currentData = ageBasedData[locale].find(item => item.age_group === activeTab);

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 w-full">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-4xl text-rose-600  flex-1 font-bold">
              {t('title')}
            </h1>
          </div>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Age Group Navigation */}
        <div className="w-full mb-8">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 bg-white/70 backdrop-blur-sm rounded-xl p-2 shadow-lg">
            {ageGroups.map((age) => (
              <button
                key={age}
                onClick={() => setActiveTab(age)}
                className={`py-3 px-4 text-sm md:text-base rounded-lg font-medium transition-all duration-300 ${
                  activeTab === age
                    ? 'bg-gradient-to-r from-pink-500 to-rose-300 text-white shadow-md'
                    : 'text-red-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Content for current age group */}
        {currentData && (
          <div className="space-y-8">
            {/* Hero Section */}
            <HeroSection
              title={currentData.title}
              subtitle={currentData.subtitle}
              heroImage={currentData.heroImage}
            />

            {/* Intro Section */}
            <IntroSection content={currentData.intro} />

            {/* Concerns Section */}
            <ConcernsSection
              title={currentData.concerns_title}
              concerns={currentData.concerns}
            />

            {/* Treatments Section */}
            <TreatmentsSection
              title={currentData.treatments_title}
              treatments={currentData.treatments}
            />

            {/* Skin Types Section */}
            <SkinTypesSection
              title={currentData.skin_types_title}
              skinTypes={currentData.skin_types}
            />

            {/* Special Tips Section */}
            <SpecialTipsSection
              title={currentData.special_tips_title}
              specialTips={currentData.special_tips}
            />
          </div>
        )}

        <div className="mt-16 py-8 border-t border-gray-200 mb-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-center md:text-left flex-1">
              {t('disclaimer')}
            </p>
            <button
              onClick={() => navigate('/hospital')}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              {t('requestConsultation')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
