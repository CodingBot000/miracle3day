'use client';

import { useState, useEffect, useCallback } from 'react';
import { mobileStorage } from '@/lib/storage';

const DEV_DATE_OFFSET_KEY = 'dev_date_offset';

interface UseDevDateOffset {
  /** 현재 offset (일 단위) */
  offset: number;
  /** +1일 */
  increment: () => void;
  /** -1일 (최소 0) */
  decrement: () => void;
  /** 0으로 초기화 */
  reset: () => void;
  /** offset 적용된 날짜 반환 */
  getAdjustedDate: (serverDate: string) => string;
}

/**
 * 개발용 날짜 offset 관리 훅
 *
 * localStorage에 offset 값을 저장하고,
 * 서버 날짜에 offset을 적용하여 날짜 변경 로직 테스트 가능
 */
export function useDevDateOffset(): UseDevDateOffset {
  const [offset, setOffset] = useState(0);

  // 초기 로드
  useEffect(() => {
    const savedOffset = mobileStorage.getRaw(DEV_DATE_OFFSET_KEY);
    if (savedOffset !== null) {
      const parsed = parseInt(savedOffset, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        setOffset(parsed);
      }
    }
  }, []);

  const increment = useCallback(() => {
    setOffset((prev) => {
      const newValue = prev + 1;
      mobileStorage.setRaw(DEV_DATE_OFFSET_KEY, String(newValue));
      return newValue;
    });
  }, []);

  const decrement = useCallback(() => {
    setOffset((prev) => {
      const newValue = Math.max(0, prev - 1);
      mobileStorage.setRaw(DEV_DATE_OFFSET_KEY, String(newValue));
      return newValue;
    });
  }, []);

  const reset = useCallback(() => {
    setOffset(0);
    mobileStorage.setRaw(DEV_DATE_OFFSET_KEY, '0');
  }, []);

  const getAdjustedDate = useCallback(
    (serverDate: string): string => {
      if (offset === 0) return serverDate;

      const date = new Date(serverDate);
      date.setDate(date.getDate() + offset);
      return date.toISOString().split('T')[0];
    },
    [offset]
  );

  return {
    offset,
    increment,
    decrement,
    reset,
    getAdjustedDate,
  };
}

/**
 * 서버 날짜에 dev offset 적용하는 유틸 함수
 * (훅 외부에서 사용 가능)
 */
export function applyDevDateOffset(serverDate: string): string {
  if (typeof window === 'undefined') return serverDate;

  const savedOffset = mobileStorage.getRaw(DEV_DATE_OFFSET_KEY);
  if (!savedOffset) return serverDate;

  const offset = parseInt(savedOffset, 10);
  if (isNaN(offset) || offset === 0) return serverDate;

  const date = new Date(serverDate);
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
}

/**
 * 현재 dev offset 값 조회 (훅 외부에서 사용)
 */
export function getDevDateOffset(): number {
  if (typeof window === 'undefined') return 0;

  const savedOffset = mobileStorage.getRaw(DEV_DATE_OFFSET_KEY);
  if (!savedOffset) return 0;

  const offset = parseInt(savedOffset, 10);
  return isNaN(offset) ? 0 : Math.max(0, offset);
}
