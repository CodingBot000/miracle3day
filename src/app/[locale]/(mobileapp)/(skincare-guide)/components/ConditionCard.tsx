'use client';

import { UserCondition, AGE_LABELS, SKIN_TYPE_LABELS, CONCERN_LABELS } from '../lib/types';

interface ConditionCardProps {
  condition: UserCondition;
  locale: string;
}

export default function ConditionCard({ condition, locale }: ConditionCardProps) {
  const lang = locale === 'ko' ? 'ko' : 'en';

  const getAgeLabel = (age: string) => AGE_LABELS[age]?.[lang] || age;
  const getSkinTypeLabel = (type: string) => SKIN_TYPE_LABELS[type]?.[lang] || type;
  const getConcernLabel = (concern: string) => CONCERN_LABELS[concern]?.[lang] || concern;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">👤</span>
        <h3 className="text-lg font-semibold text-gray-900">
          {locale === 'ko' ? '회원님의 현재 설정' : 'Your Current Settings'}
        </h3>
      </div>

      <div className="space-y-3">
        {/* 연령대 */}
        <div className="flex items-center justify-between py-2 border-b border-gray-50">
          <span className="text-gray-500 text-sm">
            {locale === 'ko' ? '연령대' : 'Age Group'}
          </span>
          <span className="font-medium text-gray-900">
            {getAgeLabel(condition.ageGroup)}
          </span>
        </div>

        {/* 피부타입 */}
        <div className="flex items-center justify-between py-2 border-b border-gray-50">
          <span className="text-gray-500 text-sm">
            {locale === 'ko' ? '피부타입' : 'Skin Type'}
          </span>
          <span className="font-medium text-gray-900">
            {getSkinTypeLabel(condition.skinType)}
          </span>
        </div>

        {/* 주요 고민 */}
        <div className="py-2">
          <span className="text-gray-500 text-sm block mb-2">
            {locale === 'ko' ? '주요 고민' : 'Concerns'}
          </span>
          <div className="flex flex-wrap gap-2">
            {condition.concerns.length > 0 ? (
              condition.concerns.slice(0, 5).map((concern) => (
                <span
                  key={concern}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                >
                  {getConcernLabel(concern)}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">
                {locale === 'ko' ? '설정 없음' : 'Not set'}
              </span>
            )}
            {condition.concerns.length > 5 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                +{condition.concerns.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
