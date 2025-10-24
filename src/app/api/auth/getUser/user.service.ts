import { auth, currentUser } from '@clerk/nextjs/server';
import { findMemberByUserId } from './member.helper';
import type { UserOutputDto } from './getUser.dto';

function buildAuthUserPayload(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) return null;

  const primaryEmail = user.emailAddresses?.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress;

  return {
    id: user.id,
    fullName: user.fullName,
    imageUrl: user.imageUrl,
    email: primaryEmail ?? user.emailAddresses?.[0]?.emailAddress ?? null,
  };
}

export async function getUserInfo(): Promise<UserOutputDto | null> {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const [member, clerkUser] = await Promise.all([
    findMemberByUserId(userId),
    currentUser(),
  ]);

  const authUser = buildAuthUserPayload(clerkUser);
  const userInfo = member ? { auth_user: authUser, ...member } : { auth_user: authUser };

  return { userInfo };
}