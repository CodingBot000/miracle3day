import { ReservationInputDto } from '@/app/api/hospital/[id]/reservation/reservation.dto';
import { create } from 'zustand';

type ReservationUserInfo = {
    date: string,
    time: string,
    reservationInfo: ReservationInputDto
  };
  
  interface ReservationStore {
    reservationUserInfo: Partial<ReservationUserInfo>;
    setReservationUserInfo: (data: Partial<ReservationUserInfo>) => void;
    clearReservationUserInfo: () => void;
  }

  
  export const useReservationStore = create<ReservationStore>((set) => ({
    reservationUserInfo: {},
    setReservationUserInfo: (data) => set({ reservationUserInfo: data }),
    clearReservationUserInfo: () => set({ reservationUserInfo: {} }),
  }));