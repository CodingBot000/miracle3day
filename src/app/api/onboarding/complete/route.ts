import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';

export async function POST(req: Request) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as any;
    
    // 디버깅 코드 삭제 금지 ** 절대로 삭제하지말것 **
    console.log('=== Onboarding Complete Debug ===');
    console.log('session:', session);
    console.log('session.auth:', session.auth);
    console.log('session.auth?.status:', session.auth?.status);
    console.log('session.auth?.id_uuid:', session.auth?.id_uuid);
    console.log('================================');
    
    if (!session.auth) {
      console.log('No session.auth - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.auth.status === 'pending') {
      console.log('Session is pending - need to complete terms agreement first');
      return NextResponse.json({ 
        error: 'Terms agreement required', 
        redirect: '/auth/terms' 
      }, { status: 403 });
    }
    
    if (session.auth.status !== 'active' || !session.auth.id_uuid) {
      console.log('Session not active or missing id_uuid - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const userId = session.auth.id_uuid;

    // 기존 회원 정보 업데이트
    await q(
      `UPDATE ${TABLE_MEMBERS}
       SET nickname = $1,
           id_country = $2,
           birth_date = $3,
           gender = $4,
           secondary_email = $5,
           phone_country_code = $6,
           phone_number = $7,
           updated_at = now()
       WHERE id_uuid = $8`,
      [
        body.nickname || null,
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
