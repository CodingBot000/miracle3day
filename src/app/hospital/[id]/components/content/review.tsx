"use client";

import { getHospitalReviewAPI } from "@/app/api/hospital/[id]/review";
import { ReviewCard } from "@/components/molecules/card";
import { InfinityItemList } from "@/components/template/InfinityItem";

const ReviewTab = () => {
  return (
    <InfinityItemList
      fetchFn={getHospitalReviewAPI}
      queryKey={"surgeries_reviews"}
    >
      {(item) =>
        item.data.map(
          ({ id_unique, reviewimageurls, description, user, hospital }) => {
            return (
              <ReviewCard
                key={id_unique}
                src={reviewimageurls && reviewimageurls[0]}
                alt="thumbnail"
                content={description}
                id={user?.nickname || ""}
                name={hospital.name}
              />
            );
          }
        )
      }
    </InfinityItemList>
  );
};

export default ReviewTab;
