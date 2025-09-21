import { TABLE_HOSPITAL } from "@/constants/tables";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();

  try {
    const { data } = await supabase
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
  `)
      .eq('show', true)
      // .order("created_at", { ascending: false })
      .limit(4);

      
       
      console.log(`src/app/api/home/hospital/beauty/route data ===>  ${data}`);
      console.log("=== Hospital Beauty TABLE_HOSPITAL datas ===");
      data?.forEach((item, index) => {
        console.log(`\n[Item ${index + 1}]`);
        console.log("id_uuid:", item.id_uuid);
        console.log("Name:", item.name);
        console.log("Name_en:", item.name_en);
        console.log("Image URLs:", item.imageurls);
        console.log("show:", item.show);
        console.log("location:", item.location);
        console.log("------------------------");
      });
      console.log("=== End of Hospital Beauty Data ===");
      
    return Response.json({ data }, { status: 200, statusText: "success" });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
