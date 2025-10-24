'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export async function withdrawAction() {
  // 1) 세션 복원
  const session = await getIronSession(cookies(), sessionOptions);
  const auth = (session as any).auth;

  // 2) 로그인 체크
  if (!auth || auth.status !== 'active' || !auth.id_uuid) {
    throw new Error('Not authenticated');
  }


  await q(
    `DELETE FROM ${TABLE_MEMBERS} WHERE id_uuid = $1`,
    [auth.id_uuid]
  );

  // 세션 쿠키 삭제
  // cookieStore.delete('app_session');
  // 4) 세션 파기 (쿠키 제거 포함)
  await session.destroy();


  redirect('/');
}
