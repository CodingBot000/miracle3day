import { UserInfoDto } from '@/app/api/auth/getUser/getUser.dto';
import { create } from 'zustand';


interface UserStore {
  userInfo: Partial<UserInfoDto>;
  setUser: (u: Partial<UserInfoDto>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userInfo: {},
  setUser: (u) => set((state) => ({ userInfo: { ...state.userInfo, ...u } })),
  clearUser: () => set({ userInfo: {} }),
}));
