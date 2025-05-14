import { fetchUtils } from "@/utils/fetch";
import {
  LocationDetailInputDto,
  LocationDetailOutputDto,
} from "./location.dto";

export const getLocationDetailAPI = async ({
  id,
  pageParam,
}: LocationDetailInputDto): Promise<LocationDetailOutputDto> => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/location/${id}?pageParam=${pageParam}`;

  const data = await fetchUtils<LocationDetailOutputDto>({
    url,
  });
  console.log('qq qq LocationDetailAPI url: ', url);
  console.log('qq qq LocationDetailAPI: ', data);
  return data ?? [];
};
