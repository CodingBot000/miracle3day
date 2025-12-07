import { AlarmDto } from '@/models/admin/alarm';
import { create } from 'zustand';

/**
 * Hospital Store - 전역 병원 정보 관리
 * - id_uuid_hospital: 병원 UUID (admin.id_uuid_hospital)
 * - hospitalName: 병원 이름
 * - id_admin: 현재 로그인한 관리자 ID (admin.id)
 */
interface HospitalStore {
  id_uuid_hospital: string | null;
  hospitalName: string | null;
  id_admin: string | null;

  setHospitalUuid: (uuid: string) => void;
  setHospitalName: (name: string) => void;
  setid_admin: (uid: string) => void;
  setHospitalData: (data: { uuid?: string; name?: string; userUid?: string }) => void;
  clearHospitalData: () => void;
}

export const useHospitalStore = create<HospitalStore>((set) => ({
  id_uuid_hospital: null,
  hospitalName: null,
  id_admin: null,

  setHospitalUuid: (uuid) => set({ id_uuid_hospital: uuid }),
  setHospitalName: (name) => set({ hospitalName: name }),
  setid_admin: (uid) => set({ id_admin: uid }),
  setHospitalData: (data) => set((state) => ({
    id_uuid_hospital: data.uuid ?? state.id_uuid_hospital,
    hospitalName: data.name ?? state.hospitalName,
    id_admin: data.userUid ?? state.id_admin,
  })),
  clearHospitalData: () => set({
    id_uuid_hospital: null,
    hospitalName: null,
    id_admin: null,
  }),
}));

/**
 * Alarm Store - 알람 정보 관리
 */
interface AlarmStore {
  info: Partial<AlarmDto>;
  setAlarmInfo: (u: Partial<AlarmDto>) => void;
  clearAlarmInfo: () => void;
}

export const useAlarmStore = create<AlarmStore>((set) => ({
  info: {},
  setAlarmInfo: (u) => set((state) => ({ info: { ...state.info, ...u } })),
  clearAlarmInfo: () => set({ info: {} }),
}));
