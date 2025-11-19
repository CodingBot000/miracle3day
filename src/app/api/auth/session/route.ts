import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { one } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions) as any;

    // 세션에 auth 정보가 있으면 DB에서 검증 (DB를 source of truth로 사용)
    if (session.auth?.id_uuid) {
      const member = await one(
        'SELECT id_uuid FROM members WHERE id_uuid = $1',
        [session.auth.id_uuid]
      );

      // DB에 해당 사용자가 없으면 세션 무효화 (방어 로직)
      if (!member) {
        console.warn(`[Session] User ${session.auth.id_uuid} not found in DB. Clearing session.`);
        session.destroy();
        return NextResponse.json({ auth: null });
      }
    }

    return NextResponse.json({ auth: session.auth || null });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ auth: null });
  }
}