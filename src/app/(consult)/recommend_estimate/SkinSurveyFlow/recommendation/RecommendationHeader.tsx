import React from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, DollarSign, Calendar, Wallet } from 'lucide-react';

export interface RecommendationHeaderProps {
  totalPriceKRW: number;
  totalPriceUSD: number;
  treatmentCount: number;
  notes: string[];
  budgetRangeId?: string;
  budgetUpperLimit?: number;
}

const RecommendationHeader: React.FC<RecommendationHeaderProps> = ({
  totalPriceKRW,
  totalPriceUSD,
  treatmentCount,
  notes,
  budgetRangeId,
  budgetUpperLimit,
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

  // 예산 ID를 사용자 친화적인 텍스트로 변환
  const getBudgetLabel = (budgetId?: string, upperLimit?: number) => {
    if (!budgetId) return null;

    const budgetLabels: Record<string, string> = {
      "under-500": "Under $500",
      "500-1500": "$500 - $1,500",
      "1500-3000": "$1,500 - $3,000",
      "3000-5000": "$3,000 - $5,000",
      "under-1000": "Under $1,000",
      "1000-5000": "$1,000 - $5,000",
      "5000-10000": "$5,000 - $10,000",
      "10000-plus": "Over $10,000",
      "flexible": "Flexible Budget",
      "no_limit": "No Limit",
      "unsure": "Unsure",
    };

    return budgetLabels[budgetId] || budgetId;
  };

  const budgetLabel = getBudgetLabel(budgetRangeId, budgetUpperLimit);
  const isWithinBudget = budgetUpperLimit ? totalPriceKRW <= budgetUpperLimit : true;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-light text-gray-900 mb-2">
          Your Personalized Treatment Plan
        </h1>
        <p className="text-gray-600">
          Based on your consultation, we&apos;ve curated the perfect combination of treatments
        </p>
      </div>

      {/* Budget info banner (if available) */}
      {budgetLabel && (
        <Card className={`p-4 ${isWithinBudget ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className={`w-5 h-5 ${isWithinBudget ? 'text-green-600' : 'text-orange-600'}`} />
              <div>
                <p className={`text-sm font-medium ${isWithinBudget ? 'text-green-900' : 'text-orange-900'}`}>
                  Your Budget: {budgetLabel}
                  {budgetUpperLimit && (
                    <span className="ml-2 text-xs opacity-75">
                      ({formatKRW(budgetUpperLimit)})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className={`text-sm font-semibold ${isWithinBudget ? 'text-green-700' : 'text-orange-700'}`}>
              {isWithinBudget ? '✓ Within Budget' : '⚠ Over Budget'}
            </div>
          </div>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Treatment count */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Recommended Treatments</p>
              <p className="text-2xl font-semibold text-blue-900 mt-1">
                {treatmentCount} {treatmentCount === 1 ? 'Treatment' : 'Treatments'}
              </p>
            </div>
          </div>
        </Card>

        {/* Total price KRW */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Investment (KRW)</p>
              <p className="text-2xl font-semibold text-purple-900 mt-1">
                {formatKRW(totalPriceKRW)}
              </p>
            </div>
          </div>
        </Card>

        {/* Total price USD */}
        <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-pink-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-pink-600 font-medium">Total Investment (USD)</p>
              <p className="text-2xl font-semibold text-pink-900 mt-1">
                {formatUSD(totalPriceUSD)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Important notes */}
      {notes.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 mb-2">Important Notes:</p>
              <ul className="space-y-1">
                {notes.map((note, index) => (
                  <li key={index} className="text-sm text-amber-800">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RecommendationHeader;
