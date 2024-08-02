import { fetchUtils } from "@/utils/fetch";
import { BannerOutputDto } from "./banner.dto";

export const getBannerAPI = async (): Promise<BannerOutputDto> => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/home/banner`;

  const data = await fetchUtils<BannerOutputDto>({ url });

  return data ?? [];
};
