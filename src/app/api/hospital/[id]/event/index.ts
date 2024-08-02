import { fetchUtils } from "@/utils/fetch";
import {
  HospitalDetailEventInputDto,
  HospitalDetailEventOutDto,
} from "./event.dto";

export const getHospitalEventAPI = async ({
  id,
  pageParam = 0,
}: HospitalDetailEventInputDto): Promise<HospitalDetailEventOutDto> => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/hospital/${id}/event?pageParam=${pageParam}`;

  const data = await fetchUtils<HospitalDetailEventOutDto>({ url });

  return data ?? { data: [], nextCursor: undefined };
};
