'use client';

import React from 'react';
import { RecommendedItem } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import TreatmentCard from './TreatmentCard';
import { useTranslations } from 'next-intl';

export interface TierSectionProps {
  tier: 1 | 2 | 3 | 4;
  treatments: RecommendedItem[];
}

const TierSection: React.FC<TierSectionProps> = ({ tier, treatments }) => {
  const t = useTranslations('TierSection');

  if (treatments.length === 0) return null;

  const getTierTitle = (tier: 1 | 2 | 3 | 4) => {
    switch (tier) {
      case 1:
        return t('titles.dermatology');
      case 2:
        return t('titles.antiAging');
      case 3:
        return t('titles.facialContouring');
      case 4:
        return t('titles.other');
      default:
        return t('titles.treatments');
    }
  };

  const getTierDescription = (tier: 1 | 2 | 3 | 4) => {
    switch (tier) {
      case 1:
        return t('descriptions.dermatology');
      case 2:
        return t('descriptions.antiAging');
      case 3:
        return t('descriptions.facialContouring');
      case 4:
        return t('descriptions.other');
      default:
        return '';
    }
  };

  const getTierColor = (tier: 1 | 2 | 3 | 4) => {
    switch (tier) {
      case 1:
        return 'text-blue-600';
      case 2:
        return 'text-purple-600';
      case 3:
        return 'text-pink-600';
      case 4:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Tier header */}
      <div className="border-b border-gray-200 pb-3">
        <h2 className={`text-2xl font-semibold ${getTierColor(tier)}`}>
          {getTierTitle(tier)}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {getTierDescription(tier)}
        </p>
      </div>

      {/* Treatment cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {treatments.map((treatment, index) => (
          <TreatmentCard
            key={`${treatment.key}-${index}`}
            treatment={treatment}
            tier={tier === 4 ? undefined : (tier as 1 | 2 | 3)}
          />
        ))}
      </div>
    </div>
  );
};

export default TierSection;
