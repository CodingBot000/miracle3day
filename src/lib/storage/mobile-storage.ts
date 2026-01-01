/**
 * Mobile Storage 유틸리티
 *
 * 웹 개발용 localStorage를 추상화하여 나중에 Android/iOS Native Storage로 쉽게 마이그레이션
 * - 현재: localStorage 사용
 * - 미래: Android WebView → Native Storage, iOS WebView → UserDefaults
 */

import { getPlatform } from '../platform';
import type { StorageType, StorageOptions, StoredData, Platform } from './types';

// 타입 자동 감지
function detectType(value: unknown): StorageType {
  if (value === null) return 'null';
  if (value === undefined) return 'null';

  const type = typeof value;

  if (type === 'string') {
    // UUID 패턴 체크
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value as string)) {
      return 'uuid';
    }
    // ISO Date 패턴 체크
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(value as string)) {
      return 'timestamp';
    }
    return 'string';
  }

  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (type === 'object') return 'json';

  return 'string';
}

// 값 직렬화
function serializeValue(value: unknown, type: StorageType): string {
  switch (type) {
    case 'string':
    case 'uuid':
      return String(value);
    case 'number':
      return String(value);
    case 'boolean':
      return value ? 'true' : 'false';
    case 'date':
    case 'timestamp':
      if (value instanceof Date) {
        return value.toISOString();
      }
      return String(value);
    case 'json':
    case 'jsonb':
    case 'array':
      return JSON.stringify(value);
    case 'null':
      return 'null';
    case 'blob':
      // Blob은 base64로 인코딩 (추후 구현)
      return String(value);
    default:
      return String(value);
  }
}

// 값 역직렬화
function deserializeValue<T>(serialized: string, type: StorageType): T {
  switch (type) {
    case 'string':
    case 'uuid':
      return serialized as T;
    case 'number':
      return Number(serialized) as T;
    case 'boolean':
      return (serialized === 'true') as T;
    case 'date':
      return new Date(serialized).toISOString().split('T')[0] as T;
    case 'timestamp':
      return serialized as T;
    case 'json':
    case 'jsonb':
    case 'array':
      try {
        return JSON.parse(serialized) as T;
      } catch {
        return serialized as T;
      }
    case 'null':
      return null as T;
    default:
      return serialized as T;
  }
}

// 만료 체크
function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

/**
 * Mobile Storage 클래스
 * localStorage를 추상화하여 플랫폼별 저장소로 확장 가능
 */
class MobileStorage {
  private platform: Platform;

  constructor() {
    this.platform = typeof window !== 'undefined' ? getPlatform() : 'server';
  }

  /**
   * 데이터 저장
   */
  set<T>(key: string, value: T, options?: StorageOptions): void {
    if (typeof window === 'undefined') return;

    const type = options?.type ?? detectType(value);
    const now = new Date().toISOString();

    const data: StoredData<T> = {
      value,
      type,
      expiresAt: options?.expiresAt?.toISOString(),
      syncable: options?.syncable,
      tableName: options?.tableName,
      createdAt: now,
      updatedAt: now,
    };

    const serialized = JSON.stringify(data);

    // 플랫폼별 저장 (현재는 모두 localStorage)
    switch (this.platform) {
      case 'android-webview':
        // 미래: (window as any).AndroidStorage?.set(key, serialized)
        localStorage.setItem(key, serialized);
        break;
      case 'ios-webview':
        // 미래: (window as any).webkit?.messageHandlers?.storage?.postMessage({action: 'set', key, value: serialized})
        localStorage.setItem(key, serialized);
        break;
      default:
        localStorage.setItem(key, serialized);
    }
  }

  /**
   * 데이터 조회
   */
  get<T>(key: string, defaultValue?: T): T | null {
    if (typeof window === 'undefined') return defaultValue ?? null;

    let raw: string | null = null;

    // 플랫폼별 조회 (현재는 모두 localStorage)
    switch (this.platform) {
      case 'android-webview':
        raw = localStorage.getItem(key);
        break;
      case 'ios-webview':
        raw = localStorage.getItem(key);
        break;
      default:
        raw = localStorage.getItem(key);
    }

    if (!raw) return defaultValue ?? null;

    try {
      const data: StoredData<T> = JSON.parse(raw);

      // 만료 체크
      if (isExpired(data.expiresAt)) {
        this.remove(key);
        return defaultValue ?? null;
      }

      return data.value;
    } catch {
      // 기존 localStorage 데이터 호환 (래퍼 없이 저장된 경우)
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as T;
      }
    }
  }

  /**
   * Raw 값 직접 저장 (기존 localStorage와 호환)
   * 래퍼 없이 직접 저장
   */
  setRaw(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  }

  /**
   * Raw 값 직접 조회 (기존 localStorage와 호환)
   */
  getRaw(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  }

  /**
   * 데이터 삭제
   */
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  /**
   * 전체 삭제 (주의: 모든 데이터 삭제)
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }

  /**
   * 모든 키 조회
   */
  keys(): string[] {
    if (typeof window === 'undefined') return [];

    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }

  /**
   * 키 존재 여부 확인
   */
  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(key) !== null;
  }

  /**
   * 저장소 크기 (바이트)
   */
  getSize(): number {
    if (typeof window === 'undefined') return 0;

    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        size += key.length;
        size += localStorage.getItem(key)?.length ?? 0;
      }
    }
    return size * 2; // UTF-16 = 2 bytes per char
  }

  /**
   * 패턴에 맞는 키들 조회
   */
  getKeysByPattern(pattern: RegExp): string[] {
    return this.keys().filter((key) => pattern.test(key));
  }

  /**
   * 패턴에 맞는 키들 삭제
   */
  removeByPattern(pattern: RegExp): void {
    const keysToRemove = this.getKeysByPattern(pattern);
    keysToRemove.forEach((key) => this.remove(key));
  }

  /**
   * 현재 플랫폼 조회
   */
  getPlatform(): Platform {
    return this.platform;
  }

  /**
   * 저장소 길이
   */
  get length(): number {
    if (typeof window === 'undefined') return 0;
    return localStorage.length;
  }

  /**
   * 인덱스로 키 조회
   */
  key(index: number): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.key(index);
  }
}

// 싱글톤 인스턴스
export const mobileStorage = new MobileStorage();

// 타입 변환 헬퍼 함수들 export
export { detectType, serializeValue, deserializeValue };
