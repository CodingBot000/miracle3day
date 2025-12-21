// src/utils/exchangeRate/converter-client.ts
// 클라이언트/서버 공용 동기 함수  사용 가능한 동기적 환율 함수들
// DB 의존성 없음 - fallback 환율만 사용

import { FALLBACK_RATES } from './types';

/**
 * 현재 KRW->USD 환율을 동기적으로 반환합니다 (클라이언트 사이드용)
 * fallback 환율 사용
 */
export function getCurrentExchangeRate(): number {
  return FALLBACK_RATES['KRW_USD'] ?? 0.00072;
}

/**
 * 동기적 KRW->USD 환율 반환
 */
export const getKRWToUSD = (): number => getCurrentExchangeRate();

/**
 * 동기적 KRW를 USD로 변환
 */
export const krwToUsdSync = (krw: number): number =>
  Math.round(krw * getCurrentExchangeRate());

/**
 * USD 포맷 (미국 달러)
 */
export const formatUSD = (usd: number) => `$${usd.toLocaleString("en-US")}`;

/**
 * KRW 포맷 (한국 원화)
 */
export const formatKRW = (krw: number) => `₩${krw.toLocaleString("ko-KR")}`;

/**
 * JPY 포맷 (일본 엔화)
 */
export const formatJPY = (jpy: number) => `¥${jpy.toLocaleString("ja-JP")}`;

/**
 * HKD 포맷 (홍콩 달러)
 */
export const formatHKD = (hkd: number) => `HK$${hkd.toLocaleString("en-HK")}`;

/**
 * CNY 포맷 (중국 위안화)
 */
export const formatCNY = (cny: number) => `元${cny.toLocaleString("zh-CN")}`;

/**
 * TWD 포맷 (대만 달러)
 */
export const formatTWD = (twd: number) => `NT$${twd.toLocaleString("zh-TW")}`;
