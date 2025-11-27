import { UserInfoDto } from '@/app/api/auth/getUser/getUser.dto';
import { create } from 'zustand';


interface UserStore {
  userInfo: Partial<UserInfoDto>;
  setUser: (u: Partial<UserInfoDto>) => void;
  updateAvatar: (avatar: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userInfo: {},
  setUser: (u) => set((state) => ({ userInfo: { ...state.userInfo, ...u } })),
  updateAvatar: (avatar) => set((state) => ({ userInfo: { ...state.userInfo, avatar } })),
  clearUser: () => set({ userInfo: {} }),
}));
