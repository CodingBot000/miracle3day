/**
 * Mobile Storage 모듈
 *
 * 사용법:
 * import { mobileStorage, STORAGE_KEYS } from '@/lib/storage';
 *
 * // 저장
 * mobileStorage.set('my_key', { foo: 'bar' });
 *
 * // 조회
 * const data = mobileStorage.get<MyType>('my_key');
 *
 * // 삭제
 * mobileStorage.remove('my_key');
 */

// 메인 스토리지
export { mobileStorage, detectType, serializeValue, deserializeValue } from './mobile-storage';

// 타입
export type {
  StorageType,
  StorageOptions,
  StoredData,
  SyncMetadata,
  Platform,
  StorageKey,
} from './types';

// 상수
export { STORAGE_KEYS } from './types';

// 동기화
export {
  getSyncMetadata,
  setSyncMetadata,
  setPendingSync,
  getLastSyncTime,
  getPendingSyncKeys,
  sync,
  syncAll,
  removeSyncMetadata,
} from './sync';
