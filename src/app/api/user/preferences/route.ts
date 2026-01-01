import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from "@/lib/auth/jwt";
import { q, one } from "@/lib/db";

// 설정 조회
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);

    if (!payload || payload.status !== 'active') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await one(
      'SELECT preferences FROM members WHERE id_uuid = $1',
      [payload.sub]
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
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);

    if (!payload || payload.status !== 'active') {
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
      [JSON.stringify(preferences), payload.sub]
    );

    console.log(`[Preferences] Updated for user ${payload.sub}:`, preferences);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/user/preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
