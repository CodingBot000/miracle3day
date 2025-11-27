"use client";

import { log } from '@/utils/logger';


import { useState } from "react";
import { HospitalDetailMainOutput } from "@/app/api/hospital/[id]/main/main.dto";
// import Image from "next/image";;
import { useRouter } from "next/navigation";
import HospitalContactInfo from "./HospitalContactInfo";
import HospitalLocation from "./HospitalLocation";
import HospitalDoctorList from "./HospitalDoctorList";
import HospitalAmenities from "./HospitalAmenities";
import HospitalConsultationButton from "./HospitalConsultationButton";
import HospitalBusinessHours from "./HospitalBusinessHours";
import ResponsiveImageMosaic from "@/components/template/ResponsiveImageMosaic";
import ImageGalleryModal from "@/components/template/modal/ImageGalleryModal";
import HospitalLanguageSupport from "./HospitalLanguageSupport";
import { useCookieLanguage } from "@/hooks/useCookieLanguage";
import HospitalYouTubePreview from "./HospitalYouTubePreview";
import TreatmentProductList from "@/components/organism/layout/TreatmentProductList";
import { useTreatmentProducts } from "@/hooks/useTreatmentProducts";
import ReviewSection from "@/components/template/ReviewSection";
import { useHospitalGoogleReviews } from "@/hooks/useHospitalGoogleReviews";
import { ReviewStats } from "@/components/molecules/ReviewStats";
import { useTranslatedGoogleReviews, getTargetLanguage } from "@/hooks/useTranslatedGoogleReviews";
import { Skeleton } from "@/components/ui/skeleton";
import InstagramFeed from "@/components/organism/sns/InstagramFeed";

interface HospitalDetailNewDesignProps {
  hospitalData: HospitalDetailMainOutput;
}

