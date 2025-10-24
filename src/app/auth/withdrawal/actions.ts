'use server';

import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';

export async function withdrawAction() {
  const { userId, sessionId } = auth();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  await q(
    `DELETE FROM ${TABLE_MEMBERS} WHERE clerk_user_id = $1 OR id_uuid::text = $1`,
    [userId]
  );

  try {
    await clerkClient.users.deleteUser(userId);
  } catch (error) {
    console.error('Failed to delete Clerk user:', error);
  }

  if (sessionId) {
    try {
      await clerkClient.sessions.revokeSession(sessionId);
    } catch (error) {
      console.error('Failed to revoke session during withdrawal:', error);
    }
  }

  redirect('/');
}
