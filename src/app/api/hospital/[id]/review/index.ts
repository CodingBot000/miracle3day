import { fetchUtils } from "@/utils/fetch";
import {
  HospitalDetailReviewInputDto,
  HospitalDetailReviewOutDto,
} from "@/app/models/reviewData.dto";

export const getHospitalReviewAPI = async ({
  id,
  pageParam = 0,
}: HospitalDetailReviewInputDto): Promise<HospitalDetailReviewOutDto> => {
  console.log("getHospitalReviewAPI id:", id);
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/hospital/${id}/review?pageParam=${pageParam}`;

  const data = await fetchUtils<HospitalDetailReviewOutDto>({ url });
  console.log("getHospitalReviewAPI data:", data);
  return data ?? { data: [], nextCursor: undefined };
};
