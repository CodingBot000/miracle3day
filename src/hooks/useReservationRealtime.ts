
import { useEffect } from 'react';
// Realtime 기능은 현재 비활성화됨
import { toast } from 'sonner';
import { TABLE_RESERVATIONS } from '@/constants/tables';

export const useReservationRealtime = (hospitalId: string) => {
  // ✅ useEffect를 조건 없이 항상 호출 (Rules of Hooks)
  useEffect(() => {
    // hospitalId가 없으면 아무것도 하지 않음
    if (!hospitalId) return;

    // Realtime 기능은 현재 비활성화됨
    // TODO: AWS 기반 실시간 기능으로 대체 필요
  }, [hospitalId]);
};
