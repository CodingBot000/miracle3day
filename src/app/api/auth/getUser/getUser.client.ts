import { UserOutputDto } from './getUser.dto';
import { useUserStore } from '@/stores/useUserStore';

export const getUserAPI = async (): Promise<UserOutputDto | null> => {
  try {
    const res = await fetch('/api/auth/getUser', { cache: 'no-store' });

    if (res.status === 401) {
      useUserStore.getState().clearUser();
      return null;
    }

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = (await res.json()) as UserOutputDto;
    if (data?.userInfo) {
      useUserStore.getState().setUser(data.userInfo);
    } else {
      useUserStore.getState().clearUser();
    }

    return data;
  } catch (error) {
    console.error('getUserAPI client error:', error);
    useUserStore.getState().clearUser();
    return null;
  }
};
