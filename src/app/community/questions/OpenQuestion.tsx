'use client';

import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { useRouter } from 'next/navigation';

export default function OpenQuestion({ question }: { question: any }) {
  console.log('OpenQuestion question', question);
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
        <span className="bg-purple-100 text-purple-800 text-sm font-bold px-3 py-1 rounded-full">
          {language === 'ko' ? '💬 OPEN Q&A · 상세 답변' : '💬 OPEN Q&A · Detailed Answer'}
        </span>
        <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full">
          +{question.points_reward} pts
        </span>
        {question.difficulty === 'expert' && (
          <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
            {language === 'ko' ? '🔥 고급' : '🔥 Expert'}
          </span>
        )}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {getText(question.title)}
      </h3>

      {question.subtitle && (
        <p className="text-gray-600 mb-4 text-lg leading-relaxed">
          {getText(question.subtitle)}
        </p>
      )}

      <div className="flex gap-3 mt-4 flex-wrap">
        <button
          onClick={handleAnswer}
          className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
        >
          {language === 'ko' ? '📝 상세 답변 작성' : '📝 Write Detailed Answer'}
        </button>
        <button
          onClick={handleViewAnswers}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:border-purple-600 hover:bg-purple-50 transition"
        >
          {language === 'ko' ? `👀 ${question.answer_count || 0}개 답변` : `👀 ${question.answer_count || 0} answers`}
        </button>
      </div>
    </div>
  );
}
