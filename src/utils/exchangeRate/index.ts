// src/utils/exchangeRate/index.ts

// Public API - 동기적 함수들 (클라이언트 사이드 사용 가능)
// DB 의존성 없음 - 클라이언트/서버 모두에서 안전하게 사용 가능
export {
  getCurrentExchangeRate,
  getKRWToUSD,
  krwToUsdSync,
  formatKRW,
  formatUSD,
  formatJPY,
  formatHKD,
  formatCNY,
  formatTWD,
} from './converter-client';

// Currency Info
export { getCurrencyInfo } from './currencyInfo';
export type { CurrencyInfo } from './currencyInfo';

// Types
export type { Currency, ExchangeRateData } from './types';
export { FALLBACK_RATES, getCurrencyPair } from './types';

// NOTE: 비동기 DB 기반 함수들 (서버 사이드 전용)은
// '@/utils/exchangeRate/converter'에서 직접 import하세요
// 예: import { getValidatedRate, krwToUsd } from '@/utils/exchangeRate/converter';
