import { fetchUtils } from "@/utils/fetch";
import {
  HospitalLocationInputDto,
  HospitalLocationOutputDto,
} from "./hospital-location.dto";

export const getHospitalLocationAPI = async ({
  locationNum = "0",
}: HospitalLocationInputDto) => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/home/hospital/location?locationNum=${locationNum}`;

  const data = await fetchUtils<HospitalLocationOutputDto>({ url });

  return data ?? { data: [], total: 0 };
};
