/**
 * API response type definitions
 */

/**
 * Standard API response format
 * Used across all API endpoints for consistent response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: string;
}
