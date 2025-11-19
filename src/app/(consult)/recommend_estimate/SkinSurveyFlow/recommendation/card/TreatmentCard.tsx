import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecommendedItem } from '@/app/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import { Zap, Clock, Heart, Sparkles } from 'lucide-react';

export interface TreatmentCardProps {
  treatment: RecommendedItem & { importance?: 1 | 2 | 3 };
  tier?: 1 | 2 | 3;
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({ treatment, tier }) => {
  // Default importance to 2 (Recommended) if not provided
  const importance = treatment.importance || 2;
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

  const getTierColors = (tier?: 1 | 2 | 3) => {
    switch (tier) {
      case 1:
        return {
          gradient: 'from-blue-50 to-blue-100',
          border: 'border-blue-200',
          badge: 'bg-blue-500',
          text: 'text-blue-900',
          icon: 'text-blue-600',
        };
      case 2:
        return {
          gradient: 'from-purple-50 to-purple-100',
          border: 'border-purple-200',
          badge: 'bg-purple-500',
          text: 'text-purple-900',
          icon: 'text-purple-600',
        };
      case 3:
        return {
          gradient: 'from-pink-50 to-pink-100',
          border: 'border-pink-200',
          badge: 'bg-pink-500',
          text: 'text-pink-900',
          icon: 'text-pink-600',
        };
      default:
        return {
          gradient: 'from-gray-50 to-gray-100',
          border: 'border-gray-200',
          badge: 'bg-gray-500',
          text: 'text-gray-900',
          icon: 'text-gray-600',
        };
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

  const getImportanceIcon = (importance: 1 | 2 | 3) => {
    switch (importance) {
      case 1:
        return <Zap className="w-4 h-4" />;
      case 2:
        return <Heart className="w-4 h-4" />;
      case 3:
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getImportanceLabel = (importance: 1 | 2 | 3) => {
    switch (importance) {
      case 1:
        return 'Essential';
      case 2:
        return 'Recommended';
      case 3:
        return 'Optional';
      default:
        return 'Standard';
    }
  };

  const colors = getTierColors(tier);

  return (
    <Card className={`p-6 bg-gradient-to-br ${colors.gradient} ${colors.border} hover:shadow-lg transition-shadow`}>
      <div className="space-y-4">
        {/* Header with tier and importance */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`text-xl font-semibold ${colors.text} mb-1`}>
              {treatment.label}
            </h3>
            {tier && (
              <Badge className={`${colors.badge} text-white text-xs`}>
                {getTierLabel(tier)}
              </Badge>
            )}
          </div>
          <div className={`flex items-center space-x-1 ${colors.icon}`}>
            {getImportanceIcon(importance)}
            <span className="text-xs font-medium">{getImportanceLabel(importance)}</span>
          </div>
        </div>

        {/* Why this treatment */}
        <div className="space-y-2">
          {treatment.rationale && treatment.rationale.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">Why recommended:</span>
              <ul className="mt-1 space-y-1">
                {treatment.rationale.map((reason, idx) => (
                  <li key={idx} className="text-sm text-gray-600 ml-2">
                    • {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Price information */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className={`text-lg font-semibold ${colors.text}`}>
                {formatKRW(treatment.priceKRW)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">USD</p>
              <p className={`text-lg font-semibold ${colors.text}`}>
                {formatUSD(treatment.priceUSD)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TreatmentCard;
