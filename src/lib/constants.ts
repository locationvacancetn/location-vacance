// Constantes de l'application
export const BAN_DURATION = {
  PERMANENT: '876000h', // 100 ans
  NONE: 'none'
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  ADVERTISER: 'advertiser',
  TENANT: 'tenant'
} as const;

export const API_ENDPOINTS = {
  SUPABASE_AUTH: 'https://snrlnfldhbopiyjwnjlu.supabase.co/auth/v1/admin/users'
} as const;
