"use client";

import Stars from "@/components/atoms/Stars";

interface ReviewStatsProps {
  rating?: number | string | null;
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
  const rawRating =
    typeof rating === 'string'
      ? Number.parseFloat(rating)
      : typeof rating === 'number'
        ? rating
        : null;

  const ratingValue =
    typeof rawRating === 'number' && Number.isFinite(rawRating)
      ? rawRating
      : null;

  if (ratingValue === null && !userRatingCount) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-0.5 sm:gap-1 ${className}`}>
      {ratingValue !== null ? (
        <>
          <Stars
            score={ratingValue}
            size={size}
            className="origin-left scale-90 sm:scale-100"
          />
          <span className="text-xs text-gray-600 sm:text-sm">
            ({userRatingCount} {language === 'ko' ? '개의 리뷰' : 'reviews'})
          </span>
        </>
      ) : (
        <span className="text-xs text-gray-600 sm:text-sm">
          {language === 'ko' ? '평점 정보 없음' : 'No rating available'}
        </span>
      )}
    </div>
  );
};
