import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { TABLE_SURGERY_INFO } from "@/constants/tables";

export async function GET(
  req: Request,
  { params }: { params: { id: number } }
) {
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ data: null, error: "Invalid surgery id" }, { status: 400 });
  }

  try {
    const rows = await q(
      `SELECT * FROM ${TABLE_SURGERY_INFO} WHERE id_unique = $1 LIMIT 1`,
      [id]
    );

    const data = rows[0] ?? null;

    if (!data) {
      return NextResponse.json({ data: null }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 500 }
      );
    }
  }
}
