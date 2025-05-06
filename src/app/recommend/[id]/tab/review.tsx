"use client";

import { getSurgeriesReviewAPI } from "@/app/api/surgeries/[id]/review";
import { ReviewCard } from "@/components/molecules/card";
import { InfinityItemList } from "@/components/template/InfinityItem";

const RecommendReview = () => {
  return (
    <InfinityItemList
      fetchFn={getSurgeriesReviewAPI}
      queryKey={"surgeries_reviews"}
    >
      {(item) =>
        item.data.map(({ id_unique, reviewimageurls, description, created_at }) => {
          return (
            <ReviewCard
              key={id_unique}
              src={reviewimageurls && reviewimageurls[0]}
              alt="thumbnail"
              content={description}
              id={"id"}
              name={"name"}
              created_at={created_at}
            />
          );
        })
      }
    </InfinityItemList>
  );
};

export default RecommendReview;
