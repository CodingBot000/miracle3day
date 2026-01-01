import { log } from '@/utils/logger';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth/jwt';
import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';

/**
 * GET - 온보딩 진행 중인 사용자의 프로필 정보 조회
 * pending 또는 active 상태 모두 허용
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ profile: null }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);

    log.debug('=== Onboarding Profile Debug ===');
    log.debug('payload:', payload);

    if (!payload) {
      return NextResponse.json({ profile: null }, { status: 401 });
    }

    // pending 또는 active 상태 모두 허용
    if (payload.status !== 'active' && payload.status !== 'pending') {
      return NextResponse.json({ profile: null }, { status: 401 });
    }

    const members = await q(
      `SELECT id_country, birth_date, gender, secondary_email, phone_country_code, phone_number, nickname
       FROM ${TABLE_MEMBERS}
       WHERE id_uuid = $1
       LIMIT 1`,
      [payload.sub]
    );

    if (!members.length) {
      return NextResponse.json({ profile: null }, { status: 404 });
    }

    return NextResponse.json({ profile: members[0] });
  } catch (error) {
    console.error('GET /api/onboarding/profile error:', error);
    return NextResponse.json(
      { profile: null, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
