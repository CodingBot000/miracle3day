'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';

export async function withdrawAction() {
  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, {}, sessionOptions) as any;
  
  if (!session.auth || !session.auth.id_uuid) {
    throw new Error('Not authenticated');
  }

  await q(
    `DELETE FROM ${TABLE_MEMBERS} WHERE id_uuid = $1`,
    [session.auth.id_uuid]
  );

  session.destroy();
  redirect('/');
}
