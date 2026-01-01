import { log } from '@/utils/logger';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth/jwt';
import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      log.debug('No token - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);

    // 디버깅 코드 삭제 금지 ** 절대로 삭제하지말것 **
    log.debug('=== Onboarding Complete Debug ===');
    log.debug('payload:', payload);
    log.debug('payload?.status:', payload?.status);
    log.debug('payload?.sub:', payload?.sub);
    log.debug('================================');

    if (!payload) {
      log.debug('No payload - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (payload.status === 'pending') {
      log.debug('Session is pending - need to complete terms agreement first');
      return NextResponse.json({
        error: 'Terms agreement required',
        redirect: '/terms'
      }, { status: 403 });
    }

    if (payload.status !== 'active') {
      log.debug('Session not active - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const userId = payload.sub;

    // 기존 회원 정보 업데이트 (nickname은 consent/accept에서 이미 생성됨)
    await q(
      `UPDATE ${TABLE_MEMBERS}
       SET id_country = $1,
           birth_date = $2,
           gender = $3,
           secondary_email = $4,
           phone_country_code = $5,
           phone_number = $6,
           updated_at = now()
       WHERE id_uuid = $7`,
      [
        body.id_country || null,
        body.birth_date || null,
        body.gender || null,
        body.secondary_email || null,
        body.phone_country_code || null,
        body.phone_number || null,
        userId
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Onboarding complete error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
