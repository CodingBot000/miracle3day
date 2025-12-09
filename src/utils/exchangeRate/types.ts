// src/utils/exchangeRate/types.ts

export type Currency = 'KRW' | 'USD' | 'JPY' | 'HKD' | 'CNY' | 'TWD';

export interface ExchangeRateData {
  currency_pair: string; // e.g., 'KRW_USD'
  rate: number;
  updated_at: Date;
  source: 'api' | 'fallback';
}

// Fallback rates (approximate values as of 2024)
export const FALLBACK_RATES: Record<string, number> = {
  'KRW_USD': 0.00072,   // 1 KRW = 0.00072 USD
  'KRW_JPY': 0.11,      // 1 KRW = 0.11 JPY
  'KRW_HKD': 0.0056,    // 1 KRW = 0.0056 HKD
  'KRW_CNY': 0.0052,    // 1 KRW = 0.0052 CNY
  'KRW_TWD': 0.023,     // 1 KRW = 0.023 TWD
};

export function getCurrencyPair(base: Currency, target: Currency): string {
  return `${base}_${target}`;
}
