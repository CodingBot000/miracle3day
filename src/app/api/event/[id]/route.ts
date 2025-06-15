import { TABLE_HOSPITAL, TABLE_EVENT } from "@/constants/tables";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const id_unique = params.id;
  console.log(`qq qq event/[id]/route.ts id_unique = id:${id_unique}`);
  
  try {
    const { data: eventData, error, status, statusText } = await supabase
      .from(TABLE_EVENT)
      .select("*", { count: "exact" })
      .match({ id_unique: id_unique })
      .order("created_at", { ascending: true });

    console.log(`qq qq event/[id]/route.ts table event data:${eventData}`);

    if (!eventData || error) {
      return Response.json({ eventData: null }, { status, statusText });
    }

    // const getSurgery = await supabase
    //   .from("surgery_info")
    //   .select("*")
    //   .in("id_unique", data[0].id_surgeries);

    // event 테이블의 id_uuid_hospital(어떤 병원의 이벤트인지 구분) 와 hospital 테이블의 id_uuid 를 매칭하여 hospital 테이블의 데이터를 가져옴
    // 이 hospital 데이터는 이벤트 아래 병원정보를 표기하기 위함
    const getHospital = await supabase
      .from(TABLE_HOSPITAL)
      .select("*")
      .eq("id_uuid", eventData[0].id_uuid_hospital);
      // .match({ id_uuid: eventData[0].id_uuid_hospital });
   
    // const getSurgeryInfos
    //   .from(TABLE_SURGERY_INFO)
    //   .select("*")
    //   .in("id_unique", eventData[0].id_surgeries);
      
      
    console.log(`qq qq event/[id]/route.ts getHospital.data[0]:${getHospital.data?.[0].id_uuid}`);
    console.log(`qq qq event/[id]/route.ts getHospital.data[0].id_uuid_hospital:${getHospital.data?.[0].id_uuid}`);
    console.log(`qq qq event/[id]/route.ts getHospital.data[0].id_surgeries:${getHospital.data?.[0].id_surgeries}`);
    if (!getHospital.data) return;

    const updatedData = eventData.map((e) => {
      return {
        ...e,
        id_surgeries: getHospital.data[0].id_surgeries,
        hospitalData: getHospital.data[0],
      };
    });

    return Response.json({ data: updatedData }, { status, statusText });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
