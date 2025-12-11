import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { NextResponse } from "next/server";
import { q, one } from "@/lib/db";

// 설정 조회
export async function GET(req: Request) {
  try {
    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions) as any;

    if (!session.auth?.id_uuid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await one(
      'SELECT preferences FROM members WHERE id_uuid = $1',
      [session.auth.id_uuid]
    );

    return NextResponse.json({
      preferences: result?.preferences || {
        app_start_screen: 'user',
        language: null,
        notifications: {
          push: true,
          email: true
        }
      }
    });
  } catch (error) {
    console.error('GET /api/user/preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 설정 저장 (부분 업데이트 지원)
export async function PUT(req: Request) {
  try {
    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions) as any;

    if (!session.auth?.id_uuid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { preferences } = await req.json();

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json({ error: 'Invalid preferences' }, { status: 400 });
    }

    // 기존 preferences와 병합 (부분 업데이트 지원)
    await q(
      `UPDATE members
       SET preferences = COALESCE(preferences, '{}'::jsonb) || $1::jsonb,
           updated_at = NOW()
       WHERE id_uuid = $2`,
      [JSON.stringify(preferences), session.auth.id_uuid]
    );

    console.log(`[Preferences] Updated for user ${session.auth.id_uuid}:`, preferences);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/user/preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
