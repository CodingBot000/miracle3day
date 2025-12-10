'use client';

import React from 'react';
import { LayoutGrid, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface ViewToggleProps {
  currentView: 'card' | 'timeline';
  onViewChange: (view: 'card' | 'timeline') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  const t = useTranslations('ViewToggle');

  return (
    <div className="flex justify-center mt-8">
      <div className="inline-flex p-1.5 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100">
        <button
          onClick={() => onViewChange('card')}
          className={`
            relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
            ${currentView === 'card'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
          `}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>{t('cardView')}</span>
        </button>
        <button
          onClick={() => onViewChange('timeline')}
          className={`
            relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
            ${currentView === 'timeline'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
          `}
        >
          <Calendar className="w-4 h-4" />
          <span>{t('timeline')}</span>
        </button>
      </div>
    </div>
  );
};

export default ViewToggle;
