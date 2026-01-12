/**
 * Mobile Storage 타입 정의
 * PostgreSQL/SQLite 데이터 타입 지원 및 동기화 메타데이터
 */

// 지원하는 데이터 타입
export type StorageType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'json'
  | 'jsonb'
  | 'array'
  | 'date'
  | 'timestamp'
  | 'uuid'
  | 'blob'
  | 'null';

// 저장 옵션
export interface StorageOptions {
  /** 데이터 타입 (자동 감지 가능) */
  type?: StorageType;
  /** 만료 시간 */
  expiresAt?: Date;
  /** 리모트 DB 동기화 대상 여부 */
  syncable?: boolean;
  /** 동기화할 테이블명 */
  tableName?: string;
}

// 동기화 메타데이터
export interface SyncMetadata {
  lastSyncAt: Date | null;
  pendingSync: boolean;
  syncEndpoint?: string;
}

// 저장되는 데이터 래퍼
export interface StoredData<T = unknown> {
  value: T;
  type: StorageType;
  expiresAt?: string;
  syncable?: boolean;
  tableName?: string;
  createdAt: string;
  updatedAt: string;
}

// 플랫폼 타입
export type Platform = 'web' | 'android-webview' | 'ios-webview' | 'server';

// 키 목록 (mobileapp에서 사용하는 localStorage 키들)
export const STORAGE_KEYS = {
  // Skincare Onboarding
  SKINCARE_ONBOARDING_ANSWERS: 'skincare_onboarding_answers',

  // Skincare Main
  SKINCARE_ROUTINE_DATA: 'skincare_routine_data',
  SKINCARE_USER_PROFILE: 'skincare_user_profile',
  ROUTINE_LAST_SAVED: 'routine_last_saved',

  // Routine Date Management (날짜 변경 감지용)
  ROUTINE_CHECK_DATE: 'routine_check_date', // 마지막 체크 날짜 (YYYY-MM-DD)

  // Routine Progress (동적 키: routine_progress_YYYY-MM-DD)
  getRoutineProgressKey: (date: string) => `routine_progress_${date}`,
} as const;

// 키 타입
export type StorageKey =
  | typeof STORAGE_KEYS.SKINCARE_ONBOARDING_ANSWERS
  | typeof STORAGE_KEYS.SKINCARE_ROUTINE_DATA
  | typeof STORAGE_KEYS.SKINCARE_USER_PROFILE
  | typeof STORAGE_KEYS.ROUTINE_LAST_SAVED
  | typeof STORAGE_KEYS.ROUTINE_CHECK_DATE
  | `routine_progress_${string}`;
