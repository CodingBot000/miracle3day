import { NextResponse, NextRequest } from "next/server";
import { q } from "@/lib/db";
import { TABLE_MEMBERS } from "@/constants/tables";
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ userInfo: null }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);

    if (!payload || payload.status !== 'active') {
      return NextResponse.json({ userInfo: null }, { status: 401 });
    }

    const member = await q(
      `SELECT * FROM ${TABLE_MEMBERS} WHERE id_uuid = $1 LIMIT 1`,
      [payload.sub]
    );

    if (!member.length) {
      return NextResponse.json({ userInfo: null }, { status: 404 });
    }

    const userInfo = {
      auth_user: {
        id: payload.sub,
        email: payload.email,
        imageUrl: payload.avatar,
      },
      ...member[0]
    };

    return NextResponse.json({ userInfo });
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
