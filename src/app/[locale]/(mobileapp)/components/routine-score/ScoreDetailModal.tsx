'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  RoutineScore,
  RoutineType,
  getScoreGrade,
  getGoodPractices,
  RoutineStep
} from '@/lib/skincare/routineScoreCalculator';
import ScoreBreakdown from './ScoreBreakdown';

interface ScoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: RoutineScore;
  routineType: RoutineType;
  locale?: string;
  steps: RoutineStep[];
  onAutoReorder?: () => void;
}

export default function ScoreDetailModal({
  isOpen,
  onClose,
  score,
  routineType,
  locale = 'ko',
  steps,
  onAutoReorder
}: ScoreDetailModalProps) {
  const isKo = locale === 'ko';
  const { color, emoji, grade } = getScoreGrade(score.total);
  const goodPractices = getGoodPractices(steps, routineType);

  const gradeText: Record<string, { ko: string; en: string }> = {
    excellent: { ko: '완벽해요!', en: 'Excellent!' },
    good: { ko: '잘하고 있어요!', en: 'Good job!' },
    fair: { ko: '조금만 개선하면 완벽!', en: 'Almost there!' },
    needs_improvement: { ko: '개선이 필요해요', en: 'Needs improvement' }
  };

  const severityConfig = {
    critical: { icon: '🔴', label_ko: '중요', label_en: 'Critical' },
    warning: { icon: '🟡', label_ko: '권장', label_en: 'Warning' },
    tip: { icon: '💡', label_ko: '팁', label_en: 'Tip' }
  };

  const routineTypeText = {
    morning: { ko: '아침 루틴', en: 'Morning Routine' },
    midday: { ko: '낮 루틴', en: 'Midday Routine' },
    evening: { ko: '저녁 루틴', en: 'Evening Routine' }
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
            className="fixed bottom-0 left-0 right-0 z-50 bg-gray-50 rounded-t-3xl max-h-[85vh] overflow-hidden"
          >
            {/* 핸들 */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* 스크롤 컨테이너 */}
            <div className="overflow-y-auto max-h-[calc(85vh-60px)] pb-safe">
              <div className="px-5 pb-8">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {isKo ? '루틴 점수 분석' : 'Routine Score Analysis'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {routineTypeText[routineType][isKo ? 'ko' : 'en']}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 총점 원형 게이지 */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center mb-8"
                >
                  <div className="relative w-36 h-36">
                    {/* 배경 원 */}
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="64"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="12"
                      />
                      {/* 진행 원 */}
                      <motion.circle
                        cx="72"
                        cy="72"
                        r="64"
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 64}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 64 }}
                        animate={{
                          strokeDashoffset: 2 * Math.PI * 64 * (1 - score.total / 100)
                        }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      />
                    </svg>

                    {/* 중앙 텍스트 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-4xl font-bold"
                        style={{ color }}
                      >
                        {score.total}
                      </motion.span>
                      <span className="text-sm text-gray-500">/ 100</span>
                    </div>
                  </div>

                  {/* 등급 텍스트 */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-3 flex items-center gap-2"
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-lg font-semibold" style={{ color }}>
                      {gradeText[grade][isKo ? 'ko' : 'en']}
                    </span>
                  </motion.div>
                </motion.div>

                {/* 점수 구성 */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {isKo ? '점수 구성' : 'Score Breakdown'}
                  </h3>
                  <ScoreBreakdown
                    orderScore={score.breakdown.order_score}
                    completenessScore={score.breakdown.completeness_score}
                    ingredientScore={score.breakdown.ingredient_score}
                    locale={locale}
                  />
                </div>

                {/* 개선 필요 항목 */}
                {score.issues.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      {isKo ? '개선이 필요한 부분' : 'Areas to Improve'}
                    </h3>
                    <div className="space-y-3">
                      {score.issues.map((issue, index) => (
                        <motion.div
                          key={issue.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="bg-white rounded-xl p-4 border border-gray-200"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl flex-shrink-0">
                              {severityConfig[issue.severity].icon}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  issue.severity === 'critical'
                                    ? 'bg-red-100 text-red-700'
                                    : issue.severity === 'warning'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  -{issue.points_deducted}점
                                </span>
                                <span className="text-xs text-gray-500">
                                  {issue.affected_steps.join(' → ')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-800">
                                {isKo ? issue.message_ko : issue.message_en}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 잘하고 있는 항목 */}
                {goodPractices.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      {isKo ? '잘하고 있어요!' : 'Great job!'}
                    </h3>
                    <div className="space-y-2">
                      {goodPractices.map((practice, index) => (
                        <motion.div
                          key={practice.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-center gap-3 bg-green-50 rounded-xl p-3 border border-green-200"
                        >
                          <span className="text-lg">✅</span>
                          <p className="text-sm text-green-800">
                            {isKo ? practice.message_ko : practice.message_en}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 하단 버튼 */}
                <div className="flex gap-3 mt-8">
                  {score.issues.some(i => i.type === 'order') && onAutoReorder && (
                    <button
                      onClick={() => {
                        onAutoReorder();
                        onClose();
                      }}
                      className="flex-1 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
                    >
                      {isKo ? '권장 순서로 자동 정렬' : 'Auto-reorder'}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className={`flex-1 py-3.5 font-semibold rounded-xl transition-colors ${
                      score.issues.some(i => i.type === 'order') && onAutoReorder
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isKo ? '이대로 유지' : 'Keep current'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
