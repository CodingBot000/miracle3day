import { NextResponse } from "next/server";
import { LIMIT } from "./constant";
import { TABLE_BANNER_ITEM, TABLE_REVIEW } from "@/constants/tables";
import { q } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const bannerId = Number(params.id);

  const { searchParams } = new URL(req.url);
  const pageParam = Number(searchParams.get("pageParam") ?? "0");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 0;
  const offset = page * LIMIT;

  try {
    if (!Number.isFinite(bannerId)) {
      return NextResponse.json({ data: [], nextCursor: false }, { status: 400 });
    }

    const bannerRows = await q<{ id_surgeries: (string | number)[] | null }>(
      `SELECT id_surgeries FROM ${TABLE_BANNER_ITEM} WHERE id = $1 LIMIT 1`,
      [bannerId]
    );

    const surgeriesIds = bannerRows[0]?.id_surgeries ?? [];

    if (!surgeriesIds) {
      return NextResponse.json({ data: [], nextCursor: false }, { status: 200 });
    }

    const surgeryIdsText = surgeriesIds.map((id) => String(id));

    const rows = await q(
      `SELECT * FROM ${TABLE_REVIEW}
       WHERE id_surgeries && $1::text[]
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [surgeryIdsText, LIMIT, offset]
    );

    const countRows = await q<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM ${TABLE_REVIEW}
       WHERE id_surgeries && $1::text[]`,
      [surgeryIdsText]
    );

    const total = countRows[0]?.count ?? 0;
    const nextCursor = (page + 1) * LIMIT < total;

    return NextResponse.json({ data: rows, nextCursor }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
