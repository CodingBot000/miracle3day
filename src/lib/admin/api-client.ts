/**
 * API Client - Comprehensive abstraction layer for all API calls
 *
 * This file provides a clean abstraction for ALL API calls in the application.
 * It's designed to be easily switchable between Next.js API routes and AWS API Gateway.
 *
 * To migrate to AWS:
 * 1. Set NEXT_PUBLIC_API_BASE_URL environment variable to your AWS API Gateway URL
 * 2. Update authentication headers if needed
 * 3. Test all endpoints
 *
 * See /docs/api_migration_to_aws.md for detailed migration guide
 */

import { ApiResponse } from './api-utils';
import { API_CONFIG } from '@/constants/api';
import { log } from "@/utils/logger";
// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * API Base URL Configuration
 * - Development/Production with Next.js API Routes: '' (empty string, same origin)
 * - AWS Migration: Set NEXT_PUBLIC_API_BASE_URL to your AWS API Gateway URL
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

/**
 * Build admin API URL with proper prefix
 * @param endpoint - API endpoint (e.g., '/upload/step1')
 * @returns Full URL with /api/admin prefix
 */
function buildAdminApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN_PREFIX}${cleanEndpoint}`;
}

// =============================================================================
// CORE HELPER FUNCTION
// =============================================================================

/**
 * Generic API call wrapper
 * Handles all HTTP requests with proper error handling and logging
 */
async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = buildAdminApiUrl(endpoint);
    log.info(`[API Client] Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    log.info(`[API Client] Response: ${response.status} ${response.statusText}`);

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || `HTTP error! status: ${response.status}`;
      console.error(`[API Client] Error: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`[API Client] Failed ${endpoint}:`, error);
    throw error;
  }
}

/**
 * API call for FormData (multipart/form-data)
 */
async function apiCallWithFormData<T = any>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  try {
    const url = buildAdminApiUrl(endpoint);
    log.info(`[API Client] FormData Request: POST ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    });

    log.info(`[API Client] FormData Response: ${response.status} ${response.statusText}`);

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || `HTTP error! status: ${response.status}`;
      console.error(`[API Client] FormData Error: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`[API Client] FormData Failed ${endpoint}:`, error);
    throw error;
  }
}

// =============================================================================
// ADMIN API
// =============================================================================

export const adminApi = {
  /**
   * Verify admin authentication and fetch hospital data
   * @param id - Auth user ID (optional - will use session if not provided)
   */
  verifyAuth: async (id?: string | number) => {
    // If ID is provided and valid, use it; otherwise let API use session
    const url = id && id.toString().trim() !== '' && id.toString() !== 'undefined' && id.toString() !== 'null'
      ? `/auth?id=${encodeURIComponent(id.toString())}`
      : '/auth';

    return apiCall<{
      adminExists: boolean;
      hasClinicInfo: boolean;
      admin: any;
      hospital: any;
    }>(url, {
      method: 'GET'
    });
  },

  /**
   * Create new admin entry
   * @param uid - Auth user ID
   * @param email - Admin email
   */
  createAdmin: async (email: string, passwordHash?: string) => {
    return apiCall<{ admin: any }>('/admin/auth', {
      method: 'POST',
      body: JSON.stringify({ email, passwordHash })
    });
  }
};

// =============================================================================
// CONSULTATION API
// =============================================================================

export const consultationApi = {
  /**
   * Fetch all consultation submissions
   * @param filters - Optional filters (status, limit)
   */
  getAll: async (filters?: { status?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall<{ submissions: any[] }>(`/consultation${query}`, {
      method: 'GET'
    });
  },

  /**
   * Update consultation submission
   * @param id_uuid - Consultation ID
   * @param updates - Fields to update (doctor_notes, status)
   */
  update: async (id_uuid: string, updates: { doctor_notes?: string; status?: string }) => {
    return apiCall<{ consultation: any }>('/consultation', {
      method: 'PATCH',
      body: JSON.stringify({ id_uuid, ...updates })
    });
  }
};

// =============================================================================
// SURGERY INFO API
// =============================================================================

export const surgeryApi = {
  /**
   * Fetch all surgery information
   * @param category - Optional category filter
   */
  getAll: async (category?: string) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiCall<{ surgeryInfo: any[] }>(`/surgery-info${query}`, {
      method: 'GET'
    });
  },

  /**
   * Fetch surgery info by category
   * @param category - Category to filter by
   */
  getByCategory: async (category: string) => {
    return surgeryApi.getAll(category);
  }
};

// =============================================================================
// TREATMENT SELECTION API
// =============================================================================

export const treatmentSelectionApi = {
  /**
   * Fetch treatment selections for a hospital
   * @param id_uuid_hospital - Hospital UUID
   */
  get: async (id_uuid_hospital: string) => {
    return apiCall<{
      treatmentSelection: {
        skinTreatmentIds: string[];
        plasticTreatmentIds: string[];
        deviceIds: string[];
      }
    }>(`/treatment-selection?id_uuid_hospital=${encodeURIComponent(id_uuid_hospital)}`, {
      method: 'GET'
    });
  }
};

// =============================================================================
// HOSPITAL API
// =============================================================================

export const hospitalApi = {
  /**
   * Fetch complete hospital preview data (replaces 9 separate queries)
   * @param id_uuid_hospital - Hospital UUID
   */
  getPreview: async (id_uuid_hospital: string) => {
    // Validate hospital ID before making request
    if (!id_uuid_hospital || id_uuid_hospital.trim() === '' || id_uuid_hospital === 'undefined' || id_uuid_hospital === 'null') {
      return {
        success: false,
        error: 'Invalid hospital ID provided',
        data: null
      };
    }

    return apiCall<{ hospital: any }>(`/hospital/preview?id_uuid_hospital=${encodeURIComponent(id_uuid_hospital)}`, {
      method: 'GET'
    });
  },

  /**
   * Fetch hospital name only
   * @param id_uuid - Hospital UUID
   */
  getName: async (id_uuid: string) => {
    return apiCall<{ name: string; name_en: string }>(`/hospital/name?id_uuid=${encodeURIComponent(id_uuid)}`, {
      method: 'GET'
    });
  }
};

// =============================================================================
// RESERVATION API
// =============================================================================

export const reservationApi = {
  /**
   * Fetch reservations for a hospital
   * @param id_uuid_hospital - Hospital UUID
   */
  getByHospital: async (id_uuid_hospital: string) => {
    return apiCall<{ reservationData: any[] }>(`/reservation?id_uuid_hospital=${encodeURIComponent(id_uuid_hospital)}`, {
      method: 'GET'
    });
  }
};

// =============================================================================
// TREATMENT CATEGORIES API
// =============================================================================

export const treatmentCategoriesApi = {
  /**
   * Fetch all treatment categories
   */
  getAll: async () => {
    return apiCall<any>('/treatment-categories', {
      method: 'GET'
    });
  }
};

// =============================================================================
// DEVICES API
// =============================================================================

export const devicesApi = {
  /**
   * Fetch all devices
   */
  getAll: async () => {
    return apiCall<any>('/devices', {
      method: 'GET'
    });
  }
};

// =============================================================================
// UPLOAD API (Multi-step form)
// =============================================================================

export const uploadAPI = {
  /**
   * Step 1: Basic hospital information
   */
  step1: async (formData: FormData): Promise<ApiResponse> => {
    log.info('[API Client] Upload Step1');
    return apiCallWithFormData('/upload/step1', formData);
  },

  /**
   * Step 2: Contact information
   */
  step2: async (formData: FormData): Promise<ApiResponse> => {
    log.info('[API Client] Upload Step2');
    return apiCallWithFormData('/upload/step2', formData);
  },

  /**
   * Step 3: Business hours and facilities
   */
  step3: async (formData: FormData): Promise<ApiResponse> => {
    log.info('[API Client] Upload Step3');
    return apiCallWithFormData('/upload/step3', formData);
  },

  /**
   * Step 4: Images and doctor information
   */
  step4: async (formData: FormData): Promise<ApiResponse> => {
    log.info('[API Client] Upload Step4');
    return apiCallWithFormData('/upload/step4', formData);
  },

  /**
   * Step 5: Treatment information
   */
  step5: async (formData: FormData): Promise<ApiResponse> => {
    log.info('[API Client] Upload Step5');
    return apiCallWithFormData('/upload/step5', formData);
  },

  /**
   * Step 6: Procedure/equipment information
   */
  step6: async (formData: FormData): Promise<ApiResponse> => {
    log.info('[API Client] Upload Step6');
    return apiCallWithFormData('/upload/step6', formData);
  },

  /**
   * Step Last: Language settings and feedback
   */
  step_last: async (formData: FormData): Promise<ApiResponse> => {
    log.info('[API Client] Upload Step_last');
    return apiCallWithFormData('/upload/step_last', formData);
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format API error for display
 */
export function formatApiError(error: any): string {
  log.info('[API Client] Formatting error:', error);

  if (error?.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
}

/**
 * Check if API response is successful
 */
export function isApiSuccess(response: ApiResponse): boolean {
  return response.status === 'success' || response.success === true;
}

/**
 * Check if API response is an error
 */
export function isApiError(response: ApiResponse): boolean {
  return response.status === 'error' || response.success === false;
}

// =============================================================================
// PRODUCT API
// =============================================================================

export const productAPI = {
  /**
   * Create product
   * @param data - Product data with options
   */
  create: async (data: any): Promise<ApiResponse> => {
    log.info('[API Client] Create Product');
    return apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Get product list by hospital
   * @param id_uuid_hospital - Hospital UUID
   */
  getList: async (id_uuid_hospital: string): Promise<ApiResponse> => {
    log.info('[API Client] Get Products');
    return apiCall(`/products?id_uuid_hospital=${encodeURIComponent(id_uuid_hospital)}`, {
      method: 'GET'
    });
  },

  /**
   * Get product detail
   * @param productId - Product UUID
   */
  getDetail: async (productId: string): Promise<ApiResponse> => {
    log.info('[API Client] Get Product Detail');
    return apiCall(`/products/${productId}`, {
      method: 'GET'
    });
  },

  /**
   * Update product
   * @param productId - Product UUID
   * @param data - Updated product data with options
   */
  update: async (productId: string, data: any): Promise<ApiResponse> => {
    log.info('[API Client] Update Product');
    return apiCall(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * Delete product (soft delete)
   * @param productId - Product UUID
   */
  delete: async (productId: string): Promise<ApiResponse> => {
    log.info('[API Client] Delete Product');
    return apiCall(`/products/${productId}`, {
      method: 'DELETE'
    });
  }
};

// =============================================================================
// UNIFIED API EXPORT
// =============================================================================

/**
 * Unified API object - Single import for all API calls
 *
 * Usage:
 * import { api } from '@/lib/api-client';
 *
 * const result = await api.admin.verifyAuth(uid);
 * const consultations = await api.consultation.getAll();
 * const hospital = await api.hospital.getPreview(id);
 */
export const api = {
  admin: adminApi,
  consultation: consultationApi,
  surgery: surgeryApi,
  treatmentSelection: treatmentSelectionApi,
  hospital: hospitalApi,
  product: productAPI,
  reservation: reservationApi,
  treatmentCategories: treatmentCategoriesApi,
  devices: devicesApi,
  upload: uploadAPI
};

// Keep existing exports for backward compatibility
