'use server';

import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';
import { getSessionUser, clearAuthCookiesServer } from '@/lib/auth/jwt';

export async function withdrawAction() {
  // 1) JWT 세션 조회
  const session = await getSessionUser();

  // 2) 로그인 체크
  if (!session || session.status !== 'active') {
    throw new Error('Not authenticated');
  }

  // 3) 회원 삭제
  await q(
    `DELETE FROM ${TABLE_MEMBERS} WHERE id_uuid = $1`,
    [session.id]
  );

  // 4) 쿠키 제거
  await clearAuthCookiesServer();

  // redirect 대신 성공 여부만 반환 (클라이언트에서 window.location.href로 이동)
  return { success: true };
}
