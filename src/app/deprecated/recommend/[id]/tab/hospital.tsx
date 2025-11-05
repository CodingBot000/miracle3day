// "use client";

// import { getSurgeriesHospitalAPI } from "@/app/api/surgeries/[id]/hospital";
// import { HospitalCard } from "@/components/molecules/card";
// import { InfinityItemList } from "@/components/template/InfinityItem";
// import { ROUTE } from "@/router";

// import styles from "../recommend-detail.module.scss";

// const RecommendHospital = () => {
//   return (
//     <InfinityItemList
//       fetchFn={getSurgeriesHospitalAPI}
//       queryKey={"surgeries_hospital"}
//       className={styles.custom}
//     >
//       {(item) =>
//         item.data.map(({ imageurls, name, id_unique, id }) => {
//           return (
//             <HospitalCard
//               key={id_unique}
//               name={name}
//               href={ROUTE.HOSPITAL_DETAIL("") + id}
//               src={imageurls && imageurls[0]}
//               alt={name}
//             />
//           );
//         })
//       }
//     </InfinityItemList>
//   );
// };

// export default RecommendHospital;
