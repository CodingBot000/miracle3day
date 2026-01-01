import { log } from '@/utils/logger';
import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';
import { UserOutputDto } from './getUser.dto';
import { getSessionUser } from '@/lib/auth/jwt';

/**
 * Server-side function to get user data from session (JWT 기반)
 * Use this ONLY in Server Components or Server Actions
 */
export const getUserAPIServer = async (): Promise<UserOutputDto | null> => {
  try {
    const session = await getSessionUser();

    if (!session || session.status !== 'active') {
      log.debug('[getUserAPIServer] No active session');
      return null;
    }

    const member = await q(
      `SELECT * FROM ${TABLE_MEMBERS} WHERE id_uuid = $1 LIMIT 1`,
      [session.id]
    );

    if (!member.length) {
      log.debug('[getUserAPIServer] User not found in database');
      return null;
    }

    const userInfo = {
      auth_user: {
        id: session.id,
        email: session.email,
        imageUrl: session.avatar,
      },
      ...member[0]
    };

    return { userInfo };
  } catch (error) {
    console.error('[getUserAPIServer] Error:', error);
    return null;
  }
};
