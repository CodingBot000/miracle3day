'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, DollarSign, Wallet, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { questions } from '@/app/[locale]/(consult)/recommend_estimate/estimate/form-definition_questions';
import { FitText } from '@/components/ui/FitText';
import { formatKRW, formatUSD } from '@/utils/exchangeRate/converter-client';
import { useTranslations } from 'next-intl';

export interface RecommendationHeaderProps {
  totalPriceKRW: number;
  totalPriceUSD: number;
  treatmentCount: number;
  notes: string[];
  ethnicityNote?: string;
  budgetRangeId?: string;
  budgetUpperLimit?: number;
}

const RecommendationHeader: React.FC<RecommendationHeaderProps> = ({
  totalPriceKRW,
  totalPriceUSD,
  treatmentCount,
  notes,
  ethnicityNote,
  budgetRangeId,
  budgetUpperLimit,
}) => {
  const t = useTranslations('recommend_treatment.Header');

  const getBudgetLabel = (budgetId?: string) => {
    if (!budgetId) return null;
    const budgetRange = questions.budgetRanges.find(range => range.id === budgetId);
    return budgetRange?.label.en || budgetId;
  };

  const budgetLabel = getBudgetLabel(budgetRangeId);
  const isWithinBudget = budgetUpperLimit ? totalPriceKRW <= budgetUpperLimit : true;

  return (
    <div className="space-y-6">
      {/* Hero Title */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Budget Status Banner */}
      {budgetLabel && (
        <Card className={`p-4 sm:p-5 border-0 shadow-lg rounded-2xl ${
          isWithinBudget
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50'
            : 'bg-gradient-to-r from-amber-50 to-orange-50'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isWithinBudget ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t('yourBudget')}</p>
                <p className={`font-semibold ${isWithinBudget ? 'text-emerald-900' : 'text-amber-900'}`}>
                  {budgetLabel}
                  {budgetUpperLimit && (
                    <span className="ml-2 text-sm opacity-70">
                      ({formatKRW(budgetUpperLimit)})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              isWithinBudget
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-500 text-white'
            }`}>
              {isWithinBudget ? (
                <>
                  <TrendingUp className="w-4 h-4" />
                  {t('withinBudget')}
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  {t('overBudget')}
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Treatment count */}
        <Card className="group p-5 sm:p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t('treatments')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {treatmentCount}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">{t('recommended')}</p>
            </div>
          </div>
        </Card>

        {/* Total price KRW */}
        <Card className="group p-5 sm:p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/25">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t('investmentKRW')}</p>
              <FitText className="font-bold text-gray-900 mt-1" minFontSize={14} maxFontSize={24}>
                {formatKRW(totalPriceKRW)}
              </FitText>
              <p className="text-sm text-gray-500 mt-0.5">{t('totalCost')}</p>
            </div>
          </div>
        </Card>

        {/* Total price USD */}
        <Card className="group p-5 sm:p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl shadow-lg shadow-rose-500/25">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t('investmentUSD')}</p>
              <FitText className="font-bold text-gray-900 mt-1" minFontSize={14} maxFontSize={24}>
                {formatUSD(totalPriceUSD)}
              </FitText>
              <p className="text-sm text-gray-500 mt-0.5">{t('approxValue')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Ethnicity-specific note */}
      {ethnicityNote && (
        <Card className="p-5 bg-gradient-to-r from-sky-50 to-blue-50 border-0 shadow-lg rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg shadow-sky-500/25 flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-1">{t('personalizedSkinType')}</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {ethnicityNote}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Important notes */}
      {notes.length > 0 && (
        <Card className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border-0 shadow-lg rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25 flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-2">{t('importantNotes')}</p>
              <ul className="space-y-2">
                {notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{note}</span>
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
