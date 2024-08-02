import { fetchUtils } from "@/utils/fetch";
import { HospitalBeautyOutputDto } from "./hospital-beauty.dto";

export const getHospitalBeautyAPI = async () => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/home/hospital/beauty`;

  const data = await fetchUtils<HospitalBeautyOutputDto>({ url });

  return data;
};
