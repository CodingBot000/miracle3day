'use client';

import { Package } from 'lucide-react';

const text = {
  ko: {
    selected: '선택된 제품: {count}개',
    save: '저장하기',
    noSelection: '제품을 선택해주세요',
  },
  en: {
    selected: 'Selected: {count} products',
    save: 'Save to Box',
    noSelection: 'Select products to save',
  },
};

interface BottomSaveBarProps {
  selectedCount: number;
  onSave: () => void;
  locale: string;
}

export default function BottomSaveBar({ selectedCount, onSave, locale }: BottomSaveBarProps) {
  const t = text[locale as keyof typeof text] || text.en;
  const hasSelection = selectedCount > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
      <div className="flex items-center gap-4">
        {/* 선택 개수 */}
        <div className="flex-1">
          <p className={`text-sm font-medium ${hasSelection ? 'text-gray-900' : 'text-gray-400'}`}>
            {hasSelection
              ? t.selected.replace('{count}', selectedCount.toString())
              : t.noSelection}
          </p>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={onSave}
          disabled={!hasSelection}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
            hasSelection
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Package className="w-5 h-5" />
          {t.save}
        </button>
      </div>
    </div>
  );
}
