export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : ''),
  ADMIN_PREFIX: '/api/admin',
} as const;
