import { fetchUtils } from "@/utils/fetch";
import { LocationEnum } from "@/constants";
import { HospitalByLocationInputDto, HospitalOutputDto,  } from "@/app/models/hospitalData.dto";

export const getHospitalLocationAPI = async ({
  locationNum = LocationEnum.Apgujung,
}: HospitalByLocationInputDto) => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/home/hospital/location?locationNum=${locationNum}`;

  // const data = await fetchUtils<HospitalLocationOutputDto>({ url });
  const data = await fetchUtils<HospitalOutputDto>({
    url,
    fetchOptions: {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      }
    }
  });
  return data ?? { data: [], total: 0 };
};
