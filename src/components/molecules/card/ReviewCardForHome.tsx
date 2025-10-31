'use client';

import { ReviewDataFromGoogleMap } from '@/app/models/reviewData.dto';
import Stars from '@/components/atoms/Stars';

interface ReviewCardForHomeProps {
  review: ReviewDataFromGoogleMap;
}

const ReviewCardForHome = ({ review }: ReviewCardForHomeProps) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow h-[250px] md:h-[330px] w-[300px] md:w-[400px] flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        {review.authorAttribution?.photoUri && (
          <img
            src={review.authorAttribution.photoUri}
            alt="author"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {review.authorAttribution?.displayName ?? 'Anonymous'}
          </div>
          {/* {review.publishTime && (
            <div className="text-xs text-gray-500">
              {new Date(review.publishTime).toLocaleDateString()}
            </div>
          )} */}
        </div>
        <div className="flex-shrink-0">
          {typeof review.rating === 'number' ? (
            <Stars score={review.rating} size={16} showNumber={false} />
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden mb-3">
        <p className="text-sm text-gray-700 line-clamp-6 md:line-clamp-8 whitespace-pre-wrap">
          {review.text?.text ?? '(No content)'}
        </p>
      </div>

      {review.authorAttribution?.uri && (
        <div className="mt-auto">
          <a
            className="text-xs text-blue-600 underline hover:text-blue-800"
            href={review.authorAttribution.uri}
            target="_blank"
            rel="noreferrer"
          >
            View original
          </a>
        </div>
      )}
    </div>
  );
};

export default ReviewCardForHome;
