'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { mobileStorage, STORAGE_KEYS } from '@/lib/storage';
import { applyDevDateOffset } from '@/app/[locale]/(mobileapp)/components/dev/useDevDateOffset';

interface UseRoutineDateSyncOptions {
  idUuidMember: string;
  routineUuid: string;
}

interface UseRoutineDateSyncResult {
  /** 서버 기준 오늘 날짜 (YYYY-MM-DD) */
  serverDate: string | null;
  /** 체크된 스텝 UUID 세트 */
  checkedSteps: Set<string>;
  /** 체크 상태 업데이트 함수 */
  setCheckedSteps: (steps: Set<string>) => void;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 수동 날짜 체크 (탭 포커스 복귀 시 호출) */
  checkDateAndSync: () => Promise<void>;
}

/**
 * 루틴 날짜 동기화 훅
 *
 * 기능:
 * 1. 서버 시간 기반 날짜 변경 감지
 * 2. 날짜 변경 시 체크 상태 초기화
 * 3. localStorage 데이터 없을 때 DB에서 조회
 * 4. visibilitychange 이벤트로 탭 복귀 시 자동 재검사
 */
export function useRoutineDateSync({
  idUuidMember,
  routineUuid,
}: UseRoutineDateSyncOptions): UseRoutineDateSyncResult {
  const [serverDate, setServerDate] = useState<string | null>(null);
  const [checkedSteps, setCheckedStepsState] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 중복 호출 방지용 ref
  const isSyncing = useRef(false);

  /**
   * 체크 상태 업데이트 + localStorage 저장
   */
  const setCheckedSteps = useCallback(
    (steps: Set<string>) => {
      setCheckedStepsState(steps);

      // serverDate가 있을 때만 localStorage에 저장
      if (serverDate) {
        const storageKey = STORAGE_KEYS.getRoutineProgressKey(serverDate);
        mobileStorage.setRaw(storageKey, JSON.stringify(Array.from(steps)));
      }
    },
    [serverDate]
  );

  /**
   * 날짜 체크 및 동기화
   */
  const checkDateAndSync = useCallback(async () => {
    // 중복 호출 방지
    if (isSyncing.current) {
      console.log('[DEBUG] 🔄 Already syncing, skipping...');
      return;
    }

    if (!idUuidMember || !routineUuid) {
      console.log('[DEBUG] ⚠️ Missing member or routine UUID');
      return;
    }

    isSyncing.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // 1. 서버에서 오늘 날짜 조회
      const timeResponse = await fetch('/api/skincare/server-time');
      if (!timeResponse.ok) {
        throw new Error('Failed to fetch server time');
      }
      const timeData = await timeResponse.json();
      const rawServerDate = timeData.server_date;

      // === DEV ONLY: 날짜 offset 적용 ===
      const currentServerDate = applyDevDateOffset(rawServerDate);

      console.log('[DEBUG] 🕐 Server date:', rawServerDate, '| Adjusted:', currentServerDate);

      // 2. localStorage에서 마지막 체크 날짜 조회
      const storedDate = mobileStorage.getRaw(STORAGE_KEYS.ROUTINE_CHECK_DATE);

      console.log('[DEBUG] 📅 Stored date:', storedDate, '| Server date:', currentServerDate);

      // 3. 날짜 비교
      if (storedDate !== currentServerDate) {
        // 날짜가 다름 → 체크 상태 초기화
        console.log('[DEBUG] 📆 Date changed! Resetting progress...');

        // 이전 날짜의 progress 키 삭제 (옵션: 필요시 주석 해제)
        // if (storedDate) {
        //   mobileStorage.remove(STORAGE_KEYS.getRoutineProgressKey(storedDate));
        // }

        // 새 날짜 저장
        mobileStorage.setRaw(STORAGE_KEYS.ROUTINE_CHECK_DATE, currentServerDate);

        // DB에서 오늘 날짜 progress 조회 (다른 기기에서 체크했을 수 있음)
        const progressResponse = await fetch(
          `/api/skincare/progress/today?id_uuid_member=${encodeURIComponent(
            idUuidMember
          )}&routine_uuid=${encodeURIComponent(routineUuid)}&date=${encodeURIComponent(
            currentServerDate
          )}`
        );

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          if (progressData.success && progressData.checked_steps.length > 0) {
            console.log('[DEBUG] 📥 Restored from DB:', progressData.checked_steps.length, 'steps');
            const restoredSteps = new Set<string>(progressData.checked_steps);
            setCheckedStepsState(restoredSteps);

            // localStorage에도 저장
            const storageKey = STORAGE_KEYS.getRoutineProgressKey(currentServerDate);
            mobileStorage.setRaw(storageKey, JSON.stringify(progressData.checked_steps));
          } else {
            console.log('[DEBUG] 🆕 Starting fresh (no DB data)');
            setCheckedStepsState(new Set());
          }
        } else {
          console.log('[DEBUG] 🆕 Starting fresh (DB error, using empty)');
          setCheckedStepsState(new Set());
        }
      } else {
        // 날짜가 같음 → localStorage에서 로드
        console.log('[DEBUG] 📅 Same date, loading from localStorage...');

        const storageKey = STORAGE_KEYS.getRoutineProgressKey(currentServerDate);
        const savedProgress = mobileStorage.getRaw(storageKey);

        if (savedProgress) {
          try {
            const parsed = JSON.parse(savedProgress);
            setCheckedStepsState(new Set(parsed));
            console.log('[DEBUG] 💾 Loaded from localStorage:', parsed.length, 'steps');
          } catch {
            console.log('[DEBUG] ⚠️ Failed to parse localStorage, starting fresh');
            setCheckedStepsState(new Set());
          }
        } else {
          // localStorage에 데이터 없음 → DB 조회 fallback
          console.log('[DEBUG] 📡 No localStorage data, checking DB...');

          const progressResponse = await fetch(
            `/api/skincare/progress/today?id_uuid_member=${encodeURIComponent(
              idUuidMember
            )}&routine_uuid=${encodeURIComponent(routineUuid)}&date=${encodeURIComponent(
              currentServerDate
            )}`
          );

          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            if (progressData.success && progressData.checked_steps.length > 0) {
              console.log('[DEBUG] 📥 Restored from DB fallback:', progressData.checked_steps.length, 'steps');
              const restoredSteps = new Set<string>(progressData.checked_steps);
              setCheckedStepsState(restoredSteps);

              // localStorage에도 저장
              mobileStorage.setRaw(storageKey, JSON.stringify(progressData.checked_steps));
            } else {
              console.log('[DEBUG] 🆕 No data in DB either, starting fresh');
              setCheckedStepsState(new Set());
            }
          } else {
            setCheckedStepsState(new Set());
          }
        }
      }

      setServerDate(currentServerDate);
    } catch (err) {
      console.error('[DEBUG] ❌ Date sync error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // 에러 시 디바이스 시간 fallback
      const fallbackDate = new Date().toISOString().split('T')[0];
      setServerDate(fallbackDate);

      // localStorage에서 로드 시도
      const storageKey = STORAGE_KEYS.getRoutineProgressKey(fallbackDate);
      const savedProgress = mobileStorage.getRaw(storageKey);
      if (savedProgress) {
        try {
          setCheckedStepsState(new Set(JSON.parse(savedProgress)));
        } catch {
          setCheckedStepsState(new Set());
        }
      }
    } finally {
      setIsLoading(false);
      isSyncing.current = false;
    }
  }, [idUuidMember, routineUuid]);

  // 초기 로드
  useEffect(() => {
    checkDateAndSync();
  }, [checkDateAndSync]);

  // visibilitychange 이벤트 리스너
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[DEBUG] 👁️ Tab became visible, checking date...');
        checkDateAndSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkDateAndSync]);

  return {
    serverDate,
    checkedSteps,
    setCheckedSteps,
    isLoading,
    error,
    checkDateAndSync,
  };
}
