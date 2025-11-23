'use client';

import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { useRouter } from 'next/navigation';
import { useLoginGuard } from '@/hooks/useLoginGuard';

export default function SituationQuestion({ question }: { question: any }) {
  const router = useRouter();
  const { language } = useCookieLanguage();
  const { requireLogin, loginModal } = useLoginGuard();

  // 다국어 텍스트 추출
  const getText = (jsonbField: any): string => {
    if (!jsonbField) return '';
    if (typeof jsonbField === 'string') return jsonbField;
    return jsonbField[language] || jsonbField.en || jsonbField.ko || '';
  };

  // 읽기 화면으로 이동 (로그인 불필요)
  const handleCardClick = () => {
    router.push(`/community/questions/${question.id}`);
  };

  // 글쓰기 화면 (로그인 필수)
  const handleShareExperience = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 방지

    // 로그인 체크 - 비로그인시 모달 표시
    if (!requireLogin()) {
      return;
    }

    // 글쓰기 화면으로 이동
    router.push(`/community/questions/${question.id}/write`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* 태그 영역 */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
        <span className="bg-orange-100 text-orange-800 text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          {language === 'ko' ? '🎭 경험 공유' : '🎭 Experience'}
        </span>
        <span className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          +{question.points_reward} pts
        </span>
      </div>

      {/* 제목 */}
      <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">
        {getText(question.title)}
      </h3>

      {/* 상황 배경 */}
      {question.situation_context && (
        <div className="bg-orange-50 border-l-2 sm:border-l-4 border-orange-500 p-2.5 sm:p-4 rounded-lg mb-3 sm:mb-4">
          <div className="text-sm sm:text-base text-gray-700 line-clamp-3">
            {getText(question.situation_context)}
          </div>
        </div>
      )}

      {/* 하단: 버튼 + 통계 */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* 왼쪽: 공유 버튼 */}
        <button
          onClick={handleShareExperience}
          className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
        >
          {language === 'ko' ? '💬 경험 공유' : '💬 Share'}
        </button>

        {/* 오른쪽: 통계 정보 (읽기 전용) */}
        <div className="flex-1 flex items-center gap-2 sm:gap-4 justify-end text-gray-600 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <span>👀</span>
            <span>{question.view_count || 0}</span>
          </div>

          <div className="flex items-center gap-1">
            <span>💬</span>
            <span>{question.answer_count || 0}</span>
          </div>
        </div>
      </div>

      {/* 로그인 모달 */}
      {loginModal}
    </div>
  );
}