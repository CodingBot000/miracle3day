'use client';

import { useEffect, useCallback, useRef } from 'react';
import {
  ConsultFormType,
  saveFormData,
  loadFormData,
  clearFormData,
  hasStoredFormData,
} from './consultFormStorage';

interface UseConsultFormStorageOptions {
  /** 자동 저장 활성화 여부 (기본값: true) */
  autoSave?: boolean;
  /** 자동 저장 디바운스 시간 (ms) (기본값: 1000) */
  debounceMs?: number;
}

interface UseConsultFormStorageReturn {
  /** 저장된 데이터 불러오기 */
  loadStoredData: () => Record<string, any> | null;
  /** 데이터 수동 저장 */
  saveData: (data: Record<string, any>) => void;
  /** 저장된 데이터 삭제 */
  clearData: () => void;
  /** 저장된 데이터 존재 여부 */
  hasStoredData: () => boolean;
}

/**
 * 설문 폼 데이터 저장/복원을 위한 커스텀 훅
 *
 * @example
 * ```tsx
 * const { loadStoredData, saveData, clearData } = useConsultFormStorage('preConsult');
 *
 * // 컴포넌트 마운트 시 저장된 데이터 불러오기
 * useEffect(() => {
 *   const stored = loadStoredData();
 *   if (stored) {
 *     setFormData(stored);
 *   }
 * }, []);
 *
 * // formData 변경 시 자동 저장 (autoSave 옵션)
 * useEffect(() => {
 *   saveData(formData);
 * }, [formData]);
 * ```
 */
export const useConsultFormStorage = (
  formType: ConsultFormType,
  options: UseConsultFormStorageOptions = {}
): UseConsultFormStorageReturn => {
  const { autoSave = true, debounceMs = 1000 } = options;
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const loadStoredData = useCallback((): Record<string, any> | null => {
    return loadFormData(formType);
  }, [formType]);

  const saveData = useCallback(
    (data: Record<string, any>) => {
      if (!autoSave) {
        saveFormData(formType, data);
        return;
      }

      // 디바운스 처리
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        saveFormData(formType, data);
      }, debounceMs);
    },
    [formType, autoSave, debounceMs]
  );

  const clearData = useCallback(() => {
    clearFormData(formType);
  }, [formType]);

  const hasStoredData = useCallback((): boolean => {
    return hasStoredFormData(formType);
  }, [formType]);

  return {
    loadStoredData,
    saveData,
    clearData,
    hasStoredData,
  };
};

export default useConsultFormStorage;
