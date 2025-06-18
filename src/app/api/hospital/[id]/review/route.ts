import { createClient } from "@/utils/supabase/server";
import { LIMIT } from "./constant";
import { TABLE_HOSPITAL, TABLE_REVIEW, TABLE_MEMBERS } from "@/constants/tables";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id_uuid_hospital = params.id;

  const { searchParams } = new URL(req.url);
  const pageParam = parseInt(searchParams.get("pageParam") as string);

  const offset = pageParam * LIMIT;
  const limit = offset + LIMIT - 1;

  const supabase = createClient();
  console.log("api/hospital/[id]/review/route.ts id_uuid_hospital:", id_uuid_hospital);
  try {
    // const { data, count, error, status, statusText } = await supabase
    //   .from(TABLE_REVIEW)
    //   .select("*, hospital ( name ), user ( nickname )", { count: "exact" })
    //   // .match({ id_uuid_hospital: id_hospital })
    //   .eq( "id_uuid_hospital", id_hospital )
    //   .range(offset, limit)
    //   .order("created_at", { ascending: true });
      

    const { data: reviewData, count, error, status, statusText } = await supabase
    .from(TABLE_REVIEW)
    .select("*", { count: "exact" })
    // .match({ id_uuid_hospital: id_hospital })
    .match({ id_uuid_hospital: id_uuid_hospital})
    .range(offset, limit)
    .order("created_at", { ascending: true });
    

    const { data: hospitalData, error: hospitalError, status: hospitalStatus, statusText: hospitalStatusText } = await supabase
    .from(TABLE_HOSPITAL)
    .select("*")
    // .match({ id_uuid_hospital: id_hospital })
    .eq( "id_uuid_hospital", id_uuid_hospital );
      
    const { data: userData, error: userError, status: userStatus, statusText: userStatusText } = await supabase
    .from(TABLE_MEMBERS)
    .select("*")
    // .match({ id_uuid_hospital: id_hospital })
    .match( { user_no : hospitalData?.[0]?.user_no } );
      

      console.log("api/hospital/[id]/review/route.ts data:", {
        reviewData: reviewData,
        hospitalData: hospitalData,
        userData: userData,
      });
      console.log("api/hospital/[id]/review/route.ts error:", error);

    if (!reviewData || reviewData?.length === 0) {
      return Response.json(
        {
          data: {
            reviewData: [],
            // hospitalData: hospitalData || [], // 필요시 주석 해제
            // userData: userData || [], // 필요시 주석 해제 
          },
        },
        { status: 200, statusText: "success" }
      );
    }

    if (error) {
      // return Response.json({ status, statusText });
      return Response.json(
        {
          data: {
            // ...infoData[0],
            reviewData: reviewData,
            hospitalData: hospitalData,
            userData: userData,
            
    
          },
        },
        { status: 200, statusText: "success" }
      );
    }

    const nextCursor = count && limit < count;
    
    // return Response.json({ data, nextCursor }, { status, statusText });
    return Response.json({ 
      data: {
        // ...infoData[0],
        reviewData: reviewData,
        hospitalData: hospitalData,
        userData: userData,
        
  
      },
      nextCursor }, { status, statusText });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ status: 500, statusText: error.message });
    }
  }
}
