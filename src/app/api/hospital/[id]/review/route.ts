import { createClient } from "@/utils/session/server";
import { LIMIT } from "./constant";
import { TABLE_HOSPITAL, TABLE_REVIEW, TABLE_MEMBERS } from "@/constants/tables";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id_uuid_hospital = params.id;

  const { searchParams } = new URL(req.url);
  // const pageParam = parseInt(searchParams.get("pageParam") as string);
  const pageParam = parseInt(searchParams.get("pageParam") || "0");
  const offset = pageParam * LIMIT;
  const limit = offset + LIMIT - 1;

  const backendClient = createClient();
  console.log("api/hospital/[id]/review/route.ts id_uuid_hospital:", id_uuid_hospital);


  try {
    // 1. 병원 정보 단일 조회
    const { data: hospitalData, error: hospitalError } = await backendClient
      .from(TABLE_HOSPITAL)
      .select("*")
      .eq('show', true)
      .eq("id_uuid", id_uuid_hospital)
      .single();
    console.log("api/hospital/[id]/review/route.ts hospitalData:", hospitalData);
    if (hospitalError) throw new Error(hospitalError.message);

    // 2. 해당 병원의 리뷰들 조회
    const { data: reviewDatas, count } = await backendClient
      .from(TABLE_REVIEW)
      .select("*", { count: "exact" })
      .eq("id_uuid_hospital", id_uuid_hospital)
      .range(offset, limit)
      .order("created_at", { ascending: true });
      console.log("api/hospital/[id]/review/route.ts reviewDatas:", reviewDatas);
    if (!reviewDatas || reviewDatas.length === 0) {
      return Response.json(
        {
          data: {
            hospitalData,
            reviewsWithMember: [],
          },
          nextCursor: false,
        },
        { status: 200 }
      );
    }

    // 3. 리뷰의 user_no 들만 뽑기
    // const userNos = [...new Set(reviewDatas.map((r) => r.user_no))]; // 중복 제거
    const userNos = Array.from(new Set(reviewDatas.map((r) => r.user_no)))

    // 4. user_no 기준 member 정보 조회
    const { data: memberDatas, error: memberError } = await backendClient
      .from(TABLE_MEMBERS)
      .select("*")
      .in("user_no", userNos);
console.log("api/hospital/[id]/review/route.ts memberDatas:", memberDatas);
    
    const isTestPassDespiteOfMemberError = true;
    if (memberError && !isTestPassDespiteOfMemberError) throw new Error(memberError.message);
    console.log("api/hospital/[id]/review/route.ts memberError:", memberError);
    // 5. 리뷰와 멤버 매칭
    const memberMap = new Map(memberDatas?.map((m) => [m.user_no, m]) || []);
    // 정상코드 
    // const reviewsWithMember = reviewDatas.map((r) => ({
    //   review: r,
    //   member: memberMap.get(r.user_no) || null,
    // }));

    // 테스트를 위하 일치 멤버 없어도  리뷰를 무조건 나오게 하는 임시코드 
    const reviewsWithMember = reviewDatas.map((r) => ({
      review: r,
      member: null, // member 매핑은 임시로 생략
    }));

    const nextCursor = count ? limit < count : false;

    console.log("============================================================================");
    console.log("api/hospital/[id]/review/route.ts final res ");
    console.log("api/hospital/[id]/review/route.ts final res  hospitalData :", hospitalData);
    console.log("api/hospital/[id]/review/route.ts final res reviewsWithMember :", reviewsWithMember);
    console.log("api/hospital/[id]/review/route.ts final res nextCursor :", nextCursor);
    console.log("============================================================================");

    return Response.json(
      {
        data: {
          hospitalData,
          reviewsWithMember,
        },
        nextCursor,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { status: 500, message: error.message },
        { status: 500 }
      );
    }
  }
}
