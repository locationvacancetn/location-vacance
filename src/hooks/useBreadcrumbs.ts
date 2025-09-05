import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useUserRole } from './useUserRole';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

/**
 * Hook pour générer des breadcrumbs dynamiques basés sur la route actuelle
 */
export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();
  const { userRole } = useUserRole();
  const pathname = location.pathname;

  return useMemo(() => {
    const breadcrumbs: BreadcrumbItem[] = [];

    // Toujours commencer par le dashboard
    breadcrumbs.push({
      label: 'Dashboard',
      path: ROUTES.DASHBOARD,
    });

    // Mapping des routes vers les labels
    const routeLabels: Record<string, string> = {
      [ROUTES.DASHBOARD_PROFILE]: 'Mon Profil',
      [ROUTES.DASHBOARD_PROPERTIES]: 'Mes Propriétés',
      [ROUTES.DASHBOARD_BOOKINGS]: 'Réservations',
      [ROUTES.DASHBOARD_MY_BOOKINGS]: 'Mes Réservations',
      [ROUTES.DASHBOARD_SEARCH]: 'Rechercher',
      [ROUTES.DASHBOARD_FAVORITES]: 'Mes Favoris',
      [ROUTES.DASHBOARD_MESSAGES]: 'Messages',
      [ROUTES.DASHBOARD_FINANCES]: 'Finances',
      [ROUTES.DASHBOARD_ANALYTICS]: 'Statistiques',
      [ROUTES.DASHBOARD_MANAGED_PROPERTIES]: 'Propriétés Gérées',
      [ROUTES.DASHBOARD_MANAGE_BOOKINGS]: 'Gestion Réservations',
      [ROUTES.DASHBOARD_MAINTENANCE]: 'Maintenance',
      [ROUTES.DASHBOARD_REPORTS]: 'Rapports',
      [ROUTES.DASHBOARD_USERS]: 'Gestion Utilisateurs',
      [ROUTES.DASHBOARD_ALL_PROPERTIES]: 'Toutes les Propriétés',
      [ROUTES.DASHBOARD_ALL_BOOKINGS]: 'Toutes les Réservations',
      [ROUTES.DASHBOARD_SYSTEM]: 'Système',
      [ROUTES.DASHBOARD_LOGS]: 'Logs & Analytics',
      [ROUTES.DASHBOARD_SETTINGS]: 'Paramètres',
      [ROUTES.DASHBOARD_HELP]: 'Aide',
    };

    // Si ce n'est pas la page d'accueil du dashboard, ajouter la page actuelle
    if (pathname !== ROUTES.DASHBOARD) {
      const currentPageLabel = routeLabels[pathname];
      if (currentPageLabel) {
        breadcrumbs.push({
          label: currentPageLabel,
          isActive: true,
        });
      } else {
        // Pour les routes dynamiques ou non reconnues
        const pathSegments = pathname.split('/').filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1];
        
        if (lastSegment && lastSegment !== 'dashboard') {
          breadcrumbs.push({
            label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1),
            isActive: true,
          });
        }
      }
    } else {
      // Page d'accueil du dashboard
      breadcrumbs[0].isActive = true;
    }

    return breadcrumbs;
  }, [pathname, userRole]);
};
