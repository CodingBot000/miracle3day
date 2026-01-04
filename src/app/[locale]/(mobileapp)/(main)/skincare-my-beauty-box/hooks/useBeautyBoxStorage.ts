'use client';

import { useState, useEffect, useCallback } from 'react';
import { mobileStorage } from '@/lib/storage';
import { BeautyBoxProduct, PendingChange, FilterSortState } from '../types';

const KEYS = {
  PRODUCTS: 'beautybox_products',
  PENDING_CHANGES: 'beautybox_pending_changes',
  LAST_SYNC: 'beautybox_last_sync',
  FILTER_SORT: 'beautybox_filter_sort',
  EXPANDED_SECTIONS: 'beautybox_expanded_sections',
};

export function useBeautyBoxStorage() {
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 초기 로드
  useEffect(() => {
    const stored = mobileStorage.get<PendingChange[]>(KEYS.PENDING_CHANGES);
    if (stored && stored.length > 0) {
      setPendingChanges(stored);
      setHasUnsavedChanges(true);
    }
  }, []);

  // 변경사항 추가
  const addChange = useCallback((change: Omit<PendingChange, 'id' | 'timestamp'>) => {
    const newChange: PendingChange = {
      ...change,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    setPendingChanges((prev) => {
      // 같은 레코드에 대한 이전 변경이 있으면 병합
      const existingIndex = prev.findIndex((c) => c.recordId === change.recordId);
      let updated: PendingChange[];

      if (existingIndex >= 0 && change.type === 'update') {
        // 기존 update에 병합
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          changes: { ...updated[existingIndex].changes, ...change.changes },
          timestamp: newChange.timestamp,
        };
      } else if (existingIndex >= 0 && change.type === 'delete') {
        // delete가 오면 이전 변경 제거하고 delete만 유지
        updated = prev.filter((c) => c.recordId !== change.recordId);
        updated.push(newChange);
      } else {
        updated = [...prev, newChange];
      }

      // localStorage에 즉시 저장
      mobileStorage.set(KEYS.PENDING_CHANGES, updated);
      return updated;
    });

    setHasUnsavedChanges(true);
  }, []);

  // 로컬 제품 목록 업데이트 (UI 반영용)
  const updateLocalProducts = useCallback((products: BeautyBoxProduct[]) => {
    mobileStorage.set(KEYS.PRODUCTS, products);
  }, []);

  // 로컬 제품 목록 조회
  const getLocalProducts = useCallback((): BeautyBoxProduct[] | null => {
    return mobileStorage.get<BeautyBoxProduct[]>(KEYS.PRODUCTS);
  }, []);

  // 동기화 (저장 버튼 클릭 시)
  const syncToServer = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (pendingChanges.length === 0) {
      return { success: true };
    }

    try {
      const response = await fetch('/api/skincare/my-beauty-box/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: pendingChanges }),
      });

      const result = await response.json();

      if (result.success) {
        // 성공 시 pending 클리어
        setPendingChanges([]);
        setHasUnsavedChanges(false);
        mobileStorage.remove(KEYS.PENDING_CHANGES);
        mobileStorage.set(KEYS.LAST_SYNC, new Date().toISOString());

        // 서버에서 최신 데이터로 갱신
        if (result.products) {
          updateLocalProducts(result.products);
        }

        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('[BeautyBox] Sync error:', error);
      return { success: false, error: 'Network error' };
    }
  }, [pendingChanges, updateLocalProducts]);

  // pending 변경사항 클리어 (취소 시)
  const clearPendingChanges = useCallback(() => {
    setPendingChanges([]);
    setHasUnsavedChanges(false);
    mobileStorage.remove(KEYS.PENDING_CHANGES);
  }, []);

  // 필터/정렬 상태 저장
  const saveFilterSort = useCallback((state: FilterSortState) => {
    mobileStorage.set(KEYS.FILTER_SORT, state);
  }, []);

  const getFilterSort = useCallback((): FilterSortState | null => {
    return mobileStorage.get<FilterSortState>(KEYS.FILTER_SORT);
  }, []);

  // 섹션 펼침 상태 저장
  const saveExpandedSections = useCallback((sections: string[]) => {
    mobileStorage.set(KEYS.EXPANDED_SECTIONS, sections);
  }, []);

  const getExpandedSections = useCallback((): string[] | null => {
    return mobileStorage.get<string[]>(KEYS.EXPANDED_SECTIONS);
  }, []);

  // 마지막 동기화 시간 조회
  const getLastSyncTime = useCallback((): string | null => {
    return mobileStorage.get<string>(KEYS.LAST_SYNC);
  }, []);

  return {
    pendingChanges,
    hasUnsavedChanges,
    pendingCount: pendingChanges.length,
    addChange,
    updateLocalProducts,
    getLocalProducts,
    syncToServer,
    clearPendingChanges,
    saveFilterSort,
    getFilterSort,
    saveExpandedSections,
    getExpandedSections,
    getLastSyncTime,
  };
}
