'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, Sparkles, Calendar, Lightbulb, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface TimelineInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TimelineInfoModal: React.FC<TimelineInfoModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations('TimelineInfo');

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t('title')}</h2>
                  <p className="text-white text-sm mt-1">
                    {t('subtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Introduction */}
                <p className="text-gray-600 leading-relaxed">
                  {t('intro')}
                </p>

                {/* Why Order Matters */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{t('whyOrderMatters')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{t('skinRecoveryTitle')}</p>
                        <p className="text-sm text-gray-600">{t('skinRecoveryDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{t('maximizeResultsTitle')}</p>
                        <p className="text-sm text-gray-600">{t('maximizeResultsDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{t('minimizeSideEffectsTitle')}</p>
                        <p className="text-sm text-gray-600">{t('minimizeSideEffectsDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Treatment Categories */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{t('treatmentCategories')}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Dermatology */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-blue-900">{t('dermatology')}</p>
                        <p className="text-xs text-blue-700 mt-1">
                          {t('dermatologyTreatments')}
                        </p>
                        <p className="text-xs text-blue-600 mt-0.5">
                          {t('dermatologyDesc')}
                        </p>
                      </div>
                    </div>

                    {/* Anti-Aging */}
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-green-900">{t('antiAging')}</p>
                        <p className="text-xs text-green-700 mt-1">
                          {t('antiAgingTreatments')}
                        </p>
                        <p className="text-xs text-green-600 mt-0.5">
                          {t('antiAgingDesc')}
                        </p>
                      </div>
                    </div>

                    {/* Facial Contouring */}
                    <div className="flex items-start gap-3 p-4 bg-pink-50 rounded-xl">
                      <div className="w-4 h-4 rounded-full bg-pink-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-pink-900">{t('facialContouring')}</p>
                        <p className="text-xs text-pink-700 mt-1">
                          {t('facialContouringTreatments')}
                        </p>
                        <p className="text-xs text-pink-600 mt-0.5">
                          {t('facialContouringDesc')}
                        </p>
                      </div>
                    </div>

                    {/* Specialty Care */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-4 h-4 rounded-full bg-gray-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">{t('specialtyCare')}</p>
                        <p className="text-xs text-gray-700 mt-1">
                          {t('specialtyCareTreatments')}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {t('specialtyCareDesc')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to Read */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{t('howToReadTitle')}</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{t('howToRead1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{t('howToRead2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{t('howToRead3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{t('howToRead4')}</span>
                    </li>
                  </ul>
                </div>

                {/* Important Notes */}
                <div className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-sky-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{t('importantNotes')}</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span>{t('note1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span>{t('note2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span>{t('note3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span>{t('note4')}</span>
                    </li>
                  </ul>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-rose-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{t('needAdvice')}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('adviceDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
              >
                {t('gotIt')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TimelineInfoModal;
