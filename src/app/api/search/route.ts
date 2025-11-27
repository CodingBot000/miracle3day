import { log } from '@/utils/logger';
import { NextResponse } from "next/server";
import { TABLE_EVENT, TABLE_HOSPITAL, TABLE_REVIEW } from "@/constants/tables";
import { q } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  try {
    const rawQ = q ?? "";
    const normalizedQ = rawQ.toLowerCase().replace(/\s/g, "").replace(/-/g, "");

    // 병렬 검색 실행
    const [hospitalRes, eventRes, reviewsRes] = await Promise.all([
      qQuery(
        `SELECT * FROM ${TABLE_HOSPITAL}
         WHERE show = true AND search_key ILIKE $1`,
        [`%${normalizedQ}%`]
      ),
      qQuery(
        `SELECT * FROM ${TABLE_EVENT}
         WHERE search_key ILIKE $1`,
        [`%${normalizedQ}%`]
      ),
      qQuery(
        `SELECT * FROM ${TABLE_REVIEW}
         WHERE search_key ILIKE $1`,
        [`%${normalizedQ}%`]
      ),
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

    log.debug("Search data:", combinedData);
    // return Response.json({ data: combined }, { status: 200 });
    return NextResponse.json({ data: combinedData }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ data: null }, { status: 500, statusText: error.message });
    }
  }
}

async function qQuery(sql: string, params: any[]) {
  try {
    const rows = await q(sql, params);
    return { data: rows, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
