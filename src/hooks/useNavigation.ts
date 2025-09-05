import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { ROUTES, buildRoute, isValidRoute } from '@/constants/routes';
import { UserRole } from '@/types/dashboard';
import { logger } from '@/lib/logger';
import { useUserRole } from './useUserRole';

interface NavigationOptions {
  replace?: boolean;
  state?: any;
  preventUnauthorized?: boolean;
}

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, isOwner, isTenant, isManager, isAdmin } = useUserRole();

  // Vérification des permissions pour les routes
  const canAccessRoute = useCallback((route: string): boolean => {
    // Routes publiques
    const publicRoutes = [
      ROUTES.HOME,
      ROUTES.LOGIN,
      ROUTES.SIGNUP,
      ROUTES.PROPERTY_DETAIL,
    ];

    if (publicRoutes.includes(route as any)) {
      return true;
    }

    // Routes dashboard - vérification des rôles
    if (route.startsWith('/dashboard')) {
      if (!userRole) return false;

      // Routes communes à tous les rôles
      const commonRoutes = [
        ROUTES.DASHBOARD,
        ROUTES.DASHBOARD_PROFILE,
        ROUTES.DASHBOARD_MESSAGES,
        ROUTES.DASHBOARD_SETTINGS,
        ROUTES.DASHBOARD_HELP,
      ];

      if (commonRoutes.includes(route as any)) {
        return true;
      }

      // Routes spécifiques par rôle
      const roleRoutes = {
        owner: [
          ROUTES.DASHBOARD_PROPERTIES,
          ROUTES.DASHBOARD_BOOKINGS,
          ROUTES.DASHBOARD_FINANCES,
          ROUTES.DASHBOARD_ANALYTICS,
        ],
        tenant: [
          ROUTES.DASHBOARD_MY_BOOKINGS,
          ROUTES.DASHBOARD_SEARCH,
          ROUTES.DASHBOARD_FAVORITES,
        ],
        manager: [
          ROUTES.DASHBOARD_MANAGED_PROPERTIES,
          ROUTES.DASHBOARD_MANAGE_BOOKINGS,
          ROUTES.DASHBOARD_MAINTENANCE,
          ROUTES.DASHBOARD_REPORTS,
        ],
        admin: [
          ROUTES.DASHBOARD_USERS,
          ROUTES.DASHBOARD_ALL_PROPERTIES,
          ROUTES.DASHBOARD_ALL_BOOKINGS,
          ROUTES.DASHBOARD_SYSTEM,
          ROUTES.DASHBOARD_LOGS,
        ],
      };

      const allowedRoutes = roleRoutes[userRole] || [];
      return allowedRoutes.includes(route as any);
    }

    return false;
  }, [userRole]);

  // Navigation sécurisée
  const navigateTo = useCallback((
    route: string, 
    options: NavigationOptions = {}
  ) => {
    const { replace = false, state, preventUnauthorized = true } = options;

    // Validation de la route
    if (!isValidRoute(route)) {
      logger.warn(`Invalid route attempted: ${route}`, 'Navigation');
      return false;
    }

    // Vérification des permissions
    if (preventUnauthorized && !canAccessRoute(route)) {
      logger.warn(
        `Unauthorized navigation attempt to: ${route} by role: ${userRole}`,
        'Navigation'
      );
      return false;
    }

    // Logging de la navigation
    logger.debug(`Navigating to: ${route}`, 'Navigation', {
      from: location.pathname,
      userRole,
      replace,
    });

    try {
      navigate(route, { replace, state });
      return true;
    } catch (error) {
      logger.error(`Navigation failed to: ${route}`, 'Navigation', { error });
      return false;
    }
  }, [navigate, location.pathname, canAccessRoute, userRole]);

  // Navigation avec construction de route dynamique
  const navigateToRoute = useCallback((
    routeKey: keyof typeof ROUTES,
    params?: Record<string, string | number>,
    options: NavigationOptions = {}
  ) => {
    const route = buildRoute(ROUTES[routeKey], params);
    return navigateTo(route, options);
  }, [navigateTo]);

  // Navigation rapide par rôle
  const navigateToRoleRoute = useCallback((
    routeName: string,
    options: NavigationOptions = {}
  ) => {
    const roleRoutes = {
      owner: {
        properties: ROUTES.DASHBOARD_PROPERTIES,
        bookings: ROUTES.DASHBOARD_BOOKINGS,
        finances: ROUTES.DASHBOARD_FINANCES,
        analytics: ROUTES.DASHBOARD_ANALYTICS,
      },
      tenant: {
        bookings: ROUTES.DASHBOARD_MY_BOOKINGS,
        search: ROUTES.DASHBOARD_SEARCH,
        favorites: ROUTES.DASHBOARD_FAVORITES,
      },
      manager: {
        properties: ROUTES.DASHBOARD_MANAGED_PROPERTIES,
        bookings: ROUTES.DASHBOARD_MANAGE_BOOKINGS,
        maintenance: ROUTES.DASHBOARD_MAINTENANCE,
        reports: ROUTES.DASHBOARD_REPORTS,
      },
      admin: {
        users: ROUTES.DASHBOARD_USERS,
        properties: ROUTES.DASHBOARD_ALL_PROPERTIES,
        bookings: ROUTES.DASHBOARD_ALL_BOOKINGS,
        system: ROUTES.DASHBOARD_SYSTEM,
        logs: ROUTES.DASHBOARD_LOGS,
      },
    };

    if (!userRole) return false;

    const route = roleRoutes[userRole]?.[routeName as keyof typeof roleRoutes[typeof userRole]];
    if (!route) {
      logger.warn(`Unknown route for role ${userRole}: ${routeName}`, 'Navigation');
      return false;
    }

    return navigateTo(route, options);
  }, [userRole, navigateTo]);

  // Navigation de retour sécurisée
  const goBack = useCallback((fallbackRoute: string = ROUTES.DASHBOARD) => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigateTo(fallbackRoute);
    }
  }, [navigate, navigateTo]);

  // Vérification si la route actuelle est accessible
  const isCurrentRouteAccessible = useCallback(() => {
    return canAccessRoute(location.pathname);
  }, [location.pathname, canAccessRoute]);

  return {
    navigateTo,
    navigateToRoute,
    navigateToRoleRoute,
    goBack,
    canAccessRoute,
    isCurrentRouteAccessible,
    currentPath: location.pathname,
  };
};
