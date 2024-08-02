import { fetchUtils } from "@/utils/fetch";
import {
  SurgeriesReviewInputDto,
  SurgeriesReviewOutputDto,
} from "./surgeries-review.dto";

export const getSurgeriesReviewAPI = async ({
  id,
  pageParam,
}: SurgeriesReviewInputDto): Promise<SurgeriesReviewOutputDto> => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/surgeries/${id}/review?pageParam=${pageParam}`;

  const data = await fetchUtils<SurgeriesReviewOutputDto>({
    url,
    fetchOptions: { cache: "no-cache" },
  });

  return data ?? [];
};
