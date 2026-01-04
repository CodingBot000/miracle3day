'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ProductStatus, SECTION_CONFIG } from '../types';

interface BeautyBoxSectionProps {
  status: ProductStatus;
  count: number;
  urgentCount?: number;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  locale?: string;
  children: React.ReactNode;
}

export default function BeautyBoxSection({
  status,
  count,
  urgentCount = 0,
  defaultExpanded,
  expanded: controlledExpanded,
  onToggle,
  locale = 'ko',
  children,
}: BeautyBoxSectionProps) {
  const config = SECTION_CONFIG[status];
  const [internalExpanded, setInternalExpanded] = useState(
    defaultExpanded ?? config.defaultExpanded
  );

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    const newState = !isExpanded;
    if (onToggle) {
      onToggle(newState);
    } else {
      setInternalExpanded(newState);
    }
  };

  const label = locale === 'ko' ? config.labelKo : config.labelEn;

  return (
    <div className="mb-1">
      {/* 섹션 헤더 */}
      <button
        onClick={handleToggle}
        className={`w-full px-4 py-2.5 flex items-center justify-between ${config.bgColor} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className={`font-semibold text-sm ${config.headerColor}`}>
            {label}
          </span>
          <span className="text-gray-500 text-sm">({count})</span>
        </div>

        {/* 임박 제품 배지 (in_use 또는 owned에서만) */}
        {urgentCount > 0 && (status === 'in_use' || status === 'owned') && (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
            <span className="text-red-500">●</span>
            {urgentCount}{locale === 'ko' ? '개 임박' : ' urgent'}
          </span>
        )}
      </button>

      {/* 섹션 콘텐츠 */}
      {isExpanded && count > 0 && (
        <div className="bg-white divide-y divide-gray-100">
          {children}
        </div>
      )}

      {/* 빈 상태 */}
      {isExpanded && count === 0 && (
        <div className="bg-white px-4 py-8 text-center">
          <p className="text-gray-400 text-sm">
            {locale === 'ko' ? '제품이 없습니다' : 'No products'}
          </p>
        </div>
      )}
    </div>
  );
}
