import { TABLE_DOCTOR, TABLE_HOSPITAL, TABLE_HOSPITAL_BUSINESS_HOUR, TABLE_HOSPITAL_DETAIL, TABLE_HOSPITAL_TREATMENT } from "@/constants/tables";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id_uuid = params.id;
  const supabase = createClient();
  console.log("qq api/hospital/[id]/info/route.ts", req);
  try {
    const { data: infoData, error: infoError, status, statusText } = await supabase
      .from(TABLE_HOSPITAL)
      .select(`*`)
      .match({ id_uuid: id_uuid });

    const { data: detailData, error: detailError } = await supabase
      .from(TABLE_HOSPITAL_DETAIL)
      .select(`*`)
      .match({ id_uuid_hospital: id_uuid });
      

      
      const { data: businessHourData, error: businessHourError } = await supabase
      .from(TABLE_HOSPITAL_BUSINESS_HOUR)
      .select(`*`)
      .match({ id_uuid_hospital: id_uuid });

      const { data: treatmentData, error: treatmentError } = await supabase
      .from(TABLE_HOSPITAL_TREATMENT)
      .select(`*`)
      .match({ id_uuid_hospital: id_uuid });
    
      const { data: doctorsData, error: doctorsError } = await supabase
      .from(TABLE_DOCTOR)
      .select(`*`)
  
      .match({ id_uuid_hospital: id_uuid });
    

    if (infoError || detailError || businessHourError || treatmentError || doctorsError) {
      return Response.json({ data: null }, { status, statusText });
    }

    return Response.json(
      {
        data: {
          // ...infoData[0],
          hospital_info: infoData[0],
          hospital_details: detailData[0],
          business_hours: businessHourData,
          treatments: treatmentData,
          
          doctors: doctorsData,
          // favorite: favoriteData,
      
        },
      },
      { status: 200, statusText: "success" }
    );
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
