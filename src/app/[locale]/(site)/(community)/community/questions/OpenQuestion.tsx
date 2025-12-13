'use client';

import { useLocale } from 'next-intl';
import { useNavigation } from '@/hooks/useNavigation';

export default function OpenQuestion({ question }: { question: any }) {
  // log.debug('OpenQuestion question', question);
  const { navigate } = useNavigation();
  const locale = useLocale();

  // 다국어 텍스트 추출 헬퍼
  const getText = (jsonbField: any): string => {
    if (!jsonbField) return '';
    if (typeof jsonbField === 'string') return jsonbField;
    return jsonbField[locale] || jsonbField.en || jsonbField.ko || '';
  };

  const handleAnswer = () => {
    navigate(`/community/questions/${question.id}`);
  };

  const handleViewAnswers = () => {
    navigate(`/community/questions/${question.id}#answers`);
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
        <span className="bg-purple-100 text-purple-800 text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          {locale === 'ko' ? '💬 OPEN Q&A' : '💬 OPEN Q&A'}
        </span>
        <span className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          +{question.points_reward} pts
        </span>
        {question.difficulty === 'expert' && (
          <span className="bg-red-100 text-red-800 text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
            {locale === 'ko' ? '🔥 고급' : '🔥 Expert'}
          </span>
        )}
      </div>

      <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
        {getText(question.title)}
      </h3>

      {question.subtitle && (
        <p className="text-sm sm:text-lg text-gray-600 mb-3 sm:mb-4 leading-relaxed">
          {getText(question.subtitle)}
        </p>
      )}

      <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 flex-wrap">
        <button
          onClick={handleAnswer}
          className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
        >
          {locale === 'ko' ? '📝 답변 작성' : '📝 Write Answer'}
        </button>
        <button
          onClick={handleViewAnswers}
          className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 rounded-lg text-sm sm:text-base font-semibold hover:border-purple-600 hover:bg-purple-50 transition"
        >
          {locale === 'ko' ? `👀 ${question.answer_count || 0}개` : `👀 ${question.answer_count || 0}`}
        </button>
      </div>
    </div>
  );
}
