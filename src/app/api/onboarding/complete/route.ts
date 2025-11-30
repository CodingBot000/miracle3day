import { log } from '@/utils/logger';
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';

export async function POST(req: Request) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as any;
    
    // 디버깅 코드 삭제 금지 ** 절대로 삭제하지말것 **
    log.debug('=== Onboarding Complete Debug ===');
    log.debug('session:', session);
    log.debug('session.auth:', session.auth);
    log.debug('session.auth?.status:', session.auth?.status);
    log.debug('session.auth?.id_uuid:', session.auth?.id_uuid);
    log.debug('================================');
    
    if (!session.auth) {
      log.debug('No session.auth - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.auth.status === 'pending') {
      log.debug('Session is pending - need to complete terms agreement first');
      return NextResponse.json({
        error: 'Terms agreement required',
        redirect: '/terms'
      }, { status: 403 });
    }
    
    if (session.auth.status !== 'active' || !session.auth.id_uuid) {
      log.debug('Session not active or missing id_uuid - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const userId = session.auth.id_uuid;

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
