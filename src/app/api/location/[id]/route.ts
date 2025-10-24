import { NextResponse } from "next/server";
import { LIMIT } from "./constant";
import { LOCATIONS } from "@/constants";
import { TABLE_HOSPITAL } from "@/constants/tables";
import { q } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const locationKey = LOCATIONS.find(
      (loc) => loc.toLowerCase() === params.id.toLowerCase()
    );

    if (!locationKey) {
      return NextResponse.json({ data: [] }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const pageParam = Number(searchParams.get("pageParam") ?? "0");
    const page = Number.isFinite(pageParam) && pageParam >= 0 ? pageParam : 0;

    const offset = page * LIMIT;

    const rows = await q(
      `
        SELECT id_unique, imageurls, name
        FROM ${TABLE_HOSPITAL}
        WHERE show = true AND location = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [locationKey, LIMIT, offset]
    );

    const totals = await q<{ count: number }>(
      `
        SELECT COUNT(*)::int AS count
        FROM ${TABLE_HOSPITAL}
        WHERE show = true AND location = $1
      `,
      [locationKey]
    );

    const total = totals[0]?.count ?? 0;
    const nextCursor = total > offset + rows.length;

    return NextResponse.json(
      { data: rows, nextCursor },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch location hospitals";
    console.error("GET /api/location/[id] error:", error);
    return NextResponse.json(
      { data: null, error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
