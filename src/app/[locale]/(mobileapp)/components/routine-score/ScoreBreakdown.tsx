'use client';

import { motion } from 'framer-motion';

interface ScoreBreakdownProps {
  orderScore: number;
  completenessScore: number;
  ingredientScore: number;
  locale?: string;
}

const SCORE_CONFIG = {
  order: {
    max: 60,
    label_ko: '순서 점수',
    label_en: 'Order Score',
    description_ko: '제품 사용 순서가 올바른가요?',
    description_en: 'Is the product order correct?',
    color: '#3B82F6' // blue
  },
  completeness: {
    max: 25,
    label_ko: '완성도 점수',
    label_en: 'Completeness Score',
    description_ko: '필수 단계가 포함되어 있나요?',
    description_en: 'Are essential steps included?',
    color: '#10B981' // green
  },
  ingredient: {
    max: 15,
    label_ko: '성분 조화 점수',
    label_en: 'Ingredient Score',
    description_ko: '성분 간 충돌이 없나요?',
    description_en: 'Are ingredients compatible?',
    color: '#8B5CF6' // purple
  }
};

export default function ScoreBreakdown({
  orderScore,
  completenessScore,
  ingredientScore,
  locale = 'ko'
}: ScoreBreakdownProps) {
  const isKo = locale === 'ko';

  const scores = [
    { key: 'order', score: orderScore, config: SCORE_CONFIG.order },
    { key: 'completeness', score: completenessScore, config: SCORE_CONFIG.completeness },
    { key: 'ingredient', score: ingredientScore, config: SCORE_CONFIG.ingredient }
  ];

  return (
    <div className="space-y-4">
      {scores.map(({ key, score, config }, index) => {
        const percentage = (score / config.max) * 100;
        const isPerfect = score === config.max;

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4"
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="font-semibold text-gray-900">
                  {isKo ? config.label_ko : config.label_en}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="font-bold text-lg"
                  style={{ color: config.color }}
                >
                  {score}
                </span>
                <span className="text-gray-400 text-sm">/ {config.max}</span>
                {isPerfect && <span className="ml-1">✨</span>}
              </div>
            </div>

            {/* 프로그레스 바 */}
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 + 0.2 }}
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ backgroundColor: config.color }}
              />
            </div>

            {/* 설명 */}
            <p className="text-xs text-gray-500 mt-2">
              {isKo ? config.description_ko : config.description_en}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
