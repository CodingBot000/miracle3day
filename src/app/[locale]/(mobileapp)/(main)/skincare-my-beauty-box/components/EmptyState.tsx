'use client';

import { Package, Plus } from 'lucide-react';

const text = {
  ko: {
    title: '아직 저장한 제품이 없어요',
    description: '마음에 드는 스킨케어 제품을 찾아\nMy Beauty Box에 담아보세요!',
    button: '제품 둘러보기',
  },
  en: {
    title: 'No products saved yet',
    description: 'Find your favorite skincare products\nand add them to My Beauty Box!',
    button: 'Browse Products',
  },
};

interface EmptyStateProps {
  locale: string;
  onAddClick: () => void;
}

export default function EmptyState({ locale, onAddClick }: EmptyStateProps) {
  const t = text[locale as keyof typeof text] || text.en;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
        <Package className="w-10 h-10 text-pink-300" />
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">
        {t.title}
      </h2>
      <p className="text-gray-500 text-center whitespace-pre-line mb-8">
        {t.description}
      </p>

      <button
        onClick={onAddClick}
        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
      >
        <Plus className="w-5 h-5" />
        {t.button}
      </button>
    </div>
  );
}
