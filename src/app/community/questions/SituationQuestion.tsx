'use client';

import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { useRouter } from 'next/navigation';

export default function SituationQuestion({ question }: { question: any }) {
  console.log('SituationQuestion question', question);
  const router = useRouter();
  const { language } = useCookieLanguage();

  // 다국어 텍스트 추출 헬퍼
  const getText = (jsonbField: any): string => {
    if (!jsonbField) return '';
    if (typeof jsonbField === 'string') return jsonbField;
    return jsonbField[language] || jsonbField.en || jsonbField.ko || '';
  };

  const handleAnswer = () => {
    router.push(`/community/questions/${question.id}`);
  };

  const handleViewAnswers = () => {
    router.push(`/community/questions/${question.id}#answers`);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="bg-orange-100 text-orange-800 text-sm font-bold px-3 py-1 rounded-full">
          {language === 'ko' ? '🎭 상황 · 경험 공유' : '🎭 Situation · Experience Sharing'}
        </span>
        <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full">
          +{question.points_reward} pts
        </span>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {getText(question.title)}
      </h3>

      {question.situation_context && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mb-4">
          <div className="text-gray-700 line-clamp-3">
            {getText(question.situation_context)}
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleAnswer}
          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
        >
          {language === 'ko' ? '💬 내 경험 공유하기' : '💬 Share My Experience'}
        </button>
        <button
          onClick={handleViewAnswers}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:border-orange-500 hover:bg-orange-50 transition"
        >
          {language === 'ko' ? `👀 ${question.answer_count || 0}개 답변` : `👀 ${question.answer_count || 0} answers`}
        </button>
      </div>
    </div>
  );
}
