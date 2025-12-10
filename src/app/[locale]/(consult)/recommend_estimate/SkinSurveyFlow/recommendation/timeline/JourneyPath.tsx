'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Target, Sparkles, ArrowDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface JourneyPathProps {
  totalSessions: number;
  estimatedDuration: string;
}

const JourneyPath: React.FC<JourneyPathProps> = ({
  totalSessions,
  estimatedDuration,
}) => {
  const t = useTranslations('recommend_treatment.JourneyPath');

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-lg rounded-2xl mb-6">
      {/* Desktop: Horizontal Layout */}
      <div className="hidden sm:flex items-center justify-between">
        {/* Start */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('journeyStarts')}</p>
            <p className="text-lg font-bold text-gray-900">{t('session1')}</p>
          </div>
        </div>

        {/* Arrow with sessions count */}
        <div className="flex items-center gap-2 flex-1 mx-6">
          <div className="flex-1 border-t-2 border-dashed border-purple-300" />
          <div className="px-4 py-2 bg-white rounded-full border border-purple-200 shadow-sm">
            <p className="text-sm font-semibold text-purple-700">
              {totalSessions} {totalSessions === 1 ? t('treatment') : t('treatments')}
            </p>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-purple-300" />
        </div>

        {/* End */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('expectedCompletion')}</p>
            <p className="text-lg font-bold text-gray-900">{estimatedDuration}</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg shadow-pink-500/25">
            <Target className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Mobile: Vertical Layout */}
      <div className="sm:hidden">
        <div className="flex flex-col items-center">
          {/* Start */}
          <div className="flex items-center gap-3 w-full bg-white/60 rounded-xl p-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">{t('journeyStartsMobile')}</p>
              <p className="text-base font-bold text-gray-900">{t('session1')}</p>
            </div>
          </div>

          {/* Vertical connector */}
          <div className="flex flex-col items-center py-3">
            <div className="w-0.5 h-4 bg-gradient-to-b from-blue-300 to-purple-300" />
            <div className="px-4 py-2 bg-white rounded-full border border-purple-200 shadow-sm my-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <p className="text-sm font-semibold text-purple-700">
                  {totalSessions} {totalSessions === 1 ? t('treatment') : t('treatments')}
                </p>
              </div>
            </div>
            <div className="w-0.5 h-4 bg-gradient-to-b from-purple-300 to-pink-300" />
            <ArrowDown className="w-4 h-4 text-pink-400" />
          </div>

          {/* End */}
          <div className="flex items-center gap-3 w-full bg-white/60 rounded-xl p-3">
            <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg shadow-pink-500/25">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">{t('expectedCompletion')}</p>
              <p className="text-base font-bold text-gray-900">{estimatedDuration}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional info */}
      <div className="mt-4 pt-4 border-t border-purple-100">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          {t('disclaimer')}
        </p>
      </div>
    </Card>
  );
};

export default JourneyPath;
