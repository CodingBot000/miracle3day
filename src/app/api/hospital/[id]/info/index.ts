import { log } from '@/utils/logger';
import { fetchUtils } from "@/utils/fetch";
import {
  HospitalDetailInfoInputDto,
  HospitalDetailInfoOutDto,
} from "@/models/hospitalData.dto";

export const getHospitalInfoAPI = async ({
  id,
}: HospitalDetailInfoInputDto): Promise<HospitalDetailInfoOutDto> => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/hospital/${id}/info`;
  log.debug("qq api/hospital/[id]/info/index getHospitalInfoAPI url", url);
  const data = await fetchUtils<HospitalDetailInfoOutDto>({
    url,
  });

  return data ?? [];
};
