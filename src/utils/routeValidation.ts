/**
 * Utilitaire pour valider la cohérence des routes du dashboard
 * Vérifie que toutes les routes de la sidebar correspondent aux routes définies
 */

import { ROUTES } from '@/constants/routes';

// Configuration des menus par rôle (copie de DashboardSidebar)
const getMenuItems = (role: string) => {
  const commonItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profil', path: '/dashboard/profile' },
    { label: 'Paramètres', path: '/dashboard/settings' },
  ];

  switch (role) {
    case 'admin':
      return [
        ...commonItems,
        { label: 'Utilisateurs', path: '/dashboard/admin/users' },
        { label: 'Propriétés', path: '/dashboard/admin/properties' },
        { label: 'Villes & Régions', path: '/dashboard/admin/cities' },
        { label: 'Équipements', path: '/dashboard/admin/equipments' },
        { label: 'Caractéristiques', path: '/dashboard/admin/characteristics' },
        { label: 'Types', path: '/dashboard/admin/property-types' },
        { label: 'Konnect', path: '/dashboard/admin/konnect' },
        { label: 'Email', path: '/dashboard/admin/email' },
        { label: 'SEO', path: '/dashboard/admin/seo' },
      ];
    
    case 'owner':
      return [
        ...commonItems,
        { label: 'Mes Propriétés', path: '/dashboard/owner/properties' },
        { label: 'Calendrier', path: '/dashboard/owner/calendar' },
        { label: 'Réservations', path: '/dashboard/owner/bookings' },
        { label: 'Finances', path: '/dashboard/owner/finances' },
        { label: 'Analytics', path: '/dashboard/owner/analytics' },
      ];
    
    case 'tenant':
      return [
        ...commonItems,
        { label: 'Mes Réservations', path: '/dashboard/tenant/my-bookings' },
        { label: 'Rechercher', path: '/dashboard/tenant/search' },
        { label: 'Favoris', path: '/dashboard/tenant/favorites' },
      ];
    
    case 'advertiser':
      return [
        ...commonItems,
        { label: 'Mes Publicités', path: '/dashboard/advertiser/ads' },
        { label: 'Analytics', path: '/dashboard/advertiser/analytics' },
        { label: 'Campagnes', path: '/dashboard/advertiser/campaigns' },
        { label: 'Rapports', path: '/dashboard/advertiser/reports' },
      ];
    
    default:
      return commonItems;
  }
};

// Routes définies dans DashboardRouter (structure rôles)
const definedRoutes = {
  admin: [
    '/dashboard/admin/cities',
    '/dashboard/admin/equipments',
    '/dashboard/admin/characteristics',
    '/dashboard/admin/property-types',
    '/dashboard/admin/konnect',
    '/dashboard/admin/email',
    '/dashboard/admin/properties',
    '/dashboard/admin/seo',
    '/dashboard/admin/users',
    '/dashboard/admin/add-user',
    '/dashboard/admin/add-property',
    '/dashboard/admin/edit-property/:id',
  ],
  owner: [
    '/dashboard/owner/add-property',
    '/dashboard/owner/edit-property/:id',
    '/dashboard/owner/properties',
    '/dashboard/owner/calendar',
    '/dashboard/owner/bookings',
    '/dashboard/owner/finances',
    '/dashboard/owner/analytics',
    '/dashboard/owner/test-location',
    '/dashboard/owner/test-tables',
  ],
  tenant: [
    '/dashboard/tenant/my-bookings',
    '/dashboard/tenant/search',
    '/dashboard/tenant/favorites',
  ],
  advertiser: [
    '/dashboard/advertiser/ads',
    '/dashboard/advertiser/add-advertisement',
    '/dashboard/advertiser/edit-advertisement/:id',
    '/dashboard/advertiser/analytics',
    '/dashboard/advertiser/campaigns',
    '/dashboard/advertiser/reports',
  ],
};

/**
 * Valide que toutes les routes de la sidebar sont définies dans le router
 */
export const validateRoutes = () => {
  const roles = ['admin', 'owner', 'tenant', 'advertiser'];
  const errors: string[] = [];
  const warnings: string[] = [];

  roles.forEach(role => {
    const menuItems = getMenuItems(role);
    const definedRoleRoutes = definedRoutes[role as keyof typeof definedRoutes] || [];

    menuItems.forEach(item => {
      // Ignorer les routes communes qui sont gérées différemment
      if (item.path === '/dashboard' || item.path === '/dashboard/profile' || item.path === '/dashboard/settings') {
        return;
      }

      // Vérifier si la route est définie
      const isDefined = definedRoleRoutes.some(route => {
        // Gérer les routes dynamiques
        if (route.includes(':')) {
          const pattern = route.replace(/:[^/]+/g, '[^/]+');
          return new RegExp(`^${pattern}$`).test(item.path);
        }
        return route === item.path;
      });

      if (!isDefined) {
        errors.push(`Route manquante pour ${role}: ${item.path}`);
      }
    });
  });

  return { errors, warnings };
};

/**
 * Affiche un rapport de validation des routes
 */
export const printRouteValidationReport = () => {
  const { errors, warnings } = validateRoutes();
  
  console.log('🔍 Validation des Routes du Dashboard');
  console.log('=====================================');
  
  if (errors.length === 0) {
    console.log('✅ Toutes les routes sont correctement définies !');
  } else {
    console.log('❌ Erreurs trouvées :');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Avertissements :');
    warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  console.log('=====================================');
  return { errors, warnings };
};
