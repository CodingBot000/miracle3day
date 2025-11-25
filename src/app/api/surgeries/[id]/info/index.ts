import { fetchUtils } from "@/utils/fetch";
import {
  ProceduresInputDto,
  ProceduresOutputDto,
} from "./procedure-info.dto";

export const getProcedureInfoAPI = async ({
  id_unique
}: ProceduresInputDto): Promise<ProceduresOutputDto> => {
  
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/surgeries/${id_unique}/info`;
  // log.debug('getProcedureInfoAPI url:', url)
  const data = await fetchUtils<ProceduresOutputDto>({
    url,
    fetchOptions: { cache: "no-cache" },
  });
  
  return data ?? [];
};
