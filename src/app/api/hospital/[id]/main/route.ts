import { TABLE_DOCTOR, TABLE_HOSPITAL, TABLE_HOSPITAL_BUSINESS_HOUR, TABLE_HOSPITAL_DETAIL, TABLE_HOSPITAL_TREATMENT } from "@/constants/tables";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id_uuid = params.id;
  const supabase = createClient();
  
  const { searchParams } = new URL(req.url);
  console.log("hospital/[id]/main/route.ts id_uuid:", id_uuid);
  console.log("hospital/[id]/main/route.ts params:", params);
  console.log("hospital/[id]/main/route.ts req:", req);
  console.log("hospital/[id]/main/route.ts searchParams:", searchParams);
  const userId = searchParams.get("uuid") as string;
  console.log("hospital/[id]/main/route.ts uuid:", userId);
  try {
    const {
      data: hospitalData,
      error,
      status,
      statusText,
    } = await supabase
      .from(TABLE_HOSPITAL)
      .select(`*`)
      .match({ id_uuid: id_uuid });
      console.log("hospitalData select table ", hospitalData);
    const { data: detailData, error: detailError } = await supabase
      .from(TABLE_HOSPITAL_DETAIL)
      .select(`*`)

      .match({ id_uuid_hospital: id_uuid });
console.log("hospital detailData select table ", detailData);


const { data: businessHourData, error: businessHourError } = await supabase
.from(TABLE_HOSPITAL_BUSINESS_HOUR)
.select(`*`)
.match({ id_uuid_hospital: id_uuid });

console.log("hospital businessHourData select table ", businessHourData);

const { data: treatmentData, error: treatmentError } = await supabase
.from(TABLE_HOSPITAL_TREATMENT)
.select(`*`)
.match({ id_uuid_hospital: id_uuid });

console.log("hospital treatmentData select table ", treatmentData);

const { data: doctorsData, error: doctorsError } = await supabase
.from(TABLE_DOCTOR)
.select(`*`)

.match({ id_uuid_hospital: id_uuid });

console.log("hospital doctorsData select table ", doctorsData);



    // if (error || detailError) {
    if (error || detailError || businessHourError || treatmentError || doctorsError) {
      return Response.json({ data: null }, { status, statusText });
    }

    // uuid 없다는건 user가 login을 안했다는 의미 
    if (!userId || userId === "undefined") {
      console.log("hospital data select uuid error uuid:", userId);
      const data = {
        // ...hospitalData[0],
        hospital_info: hospitalData[0],
        favorite: [],
        hospital_details: detailData[0],
        business_hours: businessHourData,
        treatments: treatmentData,
        doctors: doctorsData,
      };

      return Response.json(data, { status: 200, statusText: "success" });
    }

    const { data: favoriteData, error: favoriteError } = await supabase
      .from("favorite")
      .select("*")
      .eq("uuid", userId)
      .eq("id_uuid_hospital", id_uuid);

    if (favoriteError) {
      return Response.json({ data: null }, { status, statusText });
    }

    const data = {
      // ...hospitalData[0],
      // hospital_info: hospitalData[0],
      favorite: favoriteData,
      // hospital_details: detailData[0],
      hospital_info: hospitalData[0],
      hospital_details: detailData[0],
      business_hours: businessHourData,
      treatments: treatmentData,
      
      doctors: doctorsData,
    };

    return Response.json(data, { status: 200, statusText: "success" });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
