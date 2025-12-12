import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { q, one, pool } from "@/lib/db";

interface SessionAuth {
  id_uuid?: string;
  email?: string;
  role?: 'user' | 'hospital_admin' | 'super_admin';
  hospitalAccess?: { hospital_id: string; hospital_name?: string }[];
}

async function getAdminSession(req: Request): Promise<{ auth: SessionAuth | null; hospitalId: string | null }> {
  try {
    const session = await getIronSession(req, new Response(), sessionOptions) as any;

    if (!session.auth || session.auth.role !== 'hospital_admin') {
      return { auth: null, hospitalId: null };
    }

    const hospitalId = session.auth.hospitalAccess?.[0]?.hospital_id || null;
    return { auth: session.auth, hospitalId };
  } catch (error) {
    console.error('[AuthorizedAccounts] Session error:', error);
    return { auth: null, hospitalId: null };
  }
}

/**
 * GET - 계정 목록 조회
 */
export async function GET(req: NextRequest) {
  try {
    const { auth, hospitalId } = await getAdminSession(req);

    if (!auth || !hospitalId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // authorized_ids 조회
    const adminRow = await one<{ authorized_ids: string[] }>(
      `SELECT authorized_ids FROM admin WHERE id_uuid_hospital = $1`,
      [hospitalId]
    );

    if (!adminRow || !adminRow.authorized_ids || adminRow.authorized_ids.length === 0) {
      return NextResponse.json({ accounts: [] });
    }

    const authorizedIds = adminRow.authorized_ids;

    // 각 계정 정보 조회
    const members = await q<{
      email: string;
      role: string;
      start_screen: string | null;
      is_valid: boolean;
    }>(
      `SELECT
        email,
        role,
        preferences->>'app_start_screen' as start_screen,
        CASE WHEN id_uuid IS NOT NULL THEN true ELSE false END as is_valid
      FROM members
      WHERE email = ANY($1::text[])`,
      [authorizedIds]
    );

    // authorized_ids 기준으로 결과 매핑 (DB에 없는 계정도 포함)
    const accounts = authorizedIds.map(email => {
      const member = members.find(m => m.email === email);
      return {
        email,
        startScreen: member?.start_screen || 'admin',
        isValid: !!member,
        role: member?.role || null,
      };
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("[AuthorizedAccounts GET] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST - 계정 추가
 */
export async function POST(req: NextRequest) {
  try {
    const { auth, hospitalId } = await getAdminSession(req);

    if (!auth || !hospitalId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // members 테이블에서 계정 존재 확인
    const member = await one<{ id_uuid: string }>(
      `SELECT id_uuid FROM members WHERE email = $1`,
      [email]
    );

    if (!member) {
      return NextResponse.json({ error: "Only registered accounts can be added" }, { status: 400 });
    }

    // 중복 확인
    const adminRow = await one<{ authorized_ids: string[] }>(
      `SELECT authorized_ids FROM admin WHERE id_uuid_hospital = $1`,
      [hospitalId]
    );

    if (adminRow?.authorized_ids?.includes(email)) {
      return NextResponse.json({ error: "Account already registered" }, { status: 400 });
    }

    // 트랜잭션으로 처리
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // admin.authorized_ids에 추가
      await client.query(
        `UPDATE admin
         SET authorized_ids = array_append(COALESCE(authorized_ids, ARRAY[]::text[]), $1)
         WHERE id_uuid_hospital = $2`,
        [email, hospitalId]
      );

      // members.role = 'hospital_admin', preferences.app_start_screen = 'admin'
      await client.query(
        `UPDATE members
         SET
           role = 'hospital_admin',
           preferences = jsonb_set(
             COALESCE(preferences, '{}'::jsonb),
             '{app_start_screen}',
             '"admin"'
           )
         WHERE email = $1`,
        [email]
      );

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (txError) {
      await client.query('ROLLBACK');
      throw txError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("[AuthorizedAccounts POST] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE - 계정 삭제
 */
export async function DELETE(req: NextRequest) {
  try {
    const { auth, hospitalId } = await getAdminSession(req);

    if (!auth || !hospitalId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 트랜잭션으로 처리
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // admin.authorized_ids에서 제거
      await client.query(
        `UPDATE admin
         SET authorized_ids = array_remove(authorized_ids, $1)
         WHERE id_uuid_hospital = $2`,
        [email, hospitalId]
      );

      // members.role = 'user', preferences.app_start_screen = 'user'
      await client.query(
        `UPDATE members
         SET
           role = 'user',
           preferences = jsonb_set(
             COALESCE(preferences, '{}'::jsonb),
             '{app_start_screen}',
             '"user"'
           )
         WHERE email = $1`,
        [email]
      );

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (txError) {
      await client.query('ROLLBACK');
      console.error("[AuthorizedAccounts DELETE] Transaction error:", txError);
      return NextResponse.json({ error: "Failed to delete account. Please try again." }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("[AuthorizedAccounts DELETE] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * PUT - 시작 화면 변경
 */
export async function PUT(req: NextRequest) {
  try {
    const { auth, hospitalId } = await getAdminSession(req);

    if (!auth || !hospitalId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, startScreen } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!startScreen || !['admin', 'user'].includes(startScreen)) {
      return NextResponse.json({ error: "Invalid startScreen value" }, { status: 400 });
    }

    // 계정 유효성 확인
    const member = await one<{ id_uuid: string }>(
      `SELECT id_uuid FROM members WHERE email = $1`,
      [email]
    );

    if (!member) {
      return NextResponse.json({ error: "Account is not valid" }, { status: 400 });
    }

    // 시작 화면 변경
    await q(
      `UPDATE members
       SET preferences = jsonb_set(
         COALESCE(preferences, '{}'::jsonb),
         '{app_start_screen}',
         $1::jsonb
       )
       WHERE email = $2`,
      [JSON.stringify(startScreen), email]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AuthorizedAccounts PUT] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
