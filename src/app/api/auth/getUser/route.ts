import { NextResponse } from "next/server";
import { getUserInfo } from "./user.service";
import { TABLE_MEMBERS } from "@/constants/tables";
import { q } from "@/lib/db";

export async function GET() {
  try {
    const result = await getUserInfo();
    
    if (!result) {
      return NextResponse.json({ userInfo: null }, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/auth/getUser error:', error);
    return NextResponse.json(
      { userInfo: null, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ user: null, error: "Email required" }, { status: 400 });
    }

    const rows = await q(
      `SELECT * FROM ${TABLE_MEMBERS} WHERE email = $1 LIMIT 1`,
      [email]
    );

    return NextResponse.json({ user: rows[0] ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch user";
    console.error("POST /api/auth/getUser error:", error);
    return NextResponse.json({ user: null, error: message }, { status: 500 });
  }
}
