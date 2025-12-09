// src/utils/exchangeRate/db.ts

import { one, q } from '@/lib/db';
import type { ExchangeRateData } from './types';

interface ExchangeRateRow {
  currency_pair: string;
  rate: number;
  updated_at: Date;
  source: string;
}

/**
 * DB에서 환율 정보를 가져옵니다
 * @param currencyPair 통화쌍 (e.g., 'KRW_USD')
 */
export async function getExchangeRateFromDB(
  currencyPair: string
): Promise<ExchangeRateData | null> {
  try {
    const row = await one<ExchangeRateRow>(
      `SELECT currency_pair, rate, updated_at, source
       FROM exchange_rates
       WHERE currency_pair = $1`,
      [currencyPair]
    );

    if (!row) {
      return null;
    }

    return {
      currency_pair: row.currency_pair,
      rate: row.rate,
      updated_at: new Date(row.updated_at),
      source: row.source as 'api' | 'fallback',
    };
  } catch (error) {
    console.error('Failed to get exchange rate from DB:', error);
    return null;
  }
}

/**
 * DB에 환율 정보를 저장/업데이트합니다
 * @param currencyPair 통화쌍 (e.g., 'KRW_USD')
 * @param rate 환율
 * @param source 출처 ('api' | 'fallback')
 */
export async function updateExchangeRateInDB(
  currencyPair: string,
  rate: number,
  source: 'api' | 'fallback'
): Promise<boolean> {
  try {
    await q(
      `INSERT INTO exchange_rates (currency_pair, rate, source, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (currency_pair)
       DO UPDATE SET rate = $2, source = $3, updated_at = NOW()`,
      [currencyPair, rate, source]
    );
    return true;
  } catch (error) {
    console.error('Failed to update exchange rate in DB:', error);
    return false;
  }
}

/**
 * 환율 데이터가 만료되었는지 확인합니다 (24시간 기준)
 * @param updatedAt 마지막 업데이트 시간
 */
export function isRateExpired(updatedAt: Date): boolean {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return updatedAt < twentyFourHoursAgo;
}
