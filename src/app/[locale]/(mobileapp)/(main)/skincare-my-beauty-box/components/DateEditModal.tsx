'use client';

import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { BeautyBoxProduct, ProductStatus } from '../types';
import { getTodayString } from '../utils/beautybox-helpers';

interface DateEditModalProps {
  product: BeautyBoxProduct;
  locale?: string;
  onSave: (dates: DateUpdates) => void;
  onClose: () => void;
}

export interface DateUpdates {
  opened_at?: string | null;
  expiry_date?: string | null;
  use_by_date?: string | null;
  finished_at?: string | null;
}

const text = {
  ko: {
    title: '날짜 편집',
    openedAt: '개봉일',
    expiryDate: '유통기한',
    useByDate: '2차 유통기한 (선택)',
    finishedAt: '사용완료일',
    useByHint: '개봉 후 사용 기한을 설정하면 이 날짜로 D-day가 계산됩니다',
    cancel: '취소',
    save: '저장',
    today: '오늘',
    clear: '삭제',
  },
  en: {
    title: 'Edit Dates',
    openedAt: 'Opened',
    expiryDate: 'Expiry Date',
    useByDate: 'Use By Date (optional)',
    finishedAt: 'Finished',
    useByHint: 'If set, D-day will be calculated based on this date',
    cancel: 'Cancel',
    save: 'Save',
    today: 'Today',
    clear: 'Clear',
  },
};

// 상태별 표시할 날짜 필드
const fieldsForStatus: Record<ProductStatus, (keyof DateUpdates)[]> = {
  wishlist: [],
  owned: ['expiry_date'],
  in_use: ['opened_at', 'expiry_date', 'use_by_date'],
  used: ['opened_at', 'finished_at'],
};

export default function DateEditModal({
  product,
  locale = 'ko',
  onSave,
  onClose,
}: DateEditModalProps) {
  const t = text[locale as keyof typeof text] || text.en;
  const fields = fieldsForStatus[product.status] || [];

  const [dates, setDates] = useState<DateUpdates>({
    opened_at: product.opened_at || null,
    expiry_date: product.expiry_date || null,
    use_by_date: product.use_by_date || null,
    finished_at: product.finished_at || null,
  });

  // 포커스 시 기본값 설정
  const handleFocus = (field: keyof DateUpdates) => {
    if (!dates[field]) {
      setDates((prev) => ({
        ...prev,
        [field]: getTodayString(),
      }));
    }
  };

  const handleChange = (field: keyof DateUpdates, value: string) => {
    setDates((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleClear = (field: keyof DateUpdates) => {
    setDates((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  const handleSetToday = (field: keyof DateUpdates) => {
    setDates((prev) => ({
      ...prev,
      [field]: getTodayString(),
    }));
  };

  const handleSave = () => {
    onSave(dates);
    onClose();
  };

  const getLabel = (field: keyof DateUpdates): string => {
    switch (field) {
      case 'opened_at':
        return t.openedAt;
      case 'expiry_date':
        return t.expiryDate;
      case 'use_by_date':
        return t.useByDate;
      case 'finished_at':
        return t.finishedAt;
      default:
        return '';
    }
  };

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl safe-area-bottom animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t.title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="px-4 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {getLabel(field)}
              </label>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dates[field] || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    onFocus={() => handleFocus(field)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => handleSetToday(field)}
                  className="px-3 py-2.5 text-sm text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors whitespace-nowrap"
                >
                  {t.today}
                </button>

                {dates[field] && (
                  <button
                    onClick={() => handleClear(field)}
                    className="px-3 py-2.5 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    {t.clear}
                  </button>
                )}
              </div>

              {/* 2차 유통기한 힌트 */}
              {field === 'use_by_date' && (
                <p className="mt-1.5 text-xs text-gray-500">{t.useByHint}</p>
              )}
            </div>
          ))}
        </div>

        {/* 푸터 */}
        <div className="flex gap-3 px-4 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 text-sm font-medium text-white bg-pink-500 rounded-xl hover:bg-pink-600 transition-colors"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
