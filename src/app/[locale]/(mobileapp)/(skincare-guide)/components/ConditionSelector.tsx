'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCondition,
  AGE_OPTIONS,
  SKIN_TYPE_OPTIONS,
  CONCERN_OPTIONS,
  AGE_LABELS,
  SKIN_TYPE_LABELS,
  CONCERN_LABELS,
} from '../lib/types';

interface ConditionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentCondition: UserCondition;
  onConfirm: (condition: UserCondition) => void;
  locale: string;
}

export default function ConditionSelector({
  isOpen,
  onClose,
  currentCondition,
  onConfirm,
  locale,
}: ConditionSelectorProps) {
  const [ageGroup, setAgeGroup] = useState(currentCondition.ageGroup);
  const [skinType, setSkinType] = useState(currentCondition.skinType);
  const [concerns, setConcerns] = useState<string[]>(currentCondition.concerns);

  const lang = locale === 'ko' ? 'ko' : 'en';

  const toggleConcern = (concern: string) => {
    setConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((c) => c !== concern)
        : [...prev, concern]
    );
  };

  const handleConfirm = () => {
    onConfirm({ ageGroup, skinType, concerns });
    onClose();
  };

  const texts = {
    ko: {
      title: '조건 변경하기',
      ageGroup: '연령대',
      skinType: '피부타입',
      concerns: '주요 고민 (복수 선택)',
      confirm: '이 조건으로 분석',
    },
    en: {
      title: 'Change Conditions',
      ageGroup: 'Age Group',
      skinType: 'Skin Type',
      concerns: 'Concerns (Multiple)',
      confirm: 'Analyze with this',
    },
  };

  const t = texts[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[101] max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{t.title}</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {/* Age Group */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.ageGroup}
                </label>
                <div className="flex flex-wrap gap-2">
                  {AGE_OPTIONS.map((age) => (
                    <button
                      key={age}
                      onClick={() => setAgeGroup(age)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        ageGroup === age
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {AGE_LABELS[age]?.[lang] || age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.skinType}
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKIN_TYPE_OPTIONS.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSkinType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        skinType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {SKIN_TYPE_LABELS[type]?.[lang] || type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concerns */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.concerns}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONCERN_OPTIONS.map((concern) => (
                    <button
                      key={concern}
                      onClick={() => toggleConcern(concern)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        concerns.includes(concern)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {CONCERN_LABELS[concern]?.[lang] || concern}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-white">
              <button
                onClick={handleConfirm}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] transition-all"
              >
                {t.confirm}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
