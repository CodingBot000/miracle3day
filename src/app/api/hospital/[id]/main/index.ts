import { fetchUtils } from "@/utils/fetch";
import {
  HospitalDetailMainInputDto,
  HospitalDetailMainOutput,
} from "./main.dto";
import { createClient } from "@/utils/supabase/server";

export const getHospitalMainAPI = async ({
  id,
}: HospitalDetailMainInputDto): Promise<HospitalDetailMainOutput> => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/hospital/${id}/main?uuid=${user?.id}`;

  const data = await fetchUtils<HospitalDetailMainOutput>({
    url,
    fetchOptions: {
      cache: "no-cache",
    },
  });

  return data;
};
