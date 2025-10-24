
import { UserInfoDto, UserOutputDto } from './getUser.dto';
// import { findMemberByUserId } from './member.helper';


export const getUserAPI = async (): Promise<UserOutputDto | null> => {
  try {
  const res = await fetch("/api/auth/getUser", { cache: 'no-store' });
    if (!res.ok) {
      return null;
    }
    
    const userInfo = await res.json() as UserInfoDto;
    
    return { userInfo };
  } catch (error) {
    console.error('getUserAPI error:', error);
    return null;
  }
};

// import { UserInfoDto, UserOutputDto } from './getUser.dto';
// import { findMemberByUserId } from './member.helper';

// function buildAuthUserPayload(user: Awaited<ReturnType<typeof currentUser>>) {
//   if (!user) return null;

//   const primaryEmail = user.emailAddresses?.find(
//     (email) => email.id === user.primaryEmailAddressId
//   )?.emailAddress;

//   return {
//     id: user.id,
//     fullName: user.fullName,
//     imageUrl: user.imageUrl,
//     email: primaryEmail ?? user.emailAddresses?.[0]?.emailAddress ?? null,
//   };
// }

// export const getUserAPI = async (): Promise<UserOutputDto | null> => {
//   const authSession = await getAuthSession(req); if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const { userId } = authSession;

//   if (!userId) {
//     return null;
//   }

//   const [member, clerkUser] = await Promise.all([
//     findMemberByUserId(userId),
//     currentUser(),
//   ]);

//   const authUser = buildAuthUserPayload(clerkUser);
//   // const userInfo = member ? { auth_user: authUser, ...member } : { auth_user: authUser };
//   const userInfo = member
//   ? ({ auth_user: authUser, ...member } as UserInfoDto)
//   : null;

//   // return { userInfo, auth_user: authUser };

//   return { userInfo };
// };
