import React from 'react';
import { RecommendedItem } from '@/app/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import TreatmentCard from './TreatmentCard';

export interface TierSectionProps {
  tier: 1 | 2 | 3 | 4;
  treatments: RecommendedItem[];
}

const TierSection: React.FC<TierSectionProps> = ({ tier, treatments }) => {
  if (treatments.length === 0) return null;

  const getTierTitle = (tier: 1 | 2 | 3 | 4) => {
    switch (tier) {
      case 1:
        return 'Dermatology Treatments';
      case 2:
        return 'Anti-Aging Treatments';
      case 3:
        return 'Facial Contouring Treatments';
      case 4:
        return 'Other Treatments';
      default:
        return 'Treatments';
    }
  };

  const getTierDescription = (tier: 1 | 2 | 3 | 4) => {
    switch (tier) {
      case 1:
        return 'Foundation treatments for skin health and texture';
      case 2:
        return 'Advanced treatments for aging concerns';
      case 3:
        return 'Specialized treatments for facial shaping';
      case 4:
        return 'Additional complementary treatments';
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
