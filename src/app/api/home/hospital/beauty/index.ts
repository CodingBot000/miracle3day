import { fetchUtils } from "@/utils/fetch";
import { HospitalOutputDto } from "@/app/models/hospitalData.dto";

const buildApiUrl = (path: string) => {
  const base = process.env.NEXT_PUBLIC_API_ROUTE?.replace(/\/$/, "") ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};

export const getHospitalBeautyAPI = async () => {
  const url = buildApiUrl("/api/home/hospital/beauty");

  const data = await fetchUtils<HospitalOutputDto>({ url });

  return data;
};
