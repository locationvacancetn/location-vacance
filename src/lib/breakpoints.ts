/**
 * Constantes pour les z-index et les couleurs de rôles
 */

export const Z_INDEX = {
  mobileMenu: 9999,
  modal: 1000,
  dropdown: 999,
  tooltip: 998,
  overlay: 997,
} as const;

export const ROLE_COLORS = {
  destructive: 'text-red-600',
  default: 'text-blue-600',
  secondary: 'text-gray-600',
  outline: 'text-purple-600',
} as const;
