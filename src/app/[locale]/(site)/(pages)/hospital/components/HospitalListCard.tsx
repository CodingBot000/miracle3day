"use client";

import { HospitalData } from "@/models/hospitalData.dto";
import { findRegionByKey, REGIONS } from "@/constants";
import { Link } from "@/i18n/routing";
import { ReviewStats } from "@/components/molecules/ReviewStats";
import { useLocale } from "next-intl";
import { Map, MapPin } from "lucide-react";

interface HospitalListCardProps {
  hospital: HospitalData;
  href: string;
  showTreatmentInfo?: boolean;
  // Google 리뷰 데이터는 props로 전달받음 (API 호출 제거)
  googleRating?: number | null;
  googleReviewCount?: number | null;
}

const HospitalListCard = ({
  hospital,
  href,
  showTreatmentInfo = false,
  googleRating,
  googleReviewCount,
}: HospitalListCardProps) => {
  // Language hook
  const language = useLocale() as 'ko' | 'en';

  const region = findRegionByKey(REGIONS, parseInt(hospital.location!, 10));

  return (
    <Link href={href} className="block">
      <div className="space-y-4 md:space-y-6">
        {/* Hospital Card */}
        <div className="flex items-start gap-4 md:gap-6">
          {/* Hospital Image - Responsive: 160x160 (mobile) to 350x350 (desktop) */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-50 md:h-50 lg:w-55 lg:h-55 xl:w-60 xl:h-60 bg-gray-200 rounded-lg flex-shrink-0">
            {hospital.thumbnail_url ? (
              <img
                src={hospital.thumbnail_url}
                alt={hospital.name_en}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : hospital.imageurls?.[0] ? (
              <img
                src={hospital.imageurls[0]}
                alt={hospital.name_en}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : null}
          </div>

          {/* Hospital Info */}
          <div className="flex-1 space-y-2 md:space-y-4">
            <div className="space-y-2 md:space-y-4">
              <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-normal text-black leading-tight">
                {language === 'ko' ? hospital.name : hospital.name_en}
              </h3>

              {/* 구글 별점 통계 표시 */}
              {googleRating != null && (
                <ReviewStats
                  rating={googleRating}
                  userRatingCount={googleReviewCount ?? 0}
                  language={language}
                  size={16}
                  className="mt-1"
                />
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin size="15" />
                {/* <span className="font-bold">{language === 'ko' ? '위치' : 'Location'} :</span> */}
                <span>{language === 'ko' ? region?.label.ko : region?.label.en}</span>
              </div>

              <p className="text-sm md:text-base lg:text-lg text-gray-500">
              </p>

              {showTreatmentInfo && (
                <p className="text-sm md:text-base lg:text-lg text-gray-500">
                  {/* Laser toning, acne scar treatment */}
                </p>
              )}

              <p className="text-sm md:text-base lg:text-lg text-gray-500">
                {/* ★4.8 (120+ reviews) */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HospitalListCard;
