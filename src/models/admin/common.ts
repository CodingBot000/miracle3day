/**
 * Common type definitions shared across the application
 */

/**
 * Product option for treatments
 * Used to define pricing and options for specific treatments
 */
export interface ProductOption {
  id: string;
  treatmentKey: string;
  value1: number;
  value2: number;
}

/**
 * Tab type for categorizing treatments or devices by department
 */
export type TabType = 'skin' | 'plastic';

/**
 * Main tab type for the upload wizard
 */
export type MainTabType = 'treatment' | 'device';
