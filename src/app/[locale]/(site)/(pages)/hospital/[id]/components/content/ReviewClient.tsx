"use client";

import { log } from '@/utils/logger';


import { getHospitalReviewListByHospitalIdAPI } from "@/app/api/hospital/[id]/review";
// import { HospitalDetailReviewOutDto } from "@/app/api/hospital/[id]/review/review";
import { HospitalDetailReviewOutDto } from "@/models/reviewData.dto";
import { ReviewCard } from "@/components/molecules/card";
import { InfinityItemList } from "@/components/template/InfinityItemList";
import { NoData } from "@/components/template/NoData";
import { useEffect, useState } from "react";


// const ReviewClient = ({ id }: { id: string }) => {
export default function ReviewClient({ id }: { id: string })  {    
  log.debug("ReviewClient ReviewClient id (id_uuid_hospital):", id);
  const [reviews, setReviews] = useState<HospitalDetailReviewOutDto["data"]>();

  useEffect(() => {
    if (!id) {
      console.warn("ReviewClient: id is undefined, skipping fetch");
      return;
    }
    
    const fetchReviews = async () => {
      try {
        log.debug("ReviewClient fetchReviews id:", id);
        log.debug("ReviewClient call await getHospitalReviewListAPI");
        // 병원기준 Review라 여기서 나오는 모든 리뷰는 병원이 동일하다 
        const res = await getHospitalReviewListByHospitalIdAPI({ id, pageParam: 0 });
        // log.debug("getHospitalReviewAPI param id:", id);
        // log.debug("getHospitalReviewAPI response:", res);
        log.debug("ReviewClient fetchReviews res:", res);
        setReviews(res.data);
      } catch (error) {
        console.error("ReviewClient Error fetching reviews:", error);
      }    };
    fetchReviews();
  }, [id]);
  
  log.debug("ReviewClient reviews:", reviews);
  if (!reviews || !reviews.reviewsWithMember || reviews.reviewsWithMember.length === 0) {
    return <NoData label="No reviews found"/>;
  }

  return (
    <div>
      {/* 모바일: grid-cols-2 / 데스크탑: flex row scroll */}
      <div className="grid grid-cols-2 gap-3 px-4 md:flex md:overflow-x-auto md:gap-4 md:px-2">
    
        {reviews.reviewsWithMember.map((reviewWithMember) => (
          <div
            key={reviewWithMember.review.id_unique}
            className="md:min-w-[280px] md:max-w-[280px] flex-shrink-0"
          >
            <ReviewCard
              src={reviewWithMember.review.reviewimageurls?.[0]}
              alt="thumbnail"
              content={reviewWithMember.review.description}
              id={reviewWithMember.member?.nickname || ""}
              name={reviews.hospitalData?.name || ""}
              created_at={reviewWithMember.review.created_at}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
