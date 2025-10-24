import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { q } from "@/lib/db";
import { TABLE_MEMBERS } from "@/constants/tables";

export async function GET(req: Request) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as any;
    
    if (!session.auth || session.auth.status !== 'active' || !session.auth.id_uuid) {
      return NextResponse.json({ userInfo: null }, { status: 401 });
    }

    const member = await q(
      `SELECT * FROM ${TABLE_MEMBERS} WHERE id_uuid = $1 LIMIT 1`,
      [session.auth.id_uuid]
    );

    if (!member.length) {
      return NextResponse.json({ userInfo: null }, { status: 404 });
    }

    const userInfo = {
      auth_user: {
        id: session.auth.id_uuid,
        email: session.auth.email,
        imageUrl: session.auth.avatar,
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
