import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { readAccessToken, readAdminSession } from "@/lib/auth/jwt";

export async function GET() {
  console.log('[API /auth/me] 세션 확인 요청');

  // 통합 JWT 우선, 기존 Admin JWT 호환
  const accessToken = await readAccessToken();
  const oldAdminSession = await readAdminSession();

  const session = accessToken || oldAdminSession;

  console.log('[API /auth/me] 세션 데이터:', session);

  if (!session) {
    console.log('[API /auth/me] ❌ 세션 없음 - 401 반환');
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Admin 테이블에서 id_uuid_hospital 조회
  try {
    const { rows } = await pool.query(
      `SELECT id, email, id_uuid_hospital FROM admin WHERE id = $1`,
      [session.sub]
    );

    console.log('[API /auth/me] DB 조회 결과:', rows);

    if (rows.length === 0) {
      console.log('[API /auth/me] ❌ Admin 테이블에 사용자 없음');
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const admin = rows[0];

    const userData = {
      id: admin.id,
      email: admin.email,
      id_uuid_hospital: admin.id_uuid_hospital || null,
    };

    console.log('[API /auth/me] ✅ 세션 확인 성공 (id_uuid_hospital 포함):', userData);

    return NextResponse.json({
      ok: true,
      user: userData,
    });
  } catch (error) {
    console.error('[API /auth/me] ❌ DB 조회 오류:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}