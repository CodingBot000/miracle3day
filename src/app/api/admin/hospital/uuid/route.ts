import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { TABLE_HOSPITAL_PREPARE } from "@/constants/tables";

export async function POST(req: NextRequest) {
  try {
    const { userUid } = await req.json();

    if (!userUid || typeof userUid !== "string") {
      return NextResponse.json(
        { error: "userUid is required" },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `SELECT id_uuid FROM ${TABLE_HOSPITAL_PREPARE} WHERE id_uuid_admin = $1 LIMIT 1`,
      [userUid]
    );

    const hospitalUuid = rows[0]?.id_uuid ?? null;

    return NextResponse.json({ hospitalUuid }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API admin/hospital/uuid] error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
