import { Clock, DollarSign, Calendar, Timer, Coins } from 'lucide-react';
import Image from "next/image";

import { Treatment } from '@/constants/treatment/antiaging-agebased';
import { useLocale, useTranslations } from 'next-intl';
import { krwToUsdSync } from '@/utils/exchangeRate/converter-client';


interface TreatmentsSectionProps {
  title: string;
  treatments: Treatment[];
}

export function TreatmentsSection({ title, treatments }: TreatmentsSectionProps) {
  const locale = useLocale() as 'ko' | 'en';
  const tLabels = useTranslations('TreatmentAgedGuide.labels');
  const tUnits = useTranslations('TreatmentAgedGuide.priceUnits');

  const formatTreatmentCost = (treatment: Treatment): string | null => {
    const { costFrom, costTo, priceUnit } = treatment;
    if (costFrom == null) return null;

    const isKorean = locale === 'ko';
    const unitKey = priceUnit || 'per_session';
    const unitLabel = tUnits(unitKey);

    if (isKorean) {
      const fromStr = costFrom.toLocaleString('ko-KR');
      const toStr =
        typeof costTo === 'number'
          ? costTo.toLocaleString('ko-KR')
          : null;

      if (toStr) {
        return `₩ ${fromStr}–${toStr} ${unitLabel}`;
      }

      return `₩ ${fromStr} ${unitLabel}`;
    }

    // USD conversion for non-Korean languages
    const fromUsd = krwToUsdSync(costFrom);
    const toUsd = typeof costTo === 'number' ? krwToUsdSync(costTo) : null;

    const fromStr = fromUsd.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });

    if (toUsd != null) {
      const toStr = toUsd.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      });
      return `${fromStr}–${toStr} ${unitLabel}`;
    }

    return `${fromStr} ${unitLabel}`;
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-sm border border-white/30">
      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        {title}
      </h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {treatments.map((treatment) => {
          const formattedCost = formatTreatmentCost(treatment);

          return (
            <div key={treatment.id} className="bg-white/70 rounded-xl overflow-hidden border-2 border-black shadow-sm hover:shadow-md transition-shadow">
              { /* 적절한 이미지 확보가 안되서  임시 주석.삭제하지말것. */ }
              {/* {treatment.imageUrl && (
                <div className="relative h-48 w-full">
                  <Image
                    src={treatment.imageUrl}
                    alt={treatment.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )} */}
              <div className="p-6">
                <h4 className="font-bold text-lg text-gray-800 mb-3">
                  {treatment.name}
                </h4>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  {treatment.effect}
                </p>

                <div className="space-y-2">
                {treatment.cycle && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="font-medium w-20 flex-shrink-0">{tLabels('cycle')}:</span>
                    <span className="flex-1">{treatment.cycle}</span>
                  </div>
                )}

                {treatment.interval && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="font-medium w-20 flex-shrink-0">{tLabels('interval')}:</span>
                    <span className="flex-1">{treatment.interval}</span>
                  </div>
                )}

                {treatment.duration && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="font-medium w-20 flex-shrink-0">{tLabels('duration')}:</span>
                    <span className="flex-1">{treatment.duration}</span>
                  </div>
                )}

                {treatment.time && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Timer className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="font-medium w-20 flex-shrink-0">{tLabels('time')}:</span>
                    <span className="flex-1">{treatment.time}</span>
                  </div>
                )}

                {formattedCost && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Coins className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="font-medium w-20 flex-shrink-0">{tLabels('cost')}:</span>
                    <span className="flex-1">{formattedCost}</span>
                  </div>
                )}

                {treatment.onset && (
                  <div className="flex items-start gap-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    <span className="font-medium w-20 flex-shrink-0">{tLabels('onset')}:</span>
                    <span className="flex-1">{treatment.onset}</span>
                  </div>
                )}

                {treatment.downtime && (
                  <div className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    <span className="font-medium w-20 flex-shrink-0">{tLabels('downtime')}:</span>
                    <span className="flex-1">{treatment.downtime}</span>
                  </div>
                )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
