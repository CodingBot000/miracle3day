import { fetchUtils } from "@/utils/fetch";
import {
  HospitalDetailReviewInputDto,
  HospitalDetailReviewOutDto,
} from "@/app/models/reviewData.dto";

// 병원기준 Review라 여기서 나오는 모든 리뷰는 병원이 동일하다 
export const getHospitalReviewListByHospitalIdAPI = async ({
  id,
  pageParam = 0,
}: HospitalDetailReviewInputDto): Promise<HospitalDetailReviewOutDto> => {
  console.log("getHospitalReviewListAPI id:", id); // id_uuid_hospital
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/hospital/${id}/review?pageParam=${pageParam}`;

  const data = await fetchUtils<HospitalDetailReviewOutDto>({ url });
  console.log("getHospitalReviewListAPI data:", data);
  return data ?? { data: [], nextCursor: undefined };
};
