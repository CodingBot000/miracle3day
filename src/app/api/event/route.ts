import { NextRequest, NextResponse } from "next/server";
import { TABLE_EVENT } from "@/constants/tables";
import { infinityParams } from "@/utils/inifinityQuery";
import { q } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const PAGE_SIZE = 6;
    const { offset } = infinityParams({ req, limits: PAGE_SIZE });
    const limitRows = PAGE_SIZE;

    const events = await q(
      `SELECT * FROM ${TABLE_EVENT} ORDER BY date_to ASC LIMIT $1 OFFSET $2`,
      [limitRows, offset]
    );

    const countRows = await q<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM ${TABLE_EVENT}`
    );
    const total = countRows[0]?.count ?? 0;

    const hasMore = total > offset + events.length;

    return NextResponse.json(
      {
        data: events,
        nextCursor: hasMore,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch events";
    console.error("GET /api/event error:", error);
    return NextResponse.json(
      { data: null, error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
