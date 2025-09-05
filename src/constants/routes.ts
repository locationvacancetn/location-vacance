/**
 * Constantes de routes centralisées
 * Garantit la cohérence et évite les erreurs de typage
 */

export const ROUTES = {
  // Routes publiques
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROPERTY_DETAIL: '/property/:id',
  TEST_AUTH: '/test-auth',
  NOT_FOUND: '*',

  // Routes dashboard
  DASHBOARD: '/dashboard',
} as const;

// Types pour la sécurité des routes
export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];

// Helper pour construire des routes dynamiques
export const buildRoute = (route: RoutePath, params?: Record<string, string | number>): string => {
  let path = route;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, String(value));
    });
  }
  return path;
};

// Validation des routes
export const isValidRoute = (path: string): boolean => {
  return Object.values(ROUTES).some(route => {
    if (route.includes(':')) {
      // Route dynamique - validation basique
      const pattern = route.replace(/:[^/]+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(path);
    }
    return route === path;
  });
};
