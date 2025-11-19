import React from 'react';
import { RecommendedItem } from '@/app/(site)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import TierSection from './TierSection';
import PriceBreakdown from './PriceBreakdown';

export interface CardViewProps {
  recommendations: RecommendedItem[];
  totalPriceKRW: number;
  totalPriceUSD: number;
}

const CardView: React.FC<CardViewProps> = ({
  recommendations,
  totalPriceKRW,
  totalPriceUSD,
}) => {
  // Group treatments by tier
  const groupedByTier = recommendations.reduce((acc, treatment) => {
    // Try to infer tier from treatment metadata or default to 4 (Other)
    const tier = (treatment as any).tier || 4;
    if (!acc[tier]) {
      acc[tier] = [];
    }
    acc[tier].push(treatment);
    return acc;
  }, {} as Record<number, RecommendedItem[]>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content area - 2 columns on large screens */}
      <div className="lg:col-span-2 space-y-8">
        {/* Render each tier section */}
        {[1, 2, 3, 4].map((tier) => {
          const treatments = groupedByTier[tier];
          if (!treatments || treatments.length === 0) return null;

          return (
            <TierSection
              key={tier}
              tier={tier as 1 | 2 | 3 | 4}
              treatments={treatments}
            />
          );
        })}
      </div>

      {/* Sidebar - 1 column on large screens */}
      <div className="lg:col-span-1">
        <PriceBreakdown
          totalPriceKRW={totalPriceKRW}
          totalPriceUSD={totalPriceUSD}
        />
      </div>
    </div>
  );
};

export default CardView;
