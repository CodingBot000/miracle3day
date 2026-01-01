/**
 * Mobile Storage 동기화 로직
 *
 * 로컬 저장소 ↔ 리모트 DB 동기화 기능
 * 현재는 기본 구조만 제공, 실제 동기화는 API 엔드포인트 추가 후 구현
 */

import { mobileStorage } from './mobile-storage';
import type { SyncMetadata } from './types';

// 동기화 메타데이터 키 접두사
const SYNC_META_PREFIX = '__sync_meta_';

/**
 * 동기화 메타데이터 조회
 */
export function getSyncMetadata(key: string): SyncMetadata | null {
  const metaKey = `${SYNC_META_PREFIX}${key}`;
  return mobileStorage.get<SyncMetadata>(metaKey);
}

/**
 * 동기화 메타데이터 저장
 */
export function setSyncMetadata(key: string, metadata: Partial<SyncMetadata>): void {
  const metaKey = `${SYNC_META_PREFIX}${key}`;
  const existing = getSyncMetadata(key) ?? {
    lastSyncAt: null,
    pendingSync: false,
  };

  mobileStorage.set(metaKey, {
    ...existing,
    ...metadata,
  });
}

/**
 * 동기화 대기 플래그 설정
 */
export function setPendingSync(key: string, pending: boolean = true): void {
  setSyncMetadata(key, { pendingSync: pending });
}

/**
 * 마지막 동기화 시간 조회
 */
export function getLastSyncTime(key: string): Date | null {
  const meta = getSyncMetadata(key);
  return meta?.lastSyncAt ? new Date(meta.lastSyncAt) : null;
}

/**
 * 동기화 대기 중인 키 목록 조회
 */
export function getPendingSyncKeys(): string[] {
  const keys = mobileStorage.keys();
  const pendingKeys: string[] = [];

  for (const key of keys) {
    if (key.startsWith(SYNC_META_PREFIX)) continue;

    const meta = getSyncMetadata(key);
    if (meta?.pendingSync) {
      pendingKeys.push(key);
    }
  }

  return pendingKeys;
}

/**
 * 단일 키 동기화 (미래 구현용 스텁)
 * @param key 동기화할 키
 * @param endpoint API 엔드포인트 (선택)
 */
export async function sync(key: string, endpoint?: string): Promise<boolean> {
  // TODO: 실제 동기화 로직 구현
  // 1. 로컬 데이터 조회
  // 2. API 호출하여 리모트 저장
  // 3. 성공 시 메타데이터 업데이트

  console.log(`[MobileStorage] Sync requested for key: ${key}, endpoint: ${endpoint}`);

  // 현재는 메타데이터만 업데이트
  setSyncMetadata(key, {
    lastSyncAt: new Date(),
    pendingSync: false,
    syncEndpoint: endpoint,
  });

  return true;
}

/**
 * 모든 동기화 대기 항목 동기화 (미래 구현용 스텁)
 */
export async function syncAll(): Promise<{ success: string[]; failed: string[] }> {
  const pendingKeys = getPendingSyncKeys();
  const success: string[] = [];
  const failed: string[] = [];

  for (const key of pendingKeys) {
    try {
      await sync(key);
      success.push(key);
    } catch {
      failed.push(key);
    }
  }

  return { success, failed };
}

/**
 * 동기화 메타데이터 삭제
 */
export function removeSyncMetadata(key: string): void {
  const metaKey = `${SYNC_META_PREFIX}${key}`;
  mobileStorage.remove(metaKey);
}
