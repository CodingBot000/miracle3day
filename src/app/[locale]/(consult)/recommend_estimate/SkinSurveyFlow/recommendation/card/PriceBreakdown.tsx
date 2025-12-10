'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface PriceBreakdownProps {
  totalPriceKRW: number;
  totalPriceUSD: number;
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ totalPriceKRW, totalPriceUSD }) => {
  const t = useTranslations('PriceBreakdown');

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

  return (
    <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 sticky top-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-rose-600" />
          <h3 className="text-lg font-semibold text-rose-900">{t('title')}</h3>
        </div>

        {/* Divider */}
        <div className="border-t border-rose-200" />

        {/* Price details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">{t('krw')}</span>
            <span className="text-xl font-bold text-rose-900">
              {formatKRW(totalPriceKRW)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">{t('usd')}</span>
            <span className="text-xl font-bold text-rose-900">
              {formatUSD(totalPriceUSD)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-rose-200" />

        {/* Note */}
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-600">
            <span className="font-medium">{t('note')}</span> {t('noteText')}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PriceBreakdown;
