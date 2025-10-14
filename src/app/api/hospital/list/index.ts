import { fetchUtils } from "@/utils/fetch";
import { LocationEnum } from "@/constants";
import { HospitalByLocationInputDto, HospitalOutputDto,  } from "@/app/models/hospitalData.dto";


export const getHospitalListAPI = async () => {
// export const getHospitalListAPI = async  HospitalByLocationInputDto => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/hospital/list`;

  // 개발/프로덕션 환경별 캐시 정책
  const isDevelopment = process.env.NODE_ENV === 'development';
  const cacheControl = isDevelopment 
    ? 'no-cache' // 개발: 즉시 반영
    : 'public, max-age=300, stale-while-revalidate=600'; // 프로덕션: 5분 캐시

  const data = await fetchUtils<HospitalOutputDto>({
    url,
    fetchOptions: {
      cache: 'no-store',
      headers: {
        'Cache-Control': cacheControl,
      }
    }
  });
  return data ?? { data: [], total: 0 };
};
