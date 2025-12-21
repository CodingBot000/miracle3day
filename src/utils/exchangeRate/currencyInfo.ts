// src/utils/exchangeRate/currencyInfo.ts
// Locale에 따른 통화 정보를 제공하는 유틸리티

import { FALLBACK_RATES } from './types';

/**
 * 통화 정보 타입
 */
export interface CurrencyInfo {
  rate: number;
  symbol: string;
  localeStr: string;
}

/**
 * Locale에 따른 환율 및 통화 정보
 * @param locale - 언어/지역 코드 (ko, en, ja, zh-CN, zh-TW 등)
 * @returns 환율, 통화 기호, 로케일 문자열을 포함한 객체
 */
export const getCurrencyInfo = (locale: string): CurrencyInfo => {
  switch (locale) {
    case 'ko':
      return {
        rate: 1, // KRW는 기준
        symbol: '₩',
        localeStr: 'ko-KR'
      };
    case 'en':
      return {
        rate: FALLBACK_RATES['KRW_USD'] ?? 0.00072,
        symbol: '$',
        localeStr: 'en-US'
      };
    case 'ja':
      return {
        rate: FALLBACK_RATES['KRW_JPY'] ?? 0.11,
        symbol: '¥',
        localeStr: 'ja-JP'
      };
    case 'zh-CN':
      return {
        rate: FALLBACK_RATES['KRW_CNY'] ?? 0.0052,
        symbol: '元',
        localeStr: 'zh-CN'
      };
    case 'zh-TW':
      return {
        rate: FALLBACK_RATES['KRW_TWD'] ?? 0.023,
        symbol: 'NT$',
        localeStr: 'zh-TW'
      };
    default:
      // 기본값은 USD
      return {
        rate: FALLBACK_RATES['KRW_USD'] ?? 0.00072,
        symbol: '$',
        localeStr: 'en-US'
      };
  }
};
