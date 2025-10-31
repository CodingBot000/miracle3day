'use client';

import { ReviewDataFromGoogleMap } from '@/app/models/reviewData.dto';
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

        <div className="overflow-x-auto md:overflow-visible">
          <div className="grid grid-cols-2 gap-4 md:hidden">
            {reviews.map((review, idx) => (
              <div key={idx} className="flex justify-center">
                <ReviewCardForHome review={review} />
              </div>
            ))}
          </div>

          <div className="hidden md:flex md:flex-wrap md:gap-4">
            {reviews.slice(0, 4).map((review, idx) => (
              <div key={idx}>
                <ReviewCardForHome review={review} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
