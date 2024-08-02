import { fetchUtils } from "@/utils/fetch";
import {
  HospitalDetailInfoInputDto,
  HospitalDetailInfoOutDto,
} from "./info.dto";

export const getHospitalInfoAPI = async ({
  id,
}: HospitalDetailInfoInputDto): Promise<HospitalDetailInfoOutDto> => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/hospital/${id}/info`;

  const data = await fetchUtils<HospitalDetailInfoOutDto>({
    url,
  });

  return data ?? [];
};
