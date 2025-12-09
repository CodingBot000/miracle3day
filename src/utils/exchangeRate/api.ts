// src/utils/exchangeRate/api.ts

import type { Currency } from './types';

/**
 * frankfurter.dev API에서 환율 데이터를 가져옵니다
 * @param base 기준 통화
 * @param target 대상 통화
 * @returns 환율 값 또는 null (실패 시)
 */
export async function fetchExchangeRateFromAPI(
  base: Currency,
  target: Currency
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${target}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: {
      amount: number;
      base: string;
      date: string;
      rates: Record<string, number>;
    } = await response.json();

    // 환율 값 반환 (1 base → target)
    return data.rates[target] ?? null;
  } catch (error) {
    console.error('Failed to fetch exchange rate from API:', error);
    return null;
  }
}
