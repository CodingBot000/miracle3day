import { TABLE_EVENT, TABLE_HOSPITAL, TABLE_REVIEW } from "@/constants/tables";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  const supabase = createClient();

  try {
    const rawQ = q ?? "";
    const normalizedQ = rawQ.toLowerCase().replace(/\s/g, "").replace(/-/g, "");

    // 병렬 검색 실행
    const [hospitalRes, eventRes, reviewsRes] = await Promise.all([
      supabase
        .from(TABLE_HOSPITAL)
        .select("*")
        .eq('show', true)
        .ilike("search_key", `%${normalizedQ}%`),

      supabase
        .from(TABLE_EVENT)
        .select("*")
        .ilike("search_key", `%${normalizedQ}%`),

      supabase
        .from(TABLE_REVIEW)
        .select("*")
        .ilike("search_key", `%${normalizedQ}%`),
    ]);

    // 각각에 source 태그 붙이기
    const hospitalData = (hospitalRes.data ?? []).map(item => ({
      ...item,
      source: TABLE_HOSPITAL,
    }));

    const eventData = (eventRes.data ?? []).map(item => ({
      ...item,
      source: TABLE_EVENT,
    }));

    const reviewsData = (reviewsRes.data ?? []).map(item => ({
      ...item,
      source: TABLE_REVIEW,
    }));

    // const combined = [...hospitalData, ...eventData, ...reviewsData];
    const combinedData = {
      hospitals: hospitalData,
      events: eventData,
      reviews: reviewsData,
    };

    const errors = [hospitalRes.error, eventRes.error, reviewsRes.error].filter(Boolean);
    if (errors.length > 0) {
      console.error("Search errors:", errors.map(e => e?.message));
      return Response.json({ data: null }, { status: 500, statusText: "Search failed" });
    }

    console.log("Search data:", combinedData);
    // return Response.json({ data: combined }, { status: 200 });
    return Response.json({ data: combinedData }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ data: null }, { status: 500, statusText: error.message });
    }
  }
}
