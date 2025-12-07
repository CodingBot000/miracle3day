'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ReviewCardForHome from '@/components/molecules/card/ReviewCardForHome';
import { ReviewDataFromGoogleMap } from '@/models/reviewData.dto';
import { useLocale } from 'next-intl';

type ApiReview = {
  id: number;
  id_uuid_hospital: string;
  review_text: string | null;
  rating: number | null;
  publish_time: string | null;
  author_name: string | null;
  author_photo_url: string | null;
  author_profile_url: string | null;
};

/**
 * Convert API review format to ReviewDataFromGoogleMap format
 */
function convertToReviewFormat(apiReview: ApiReview): ReviewDataFromGoogleMap {
  return {
    rating: apiReview.rating,
    publishTime: apiReview.publish_time,
    authorAttribution: {
      displayName: apiReview.author_name ?? undefined,
      photoUri: apiReview.author_photo_url ?? undefined,
      uri: apiReview.author_profile_url ?? undefined,
    },
    sourceLanguage: null,
    text: {
      text: apiReview.review_text ?? '',
      languageCode: null,
    },
  };
}

export default function ReviewScrollSection() {
  const locale = useLocale();
  const [reviews, setReviews] = useState<ApiReview[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data with locale
  useEffect(() => {
    let mounted = true;
    // log.debug('[ReviewScrollSection] Starting to fetch reviews...');

    (async () => {
      try {
        const res = await fetch(`/api/places/random-reviews?limit=10&lang=${locale}`, { cache: 'no-store' });
        // log.debug('[ReviewScrollSection] Response status:', res.status);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        // log.debug('[ReviewScrollSection] Received data:', data);
        // log.debug('[ReviewScrollSection] Reviews count:', data?.reviews?.length ?? 0);

        if (mounted) {
          setReviews(data?.reviews ?? []);
          setError(null);
        }
      } catch (e) {
        // console.error('[ReviewScrollSection] Error loading reviews:', e);
        if (mounted) {
          setReviews([]);
          setError(e instanceof Error ? e.message : 'Unknown error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
          // log.debug('[ReviewScrollSection] Loading complete');
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [locale]);

  // Convert to ReviewDataFromGoogleMap format (이미 API에서 다국어 처리됨)
  const displayReviews = useMemo(() => {
    return (reviews ?? []).map(convertToReviewFormat);
  }, [reviews]);

  // Double the list for infinite loop
  const doubled = useMemo(
    () => displayReviews.concat(displayReviews),
    [displayReviews]
  );

  // Check for reduced motion preference
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // requestAnimationFrame for smooth scrolling
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current || !doubled.length || prefersReduced) return;

    const wrap = wrapRef.current;
    let rafId: number;
    let last = performance.now();
    const speed = 30; // px/sec (adjust for desired scroll speed)

    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      wrap.scrollLeft += speed * dt;

      // Loop back when reaching halfway (since list is doubled)
      const loopWidth = wrap.scrollWidth / 2;

      if (wrap.scrollLeft >= loopWidth) {
        wrap.scrollLeft = wrap.scrollLeft - loopWidth;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [doubled.length, prefersReduced]);

  // Skeleton loading state - 항상 공간 차지
  if (loading) {
    return (
      <section className="w-full pt-8 md:pt-12 h-[350px] md:h-[450px]">
        <div className="w-full -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">Customer Reviews</h2>
          </div>

          <div className="w-full overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4 px-4 sm:px-6 lg:px-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[300px] md:w-[400px] h-[250px] md:h-[330px] shrink-0 rounded-lg border border-gray-200 p-4 animate-pulse bg-white"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-5/6 bg-gray-200 rounded" />
                    <div className="h-3 w-2/3 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="w-full pt-8 md:pt-12 h-[350px] md:h-[450px]">
        <div className="w-full -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">Customer Reviews</h2>
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load reviews</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No reviews - 여전히 공간 차지
  if (!reviews || reviews.length === 0) {
    return (
      <section className="w-full pt-8 md:pt-12 h-[350px] md:h-[450px]">
        <div className="w-full -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">Customer Reviews</h2>
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews available at the moment</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // log.debug('[ReviewScrollSection] Rendering reviews:', convertedReviews.length);

  return (
    <section className="w-full pt-8 md:pt-12 h-[350px] md:h-[450px]">
      <div className="w-full -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 mb-3">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Customer Reviews Top {reviews.length} reviews
          </h2>
        </div>

        <div className="w-full overflow-x-auto overflow-y-hidden">
          <div
            ref={wrapRef}
            className="flex gap-4 px-4 sm:px-6 lg:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {doubled.map((review, idx) => (
              <div key={`review-${idx}`} className="shrink-0">
                <ReviewCardForHome review={review} />
              </div>
            ))}
          </div>
        </div>

        {prefersReduced && (
          <div className="px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500 text-center mt-4">
              Auto-scroll disabled due to motion preferences
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
