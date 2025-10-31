"use client";

import { findRegionByKey, REGIONS } from "@/constants";
import Link from "next/link";
import Image from "next/image";
import { useGooglePlaceReviews } from "@/hooks/useGooglePlaceReviews";
import { ReviewStats } from "@/components/molecules/ReviewStats";
import { useCookieLanguage } from "@/hooks/useCookieLanguage";

interface HospitalCardProps {
  src: string;
  alt: string;
  onSelect?: (name: string) => void;
  name: string;
  href: string;
  locationNum?: string;
  searchKey?: string | null;
}

export const HospitalCard = ({
  alt,
  src,
  name,
  href,
  locationNum,
  searchKey,
  onSelect,
}: HospitalCardProps) => {
  const { language } = useCookieLanguage();
  const locationKey =
    typeof locationNum === "string" && locationNum.length > 0
      ? Number.parseInt(locationNum, 10)
      : undefined;
  const region =
    typeof locationKey === "number" && Number.isFinite(locationKey)
      ? findRegionByKey(REGIONS, locationKey)
      : undefined;

  // Google Places 리뷰 가져오기
  const { data: googleReviewsData } = useGooglePlaceReviews(searchKey || '');

  return (
    <article onClick={() => onSelect && onSelect(name)}>
      <Link href={href}>
        <div className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[250px] md:h-[330px] transition-all duration-250 hover:shadow-md flex flex-col">
            {/* Hospital Image */}
            <div className="relative h-40 md:h-48 rounded-t-xl overflow-hidden flex-shrink-0">
              <Image src={src} alt={alt} fill className="object-cover" />
            </div>

            {/* Hospital Info */}
            <div className="p-3 md:p-4 flex-grow flex flex-col justify-start">
              <h3 className="font-semibold text-gray-900 text-sm md:text-lg mb-1 line-clamp-2">
                {name}
              </h3>

              {/* Google 리뷰 평점 통계 */}
              {googleReviewsData && (
                <ReviewStats
                  rating={googleReviewsData.rating}
                  userRatingCount={googleReviewsData.userRatingCount}
                  language={language}
                  size={16}
                  className="mt-1"
                />
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};
