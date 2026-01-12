'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface StepOption {
  type: string;
  name_ko: string;
  name_en: string;
  icon: string;
}

const AVAILABLE_STEPS: StepOption[] = [
  { type: 'cleanser', name_ko: '클렌저', name_en: 'Cleanser', icon: '🧴' },
  { type: 'toner', name_ko: '토너', name_en: 'Toner', icon: '💧' },
  { type: 'essence', name_ko: '에센스', name_en: 'Essence', icon: '✨' },
  { type: 'serum', name_ko: '세럼', name_en: 'Serum', icon: '💎' },
  { type: 'eye_cream', name_ko: '아이크림', name_en: 'Eye Cream', icon: '👁️' },
  { type: 'moisturizer', name_ko: '모이스처라이저', name_en: 'Moisturizer', icon: '🧴' },
  { type: 'facial_oil', name_ko: '페이스 오일', name_en: 'Face Oil', icon: '🫒' },
  { type: 'sunscreen', name_ko: '선케어', name_en: 'Sunscreen', icon: '☀️' },
  { type: 'mask', name_ko: '마스크', name_en: 'Mask', icon: '🎭' },
  { type: 'exfoliant', name_ko: '각질제거', name_en: 'Exfoliant', icon: '🧽' },
  { type: 'mist', name_ko: '미스트', name_en: 'Mist', icon: '💨' },
  { type: 'treatment', name_ko: '트리트먼트', name_en: 'Treatment', icon: '💊' },
  { type: 'sleeping_mask', name_ko: '슬리핑 마스크', name_en: 'Sleeping Mask', icon: '😴' },
  { type: 'lip_care', name_ko: '립케어', name_en: 'Lip Care', icon: '💋' },
];

interface AddStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (stepType: string) => void;
  locale?: string;
}

export default function AddStepModal({
  isOpen,
  onClose,
  onAdd,
  locale = 'ko'
}: AddStepModalProps) {
  const isKo = locale === 'ko';

  const handleAdd = (stepType: string) => {
    onAdd(stepType);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* 모달 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[70vh] overflow-hidden"
          >
            {/* 핸들 */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* 헤더 */}
            <div className="flex justify-between items-center px-5 pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {isKo ? '스텝 추가' : 'Add Step'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 스텝 목록 */}
            <div className="overflow-y-auto max-h-[calc(70vh-80px)] pb-safe">
              <div className="px-5 pb-6 grid grid-cols-2 gap-3">
                {AVAILABLE_STEPS.map((step) => (
                  <button
                    key={step.type}
                    onClick={() => handleAdd(step.type)}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-left"
                  >
                    <span className="text-2xl">{step.icon}</span>
                    <span className="font-medium text-gray-900">
                      {isKo ? step.name_ko : step.name_en}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
