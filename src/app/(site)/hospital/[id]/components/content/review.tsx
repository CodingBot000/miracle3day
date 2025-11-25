// "use client";

// import { getHospitalReviewListAPI } from "@/app/api/hospital/[id]/review";
// // import { HospitalDetailReviewOutDto } from "@/app/api/hospital/[id]/review/review";
// import { HospitalDetailReviewOutDto } from "@/app/models/reviewData.dto";
// import { ReviewCard } from "@/components/molecules/card";
// import { InfinityItemList } from "@/components/template/InfinityItemList";
// import { NoData } from "@/components/template/NoData";
// import { useEffect, useState } from "react";


// const ReviewTab = ({ id }: { id: string }) => {
//   log.debug("ReviewTab ReviewTab id (id_uuid_hospital):", id);
//   const [reviews, setReviews] = useState<HospitalDetailReviewOutDto["data"]>([]);

//   useEffect(() => {
//     if (!id) {
//       console.warn("ReviewTab: id is undefined, skipping fetch");
//       return;
//     }
    
//     const fetchReviews = async () => {
//       try {
//         log.debug("ReviewTab fetchReviews id:", id);
//         log.debug("ReviewTab call await getHospitalReviewListAPI");
//         const res = await getHospitalReviewListAPI({ id, pageParam: 0 });
//         // log.debug("getHospitalReviewAPI param id:", id);
//         // log.debug("getHospitalReviewAPI response:", res);
//         log.debug("ReviewTab fetchReviews res:", res);
//         setReviews(res.data);
//       } catch (error) {
//         console.error("ReviewTab Error fetching reviews:", error);
//       }
//     };
//     fetchReviews();
//   }, [id]);

//   log.debug("ReviewTab reviews:", reviews);
//   if (!reviews || reviews.length === 0) {
//     return <NoData label="No reviews found"/>;
//   }


//   return (
//     <div>
//       {/* 모바일: grid-cols-2 / 데스크탑: flex row scroll */}
//       <div className="grid grid-cols-2 gap-3 px-4 md:flex md:overflow-x-auto md:gap-4 md:px-2">
//         reviews
//         {/* {reviews.map((review) => (
//           <div
//             key={review.id_unique}
//             className="md:min-w-[280px] md:max-w-[280px] flex-shrink-0"
//           >
//             <ReviewCard
//               src={review.reviewimageurls?.[0]}
//               alt="thumbnail"
//               content={review.description}
//               id={review.user?.nickname || ""}
//               name={review.hospital.name}
//               created_at={review.created_at}
//             />
//           </div>
//         ))} */}
//       </div>
//     </div>
//   );
// };

// export default ReviewTab;


// // "use client";

// // import { getHospitalReviewAPI } from "@/app/api/hospital/[id]/review";
// // import { ReviewCard } from "@/components/molecules/card";
// // import { InfinityItemList } from "@/components/template/InfinityItem";


// // const ReviewTab = () => {
// //   return (
// //     <InfinityItemList
// //       fetchFn={getHospitalReviewAPI}
// //       queryKey={"surgeries_reviews"}
// //     >
// //       {(item) =>
// //         item.data.map(
// //           ({ id_unique, reviewimageurls, description, user, hospital, created_at }) => {
// //             return (
// //               <ReviewCard
// //                 key={id_unique}
// //                 src={reviewimageurls && reviewimageurls[0]}
// //                 alt="thumbnail"
// //                 content={description}
// //                 id={user?.nickname || ""}
// //                 name={hospital.name}
// //                 created_at={created_at}
// //               />
// //             );
// //           }
// //         )
// //       }
// //     </InfinityItemList>
// //   );
// // };

// // export default ReviewTab;