const HospitalDetailNewDesign = ({ hospitalData }: HospitalDetailNewDesignProps) => {
  const router = useRouter();
  const { language } = useCookieLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  log.debug('HospitalDetailNewDesign hospitalData:', hospitalData);
  const { hospital_info, hospital_details, doctors, business_hours } = hospitalData;

  // Google Places 리뷰 가져오기 (DB 캐시 우선)
  const { data: googleReviewsData, isLoading: isLoadingGoogleReviews } = useHospitalGoogleReviews(hospital_info.id_uuid);

  // 브라우저 언어로 리뷰 번역
  const targetLang = getTargetLanguage();
  const reviews = googleReviewsData?.reviews ?? [];

  const {
    data: translatedReviews,
    isLoading: isLoadingTranslation,
    isFetching: isFetchingTranslation,
  } = useTranslatedGoogleReviews({
    hospitalId: hospital_info.id_uuid,
    targetLang,
    reviews,
    enabled: !!googleReviewsData && reviews.length > 0,
  });

  // Treatment Products 가져오기
  const { data: treatmentProducts = [], isLoading: isLoadingProducts } = useTreatmentProducts(hospital_info.id_uuid);

  // 번역 완료 여부 확인
  const showReviewSkeleton = isLoadingGoogleReviews || isLoadingTranslation || isFetchingTranslation;

  const handleBackClick = () => {
    router.back();
  };

  const handleImageClicked = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  log.debug('HospitalDetailNewDesign hospitalData:' ,hospitalData);
  return (
    <div className="max-w-container mx-auto min-h-screen relative">
      {/* Header with back button */}
      {/* <div className="flex items-center h-14 px-4 border-b border-gray-100 relative"> */}
        {/* <button 
          onClick={handleBackClick}
          className="flex items-center justify-center w-6 h-6"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.0711 5L8 12.0711L15.0711 19.1421" stroke="#1C1C1C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        
        </button>
         */}

         <div className="flex items-center h-14 px-4 md:px-6 lg:px-8 border-b border-gray-100 relative">
        <button 
          onClick={handleBackClick}
          className="flex items-center justify-center w-6 h-6 mr-3"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.0711 5L8 12.0711L15.0711 19.1421" stroke="#1C1C1C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <p className="text-xl md:text-2xl text-gray-700 font-bold">
          Introduce Korean Premium Clinic
        </p>
      </div>


      <div className="w-full relative mb-6">
        <ResponsiveImageMosaic
          images ={hospital_info.imageurls}
          onOpen={handleImageClicked}
          />
      </div>

      {/* Hospital Info Section */}
      <div className="px-4 py-6 border-b-8 border-gray-50">
        <div className="space-y-6">
          {/* Hospital Name and Description */}
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-medium text-gray-900 leading-[33.6px]">

              {language === 'ko' ? hospital_info.name : hospital_info.name_en}
            </h1>

            {/* Google 리뷰 평점 통계 */}
            {googleReviewsData && (
              <ReviewStats
                rating={googleReviewsData.rating}
                userRatingCount={googleReviewsData.userRatingCount}
                language={language}
                size={20}
                className="mt-2"
              />
            )}

            {hospital_details.introduction_en && (
                <div className="text-sm md:text-base text-gray-500 leading-[22.4px] whitespace-pre-line">
                  {language === 'ko' ? hospital_details.introduction : hospital_details.introduction_en}
                </div>
              )}

          </div>

          {/* Contact Information */}
          {/* <HospitalContactInfo hospitalDetails={hospital_details} /> */}
        </div>
      </div>

      <HospitalBusinessHours business_hours={business_hours} />

      {/* Google Reviews Section */}
      <h2 className="px-4 py-8 text-lg font-semibold text-black mb-4 leading-[26.6px]">
        Reviews
      </h2>

      {/* 번역 중일 때 Skeleton UI */}
      {showReviewSkeleton && (
        <section className="py-8 border-b-8 border-gray-50">
          <div className="px-4">
            <div className="space-y-3">
              <Skeleton className="h-[250px] md:h-[330px] w-[300px] md:w-[400px]" />
              <Skeleton className="h-[250px] md:h-[330px] w-[300px] md:w-[400px]" />
              <Skeleton className="h-[250px] md:h-[330px] w-[300px] md:w-[400px]" />
            </div>
          </div>
        </section>
      )}

      {/* 번역 완료 후 리뷰 표시 */}
      {!showReviewSkeleton && translatedReviews && translatedReviews.length > 0 && (
        <ReviewSection
          reviews={translatedReviews}
          isLoading={false}
        />
      )}

      {/* 리뷰 없음 */}
      {!showReviewSkeleton && (!translatedReviews || translatedReviews.length === 0) && (
        <section className="py-8 border-b-8 border-gray-50">
          <div className="px-4">
            <div className="text-sm text-gray-600">No reviews yet.</div>
          </div>
        </section>
      )}

      {/* Hospital Location */}
      <HospitalLocation hospitalInfo={hospital_info} />

      {/* Doctor List */}
      <HospitalDoctorList doctors={doctors} />
      <HospitalLanguageSupport available_language={hospital_details.available_languages}/>
      
              {/* Youtube Video */}
              {hospital_details.youtube && (
              <HospitalYouTubePreview youtube={hospital_details.youtube} />
              )}

      {/* <InstagramFeed feedId="bccc1448-efd4-4895-af05-a47a57c4531d" /> */}

      {/* Treatment Products */}
      {!isLoadingProducts && treatmentProducts.length > 0 && (
        <TreatmentProductList products={treatmentProducts} />
      )}

      {/* Hospital Amenities */}
      <HospitalAmenities hospitalDetails={hospital_details} />

      {/* Bottom Consultation Button */}
      <HospitalConsultationButton 
      hospitalId={hospital_info.id_uuid} 
      hospitalDetails={hospital_details}
      />
      
      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        images={hospital_info.imageurls || []}
      />
    </div>
  );
};

export default HospitalDetailNewDesign;
