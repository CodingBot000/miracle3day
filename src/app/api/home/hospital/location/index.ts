import { fetchUtils } from "@/utils/fetch";
import {
  HospitalLocationInputDto,
  HospitalLocationOutputDto,
} from "./hospital-location.dto";
import { LocationEnum } from "@/constants";

export const getHospitalLocationAPI = async ({
  locationNum = LocationEnum.Apgujung,
}: HospitalLocationInputDto) => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/home/hospital/location?locationNum=${locationNum}`;

  // const data = await fetchUtils<HospitalLocationOutputDto>({ url });
  const data = await fetchUtils<HospitalLocationOutputDto>({
    url,
    fetchOptions: {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      }
    }
  });
  return data ?? { data: [], total: 0 };
};
