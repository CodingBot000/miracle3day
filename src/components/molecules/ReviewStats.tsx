"use client";

import Stars from "@/components/atoms/Stars";

interface ReviewStatsProps {
  rating?: number | null;
  userRatingCount?: number;
  language?: 'ko' | 'en';
  size?: number;
  className?: string;
}

/**
 * Google Places 리뷰 평점 통계를 표시하는 컴포넌트
 *
 * @param rating - 평점 (1-5)
 * @param userRatingCount - 리뷰 개수
 * @param language - 언어 설정 ('ko' | 'en')
 * @param size - 별 아이콘 크기 (기본값: 20)
 * @param className - 추가 CSS 클래스
 */
export const ReviewStats = ({
  rating,
  userRatingCount,
  language = 'en',
  size = 20,
  className = ''
}: ReviewStatsProps) => {
  if (!rating && !userRatingCount) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {typeof rating === 'number' ? (
        <>
          <Stars score={rating} size={size} />
          <span className="text-sm text-gray-600">
            ({userRatingCount} {language === 'ko' ? '개의 리뷰' : 'reviews'})
          </span>
        </>
      ) : (
        <span className="text-sm text-gray-600">
          {language === 'ko' ? '평점 정보 없음' : 'No rating available'}
        </span>
      )}
    </div>
  );
};
