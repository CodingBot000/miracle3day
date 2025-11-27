import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';
import { UserOutputDto } from './getUser.dto';

/**
 * Server-side function to get user data from session
 * Use this ONLY in Server Components or Server Actions
 */
export const getUserAPIServer = async (): Promise<UserOutputDto | null> => {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions) as any;

    if (!session.auth || session.auth.status !== 'active' || !session.auth.id_uuid) {
      log.debug('[getUserAPIServer] No active session');
      return null;
    }

    const member = await q(
      `SELECT * FROM ${TABLE_MEMBERS} WHERE id_uuid = $1 LIMIT 1`,
      [session.auth.id_uuid]
    );

    if (!member.length) {
      log.debug('[getUserAPIServer] User not found in database');
      return null;
    }

    const userInfo = {
      auth_user: {
        id: session.auth.id_uuid,
        email: session.auth.email,
        imageUrl: session.auth.avatar,
      },
      ...member[0]
    };

    return { userInfo };
  } catch (error) {
    console.error('[getUserAPIServer] Error:', error);
    return null;
  }
};
