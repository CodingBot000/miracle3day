// src/utils/exchangeRateManager.ts

import { getKRWtoUSD } from './exchangeRate';
import { log } from './logger';

interface ExchangeRateData {
  rate: number;
  lastUpdated: Date;
  source: 'api' | 'fallback';
}

class ExchangeRateManager {
  private static instance: ExchangeRateManager;
  private exchangeRateData: ExchangeRateData = {
    rate: 0.00072, // Fallback rate
    lastUpdated: new Date(),
    source: 'fallback'
  };
  private isUpdating: boolean = false;

  private constructor() {
    // Initialize with API call
    this.updateExchangeRate();
  }

  public static getInstance(): ExchangeRateManager {
    if (!ExchangeRateManager.instance) {
      ExchangeRateManager.instance = new ExchangeRateManager();
    }
    return ExchangeRateManager.instance;
  }

  public async updateExchangeRate(): Promise<void> {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    try {
      log.debug('Updating exchange rate from API...');
      const apiRate = await getKRWtoUSD();
      
      if (apiRate && apiRate > 0) {
        this.exchangeRateData = {
          rate: apiRate,
          lastUpdated: new Date(),
          source: 'api'
        };
        log.debug(`Exchange rate updated from API: 1 KRW = ${apiRate} USD`);
      } else {
        log.warn('Failed to get exchange rate from API, using fallback rate');
        this.exchangeRateData = {
          ...this.exchangeRateData,
          lastUpdated: new Date(),
          source: 'fallback'
        };
      }
    } catch (error) {
      log.error('Error updating exchange rate:', error);
      this.exchangeRateData = {
        ...this.exchangeRateData,
        lastUpdated: new Date(),
        source: 'fallback'
      };
    } finally {
      this.isUpdating = false;
    }
  }

  public getCurrentRate(): number {
    return this.exchangeRateData.rate;
  }

  public getExchangeRateInfo(): ExchangeRateData {
    return { ...this.exchangeRateData };
  }

  public async getValidatedRate(): Promise<number> {
    // If rate is more than 1 hour old, try to update
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (this.exchangeRateData.lastUpdated < oneHourAgo && !this.isUpdating) {
      await this.updateExchangeRate();
    }
    
    return this.getCurrentRate();
  }
}

// Export singleton instance and helper functions
const exchangeRateManager = ExchangeRateManager.getInstance();

export const getCurrentExchangeRate = (): number => {
  return exchangeRateManager.getCurrentRate();
};

export const getExchangeRateInfo = (): ExchangeRateData => {
  return exchangeRateManager.getExchangeRateInfo();
};

export const updateExchangeRate = async (): Promise<void> => {
  await exchangeRateManager.updateExchangeRate();
};

export const getValidatedExchangeRate = async (): Promise<number> => {
  return await exchangeRateManager.getValidatedRate();
};

// Export the manager class for advanced usage
export { ExchangeRateManager };
export type { ExchangeRateData };