import { fetchUtils } from "@/utils/fetch";
import { LocationEnum } from "@/constants";
import { HospitalByLocationInputDto, HospitalOutputDto,  } from "@/models/hospitalData.dto";

export const getHospitalLocationAPI = async ({
  locationNum = LocationEnum.Apgujung,
}: HospitalByLocationInputDto) => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/home/hospital/location/?locationNum=${locationNum}`;

  // 개발/프로덕션 환경별 캐시 정책
  const isDevelopment = process.env.NODE_ENV === 'development';
  const cacheControl = isDevelopment 
    ? 'no-cache' // 개발: 즉시 반영
    : 'public, max-age=300, stale-while-revalidate=600'; // 프로덕션: 5분 캐시

  const data = await fetchUtils<HospitalOutputDto>({
    url,
    fetchOptions: {
      headers: {
        'Cache-Control': cacheControl,
      }
    }
  });
  return data ?? { data: [], total: 0 };
};
