"use client";

import { HospitalData } from "@/models/hospitalData.dto";
import { LocationEnum } from "@/constants";
import { useRouter } from "next/navigation";
import HospitalListCard from "./HospitalListCard";
import { ROUTE } from "@/router";
import { useHospitalGoogleSnapshots } from "@/hooks/useHospitalGoogleSnapshots";
import { useMemo } from "react";
import { useLocale } from "next-intl";

// Fallback 메시지 (시술 기반 검색 결과가 없을 때)
const FALLBACK_MESSAGES: Record<string, string> = {
  ko: "선택하신 시술을 명시적으로 제공하는 병원이 현재 없습니다. 하지만 병원과 상담시 가능할 수 있습니다. 상담은 무료이니 아래 가능성 높은 병원들에서 상담해 보시길 권장드립니다.",
  en: "Unfortunately, there are no hospitals that currently offer the specific procedure you selected. However, it may be available through consultation with a hospital. Since consultations are free, we recommend reaching out to the highly recommended hospitals below.",
  ja: "お選びになられた施術を明示的に提供している病院は現在ございません。ただし、病院とのコンサルテーションを通じて対応可能な場合があります。コンサルテーションは無料ですので、以下の可能性の高い病院でのご相談をお勧めします。",
  "zh-CN": "目前没有医院明确提供您所选的治疗项目。但是通过与医院的咨询，可能有解决方案。咨询是免费的，我们建议您咨询以下可能性较大的医院。",
  "zh-TW": "目前沒有醫院明確提供您所選的治療項目。但是通過與醫院的諮詢，可能有解決方案。諮詢是免費的，我們建議您諮詢以下可能性較大的醫院。",
};

interface HospitalListNewDesignProps {
  initialData: HospitalData[];
  isFallback?: boolean;
}

const HospitalListNewDesign = ({ initialData, isFallback = false }: HospitalListNewDesignProps) => {
  const locale = useLocale();
  const hospitals = Array.isArray(initialData) ? initialData : [];
  const router = useRouter();

  // 병원 ID 목록 추출
  const hospitalIds = useMemo(
    () => hospitals.map((h) => h.id_uuid).filter(Boolean) as string[],
    [hospitals]
  );

  // Google 리뷰 스냅샷 bulk fetch
  const { data: googleSnapshots } = useHospitalGoogleSnapshots(hospitalIds);

  // Hospital data received successfully with show field

  const handleBackClick = () => {
    router.back();
  };

  // initialData.forEach((hospital, index) => {
  //   if (hospital.id_uuid === "b2ae476e-00a0-49cd-898d-770880992d85") {
  //     log.debug("HospitalListNewDesign target hospital:", { name: hospital.name, thumbnail_url: hospital.thumbnail_url });
  //   } else {
  //     log.debug("HospitalListNewDesign other hospital:", { name: hospital.name, thumbnail_url: hospital.thumbnail_url });
  //   }
  // });
  // b2ae476e-00a0-49cd-898d-770880992d85
  return (
    <div className="w-full max-w-7xl mx-auto bg-white min-h-screen">
      {/* Header with back button */}
      <div className="flex items-center h-14 px-4 md:px-6 lg:px-8 border-b border-gray-100 relative">
        <button 
          onClick={handleBackClick}
          className="flex items-center justify-center w-6 h-6 mr-3"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.0711 5L8 12.0711L15.0711 19.1421" stroke="#1C1C1C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <p className="text-sm md:text-base text-gray-700 font-medium">
          Awesome Korean Premium Clinics For You
        </p>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 lg:px-8 py-8 border-b-8 border-gray-50">
        <div className="space-y-6">
          {/* Title */}
          {/* <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-black leading-[26.6px]">
            Clinic List
          </h1> */}
          <h1 className="text-sm md:text-base text-gray-500 leading-[26.6px]">
            Korean dermatology clinics with services for international patients
          </h1>

          {/* Fallback 메시지 */}
          {isFallback && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 leading-relaxed">
                {FALLBACK_MESSAGES[locale] || FALLBACK_MESSAGES.en}
              </p>
            </div>
          )}

          {/* Clinic List */}
          <div className="space-y-8 md:space-y-12">
            {hospitals.map((hospital) => {
              const snapshot = googleSnapshots?.[hospital.id_uuid!];
              return (
                <HospitalListCard
                  key={hospital.id_uuid}
                  hospital={hospital}
                  href={ROUTE.HOSPITAL_DETAIL("") + hospital.id_uuid}
                  googleRating={snapshot?.rating}
                  googleReviewCount={snapshot?.userRatingCount}
                />
              );
            })}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalListNewDesign;
