import { TABLE_HOSPITAL } from "@/constants/tables";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = createClient();

  const { searchParams } = new URL(req.url);
  const locationNum = searchParams.get("locationNum");

  try {
    const { data = [], count, error } = await supabase
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
      address_full_jibun_en,
      show
    `,
        { count: "exact" })
      .eq('show', true)
      // .match({ location: locationNum })
      // .limit(9);

    const response = {
      data,
      total: count,
    };

    return Response.json(response, { status: 200, statusText: "success" });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: [], total: 0 },
        { status: 500, statusText: error.message }
      );
    }
  }
}
