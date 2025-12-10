'use client';

import React from 'react';
import { AlertCircle, Sun, Check } from 'lucide-react';
import { ClimateWarning } from '../../questionnaire/questionScript/matching/types';
import { useTranslations } from 'next-intl';

interface ClimateWarningBannerProps {
  warning: ClimateWarning;
  lang?: 'ko' | 'en';
  className?: string;
}

const severityStyles = {
  low: 'bg-green-50 border-green-200 text-green-900',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  high: 'bg-orange-50 border-orange-200 text-orange-900',
  critical: 'bg-red-50 border-red-200 text-red-900'
};

const severityIcons = {
  low: Check,
  medium: Sun,
  high: AlertCircle,
  critical: AlertCircle
};

export default function ClimateWarningBanner({
  warning,
  lang = 'en',
  className = ''
}: ClimateWarningBannerProps) {
  const t = useTranslations('ClimateWarning');

  if (!warning.show) return null;

  const Icon = severityIcons[warning.severity];

  return (
    <div
      className={`
        rounded-lg border-2 p-4 mb-4
        ${severityStyles[warning.severity]}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <h4 className="font-semibold text-sm">
          {warning.title[lang]}
        </h4>
      </div>

      {/* Message */}
      <p className="mb-3 text-xs leading-relaxed">
        {warning.message[lang]}
      </p>

      {/* UV Risk Level Bar */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium">
            {t('uvRiskLevel')}
          </span>
          <span className="text-xs font-bold">
            {warning.uvRiskLevel}/5
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              warning.uvRiskLevel >= 4 ? 'bg-red-500' :
              warning.uvRiskLevel >= 3 ? 'bg-orange-500' :
              'bg-green-500'
            }`}
            style={{ width: `${warning.uvRiskLevel * 20}%` }}
          />
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-white/60 rounded-md p-3 text-xs">
        <div className="flex items-start gap-2">
          <span className="text-base flex-shrink-0">💡</span>
          <div>
            <strong className="block mb-1">
              {t('recommendation')}
            </strong>
            <p className="leading-relaxed opacity-90">
              {warning.recommendation[lang]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
