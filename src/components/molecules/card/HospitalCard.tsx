"use client";

import { findRegionByKey, REGIONS } from "@/constants";
import Link from "next/link";
import Image from "next/image";
import { ReviewStats } from "@/components/molecules/ReviewStats";
import { useLocale } from "next-intl";

interface HospitalCardProps {
  src: string;
  alt: string;
  onSelect?: (name: string) => void;
  name: string;
  href: string;
  locationNum?: string;
  // Google 리뷰 데이터는 props로 전달받음 (API 호출 제거)
  googleRating?: number | null;
  googleReviewCount?: number | null;
}

export const HospitalCard = ({
  alt,
  src,
  name,
  href,
  locationNum,
  googleRating,
  googleReviewCount,
  onSelect,
}: HospitalCardProps) => {
  const locale = useLocale() as 'ko' | 'en';
  const locationKey =
    typeof locationNum === "string" && locationNum.length > 0
      ? Number.parseInt(locationNum, 10)
      : undefined;
  const region =
    typeof locationKey === "number" && Number.isFinite(locationKey)
      ? findRegionByKey(REGIONS, locationKey)
      : undefined;

  return (
    <article onClick={() => onSelect && onSelect(name)}>
      <Link href={href}>
        <div className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-250 hover:shadow-md flex flex-col">
            {/* Hospital Image - maintains aspect ratio */}
            <div className="relative w-full aspect-[4/3] rounded-t-xl overflow-hidden">
              <Image src={src} alt={alt} fill className="object-cover" />
            </div>

            {/* Hospital Info */}
            <div className="p-3 md:p-4 flex flex-col justify-start min-h-[100px] md:min-h-[120px]">
              <h3 className="font-semibold text-gray-900 text-sm md:text-lg mb-1 line-clamp-2">
                {name}
              </h3>

              {/* Google 리뷰 평점 통계 */}
              {googleRating != null && (
                <ReviewStats
                  rating={googleRating}
                  userRatingCount={googleReviewCount ?? 0}
                  language={locale}
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
