import { UserInfoDto, UserOutputDto } from './getUser.dto';

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