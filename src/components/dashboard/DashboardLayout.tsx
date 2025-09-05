import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';
import { useMemoizedConfig } from '@/hooks/useMemoizedConfig';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { ROUTES } from '@/constants/routes';

interface DashboardLayoutProps {
  title?: string;
  breadcrumb?: { label: string; path?: string }[];
}

// Fonction pour obtenir le titre de la page basé sur la route
const getPageTitle = (pathname: string): string => {
  const titleMap: Record<string, string> = {
    [ROUTES.DASHBOARD]: 'Dashboard',
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
    [ROUTES.DASHBOARD_HELP]: 'Aide'
  };
  
  return titleMap[pathname] || 'Dashboard';
};

export const DashboardLayout = ({ title, breadcrumb }: DashboardLayoutProps) => {
  // TEMPORAIREMENT DÉSACTIVÉ pour casser la boucle infinie
  // const { userRole, userProfile, loading, error } = useUserRole();
  const { navigateTo } = useNavigation();
  const logger = useLogger('DashboardLayout');
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Valeurs par défaut temporaires
  const userRole = 'tenant';
  const userProfile = { id: 'temp', full_name: 'Utilisateur', email: 'user@example.com', role: 'tenant' as const };
  const loading = false;
  const error = null;

  // Logs de debug
  console.log('DashboardLayout - userRole:', userRole);
  console.log('DashboardLayout - loading:', loading);
  console.log('DashboardLayout - error:', error);
  console.log('DashboardLayout - userProfile:', userProfile);

  // Tous les hooks doivent être appelés avant les conditions de retour
  const dashboardConfig = useMemoizedConfig(userRole);

  // Log de rendu pour debug (seulement en développement)
  logger.debug('Component rendered', { userRole, loading, error });
  
  // Titre dynamique basé sur la route
  const dynamicTitle = title || getPageTitle(location.pathname);

  // Auto-collapse sidebar sur mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(false);
      setMobileSidebarOpen(false);
    }
  }, [isMobile]);

  // Fermer la sidebar mobile lors du changement de route
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Gestion des états de chargement et d'erreur - TEMPORAIREMENT DÉSACTIVÉ POUR DEBUG
  if (loading) {
    console.log('DashboardLayout - Loading state active, but continuing to render for debug');
    // logger.debug('Loading state active');
    // return (
    //   <div className="min-h-screen bg-background flex items-center justify-center">
    //     <div className="flex flex-col items-center space-y-4">
    //       <Spinner className="h-8 w-8" />
    //       <p className="text-muted-foreground">Chargement du dashboard...</p>
    //     </div>
    //   </div>
    // );
  }

  if (error || !userRole) {
    console.log('DashboardLayout - Error state or no user role, but continuing to render for debug', { error, userRole });
    // logger.error('Error state or no user role', { error, userRole });
    // return (
    //   <div className="min-h-screen bg-background flex items-center justify-center p-4">
    //     <Alert className="max-w-md">
    //       <AlertDescription>
    //         {error || 'Impossible de charger les données utilisateur. Veuillez vous reconnecter.'}
    //       </AlertDescription>
    //     </Alert>
    //   </div>
    // );
  }

  logger.debug('Rendering dashboard', { userRole, configLoaded: !!dashboardConfig });

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Desktop */}
        {!isMobile && (
          <DashboardSidebar
            userRole={userRole}
            sidebarContent={dashboardConfig.sidebarContent}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />
        )}

        {/* Sidebar Mobile avec overlay */}
        {isMobile && (
          <>
            {/* Overlay */}
            {mobileSidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar Mobile */}
            <div className={`
              fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden
              ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
              <DashboardSidebar
                userRole={userRole}
                sidebarContent={dashboardConfig.sidebarContent}
                isCollapsed={false}
              />
            </div>
          </>
        )}

        {/* Contenu principal */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <DashboardHeader
            userProfile={userProfile}
            headerConfig={dashboardConfig.headerConfig}
            onToggleSidebar={handleToggleSidebar}
            title={dynamicTitle}
            breadcrumb={breadcrumb}
          />

          {/* Zone de contenu avec scroll */}
          <main className="flex-1 overflow-y-auto bg-white">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
