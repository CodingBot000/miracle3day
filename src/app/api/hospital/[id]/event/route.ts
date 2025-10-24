import { NextResponse } from "next/server";
import { LIMIT } from "./constnat";
import { TABLE_EVENT } from "@/constants/tables";
import { q } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id_hospital = params.id;

  const { searchParams } = new URL(req.url);
  const pageParam = Number(searchParams.get("pageParam") ?? "0");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 0;

  const offset = page * LIMIT;

  try {
    const rows = await q(
      `SELECT * FROM ${TABLE_EVENT}
       WHERE id_uuid_hospital = $1
       ORDER BY created_at ASC
       LIMIT $2 OFFSET $3`,
      [id_hospital, LIMIT, offset]
    );

    const countRows = await q<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM ${TABLE_EVENT}
       WHERE id_uuid_hospital = $1`,
      [id_hospital]
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
