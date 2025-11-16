'use client';

import { ReviewDataFromGoogleMap } from '@/app/models/reviewData.dto';
import Stars from '@/components/atoms/Stars';
import { maskName } from '@/lib/utils';

interface ReviewCardForHomeProps {
  review: ReviewDataFromGoogleMap & { translatedText?: string };
}

const ReviewCardForHome = ({ review }: ReviewCardForHomeProps) => {
  return (
    <div className="border-2 !border-black rounded-lg p-3 md:p-4 bg-white shadow-sm hover:shadow-md transition-shadow h-[200px] md:h-[230px] w-[220px] md:w-[350px] flex flex-col flex-shrink-0">
      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
        {review.authorAttribution?.photoUri && (
          <img
            src={review.authorAttribution.photoUri}
            alt="author"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0 filter blur-[3px] scale-105"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-xs md:text-sm truncate">
            {maskName(review.authorAttribution?.displayName ?? 'Anonymous')}
          </div>
        </div>
        <div className="flex-shrink-0">
          {typeof review.rating === 'number' ? (
            <Stars score={review.rating} size={14} showNumber={false} />
          ) : (
            <span className="text-xs md:text-sm text-gray-400">-</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden mb-2 md:mb-3">
        <p className="text-xs md:text-sm text-gray-700 line-clamp-5 md:line-clamp-8 whitespace-pre-wrap">
          {review.translatedText || (review.text?.text ?? '(No content)')}
        </p>
      </div>
    </div>
  );
};

export default ReviewCardForHome;
