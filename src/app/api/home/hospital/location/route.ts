import { TABLE_HOSPITAL } from "@/constants/tables";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = createClient();

  const { searchParams } = new URL(req.url);
  const locationNum = searchParams.get("locationNum");

  const { data = [], count } = await supabase
    .from(TABLE_HOSPITAL)
     .select(`
    created_at,
    name,
    name_en,
    searchkey,
    latitude,
    longitude,
    thumbnail_url,
    imageurls,
    id_surgeries,
    id_unique,
    id_uuid,
    location,
    address_full_road_en,
    address_full_jibun_en
  `,
      { count: "exact" })
    // .match({ location: locationNum })
    // .limit(9);

    
  console.log('API Route - locationNum:', locationNum);
  console.log('API Route - data sample:', data?.[0]);
  const response = {
    data,
    total: count,
  };

  return Response.json({ ...response });
}
