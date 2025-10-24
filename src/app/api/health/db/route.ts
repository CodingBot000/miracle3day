import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query("SELECT NOW() as now");
    return NextResponse.json({ ok: true, now: rows[0].now });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "DB connection failed" }, { status: 500 });
  }
}
