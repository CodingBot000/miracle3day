// 	서버 전용 비동기 함수
// DB사용 

import type { Currency } from './types';
import { FALLBACK_RATES, getCurrencyPair } from './types';
import { fetchExchangeRateFromAPI } from './api';
import {
  getExchangeRateFromDB,
  updateExchangeRateInDB,
  isRateExpired,
} from './db';

// 메모리 캐시 (서버리스 환경에서도 요청 중에는 유지됨)
const rateCache: Map<string, { rate: number; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5분

/**
 * 백그라운드에서 환율을 업데이트합니다 (non-blocking)
 */
async function updateRateInBackground(
  base: Currency,
  target: Currency,
  currencyPair: string
): Promise<void> {
  try {
    const apiRate = await fetchExchangeRateFromAPI(base, target);
    if (apiRate && apiRate > 0) {
      await updateExchangeRateInDB(currencyPair, apiRate, 'api');
      // 캐시 업데이트
      rateCache.set(currencyPair, { rate: apiRate, timestamp: Date.now() });
      console.log(`Exchange rate updated: ${currencyPair} = ${apiRate}`);
    }
  } catch (error) {
    console.error('Background exchange rate update failed:', error);
  }
}

/**
 * 유효한 환율을 가져옵니다 (비동기 - 서버 사이드용)
 * - DB에서 환율 조회
 * - 24시간 지났으면 백그라운드로 API 호출해서 DB 업데이트 (non-blocking)
 * - 현재 값 즉시 반환 (DB값 또는 fallback)
 */
export async function getValidatedRate(
  base: Currency,
  target: Currency
): Promise<number> {
  const currencyPair = getCurrencyPair(base, target);
  const fallbackRate = FALLBACK_RATES[currencyPair] ?? 0;

  try {
    // 메모리 캐시 확인
    const cached = rateCache.get(currencyPair);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.rate;
    }

    // DB에서 환율 조회
    const dbRate = await getExchangeRateFromDB(currencyPair);

    if (dbRate) {
      // 캐시 업데이트
      rateCache.set(currencyPair, { rate: dbRate.rate, timestamp: Date.now() });

      // 24시간 지났으면 백그라운드로 업데이트 시작 (non-blocking)
      if (isRateExpired(dbRate.updated_at)) {
        updateRateInBackground(base, target, currencyPair).catch(() => {});
      }
      return dbRate.rate;
    }

    // DB에 데이터가 없으면 API 호출 시도
    const apiRate = await fetchExchangeRateFromAPI(base, target);
    if (apiRate && apiRate > 0) {
      // DB에 저장 (non-blocking)
      updateExchangeRateInDB(currencyPair, apiRate, 'api').catch(() => {});
      // 캐시 업데이트
      rateCache.set(currencyPair, { rate: apiRate, timestamp: Date.now() });
      return apiRate;
    }

    // API도 실패하면 fallback 반환
    return fallbackRate;
  } catch (error) {
    console.error('Failed to get validated rate:', error);
    return fallbackRate;
  }
}

/**
 * 현재 KRW->USD 환율을 동기적으로 반환합니다 (클라이언트 사이드 호환용)
 * - 캐시된 값이 있으면 반환
 * - 없으면 fallback 반환
 * - 백그라운드에서 DB 업데이트 트리거
 */
export function getCurrentExchangeRate(): number {
  const currencyPair = 'KRW_USD';
  const fallbackRate = FALLBACK_RATES[currencyPair] ?? 0.00072;

  // 캐시 확인
  const cached = rateCache.get(currencyPair);
  if (cached) {
    return cached.rate;
  }

  // 백그라운드에서 DB 조회 및 캐시 업데이트 (non-blocking)
  getValidatedRate('KRW', 'USD').catch(() => {});

  return fallbackRate;
}

/**
 * 동기적 KRW->USD 환율 반환 (기존 API 호환)
 */
export const getKRWToUSD = (): number => getCurrentExchangeRate();

/**
 * 동기적 KRW를 USD로 변환 (기존 API 호환)
 */
export const krwToUsdSync = (krw: number): number =>
  Math.round(krw * getCurrentExchangeRate());

/**
 * 원화를 달러로 변환
 */
export async function krwToUsd(krw: number): Promise<number> {
  const rate = await getValidatedRate('KRW', 'USD');
  return Math.round(krw * rate);
}

/**
 * 원화를 엔화로 변환
 */
export async function krwToJpy(krw: number): Promise<number> {
  const rate = await getValidatedRate('KRW', 'JPY');
  return Math.round(krw * rate);
}

/**
 * 원화를 홍콩달러로 변환
 */
export async function krwToHkd(krw: number): Promise<number> {
  const rate = await getValidatedRate('KRW', 'HKD');
  return Math.round(krw * rate);
}

/**
 * 원화를 위안화로 변환
 */
export async function krwToCny(krw: number): Promise<number> {
  const rate = await getValidatedRate('KRW', 'CNY');
  return Math.round(krw * rate);
}

/**
 * 원화를 대만달러로 변환
 */
export async function krwToTwd(krw: number): Promise<number> {
  const rate = await getValidatedRate('KRW', 'TWD');
  return Math.round(krw * rate);
}



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
export const formatCNY = (cny: number) => `¥${cny.toLocaleString("zh-CN")}`;

/**
 * TWD 포맷 (대만 달러)
 */
export const formatTWD = (twd: number) => `NT$${twd.toLocaleString("zh-TW")}`;
