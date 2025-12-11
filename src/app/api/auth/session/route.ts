import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { one, q } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions) as any;

    // 세션에 auth 정보가 있으면 DB에서 검증 (DB를 source of truth로 사용)
    if (session.auth?.id_uuid) {
      // ✅ role도 함께 조회
      const member = await one(
        'SELECT id_uuid, role FROM members WHERE id_uuid = $1',
        [session.auth.id_uuid]
      );

      // DB에 해당 사용자가 없으면 세션 무효화 (방어 로직)
      if (!member) {
        console.warn(`[Session] User ${session.auth.id_uuid} not found in DB. Clearing session.`);
        session.destroy();
        return NextResponse.json({ auth: null });
      }

      // ✅ role이 hospital_admin이면 hospitalAccess 재조회
      if (member.role === 'hospital_admin') {
        const adminAccess = await q(
          `SELECT a.id_uuid_hospital, h.name_en as hospital_name
           FROM admin a
           LEFT JOIN hospitals h ON h.id = a.id_uuid_hospital
           WHERE $1 = ANY(a.authorized_ids)`,
          [session.auth.email]
        );

        session.auth.role = 'hospital_admin';
        session.auth.hospitalAccess = adminAccess.map((row: any) => ({
          hospital_id: row.id_uuid_hospital,
          hospital_name: row.hospital_name,
        }));
      } else {
        session.auth.role = member.role || 'user';
        session.auth.hospitalAccess = [];
      }

      // 세션 업데이트
      await session.save();
    }

    return NextResponse.json({ auth: session.auth || null });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ auth: null });
  }
}