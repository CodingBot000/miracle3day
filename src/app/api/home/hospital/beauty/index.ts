import { fetchUtils } from "@/utils/fetch";
import { HospitalOutputDto } from "@/app/models/hospitalData.dto";

export const getHospitalBeautyAPI = async () => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/home/hospital/beauty`;

  const data = await fetchUtils<HospitalOutputDto>({ url });

  return data;
};
