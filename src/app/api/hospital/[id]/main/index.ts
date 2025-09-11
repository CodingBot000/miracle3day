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
  console.log(`getHospitalMainAPI id :${id}`);

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
  console.log("qq getHospitalMainAPI data", data);
  // console.log("qq getHospitalMainAPI data.hospital_info", data.hospital_info);
  // console.log("qq getHospitalMainAPI data.hospital_info.imageurls", data.hospital_info.imageurls);
  // console.log("qq getHospitalMainAPI data.hospital_info.name", data.hospital_info.name);
  return data;
};
