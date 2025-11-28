import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecommendedItem } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import { CheckCircle2 } from 'lucide-react';

export interface TimelineItemProps {
  treatment: RecommendedItem;
  sessionNumber: number;
  isLast: boolean;
  tier?: 1 | 2 | 3;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  treatment,
  sessionNumber,
  isLast,
  tier,
}) => {
  const formatKRW = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTierColor = (tier?: 1 | 2 | 3) => {
    switch (tier) {
      case 1:
        return 'border-blue-500 bg-blue-500';
      case 2:
        return 'border-green-500 bg-green-500';
      case 3:
        return 'border-pink-500 bg-pink-500';
      default:
        return 'border-gray-500 bg-gray-500';
    }
  };

  const getTierLabel = (tier?: 1 | 2 | 3) => {
    switch (tier) {
      case 1:
        return 'Dermatology';
      case 2:
        return 'Anti-Aging';
      case 3:
        return 'Facial Contouring';
      default:
        return 'Other';
    }
  };

  return (
    <div className="relative flex items-stretch space-x-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Circle indicator */}
        <div className={`w-10 h-10 rounded-full border-4 ${getTierColor(tier)} flex items-center justify-center z-10 flex-shrink-0`}>
          <span className="text-white font-bold text-sm">{sessionNumber}</span>
        </div>

        {/* Vertical line - 카드 높이만큼 채움 */}
        <div className="flex-1 flex flex-col items-center w-1">
          <div className="w-1 flex-1 bg-gradient-to-b from-gray-300 to-gray-200" />
          {/* 마지막 아이템에 화살표 표시 */}
          {/* {isLast && (
            <div className="flex flex-col items-center mt-1">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-400" />
            </div>
          )} */}
        </div>
      </div>

      {/* Content card */}
      <div className="flex-1 pb-8">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {treatment.label}
                </h3>
                {tier && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {getTierLabel(tier)}
                  </Badge>
                )}
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>

            {/* Why recommended */}
            {treatment.rationale && treatment.rationale.length > 0 && (
              <div className="text-sm text-gray-600">
                {treatment.rationale.join(' • ')}
              </div>
            )}

            {/* Price */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Session Price</span>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                  {formatUSD(treatment.priceUSD)}
                    
                  </div>
                  <div className="text-sm text-gray-500">
                  {formatKRW(treatment.priceKRW)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TimelineItem;
