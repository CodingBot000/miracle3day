import { log } from '@/utils/logger';
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';

/**
 * GET - 온보딩 진행 중인 사용자의 프로필 정보 조회
 * pending 또는 active 상태 모두 허용
 */
export async function GET(req: Request) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as any;

    log.debug('=== Onboarding Profile Debug ===');
    log.debug('session.auth:', session.auth);

    if (!session.auth || !session.auth.id_uuid) {
      return NextResponse.json({ profile: null }, { status: 401 });
    }

    // pending 또는 active 상태 모두 허용
    if (session.auth.status !== 'active' && session.auth.status !== 'pending') {
      return NextResponse.json({ profile: null }, { status: 401 });
    }

    const members = await q(
      `SELECT id_country, birth_date, gender, secondary_email, phone_country_code, phone_number, nickname
       FROM ${TABLE_MEMBERS}
       WHERE id_uuid = $1
       LIMIT 1`,
      [session.auth.id_uuid]
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
