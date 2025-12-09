'use client';

import { ReviewDataFromGoogleMap } from '@/models/reviewData.dto';
import ReviewCardForHome from '@/components/molecules/card/ReviewCardForHome';

interface ReviewSectionProps {
  reviews: ReviewDataFromGoogleMap[];
  isLoading?: boolean;
}

const ReviewSection = ({ reviews, isLoading = false }: ReviewSectionProps) => {
  if (isLoading) {
    return (
      <section className="py-8 border-b-8 border-gray-50">
        <div className="px-4">
          {/* <h2 className="text-xl font-semibold mb-6">Google Reviews</h2> */}
          <div className="text-sm text-gray-600">Loading reviews...</div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <section className="py-8 border-b-8 border-gray-50">
        <div className="px-4">
          {/* <h2 className="text-xl font-semibold mb-6">Google Reviews</h2> */}
          {/* <div className="text-sm text-gray-600">No reviews available.</div> */}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 border-b-8 border-gray-50">
      <div className="px-4">
        {/* <h2 className="text-xl font-semibold mb-6">Google Reviews (Max 5)</h2> */}

        {/* All devices: Horizontal scroll */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-3 md:gap-4 pb-2">
            {reviews.map((review, idx) => (
              <ReviewCardForHome key={idx} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
