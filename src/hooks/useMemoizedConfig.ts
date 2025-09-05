import { useMemo } from 'react';
import { getDashboardConfig } from '@/configs/dashboardConfigs';
import { UserRole } from '@/types/dashboard';

/**
 * Hook pour mémoriser la configuration du dashboard
 * Évite les recalculs inutiles lors des re-renders
 */
export const useMemoizedConfig = (userRole: UserRole | null) => {
  return useMemo(() => {
    return getDashboardConfig(userRole || 'tenant');
  }, [userRole]);
};

/**
 * Hook pour mémoriser les permissions utilisateur
 */
export const useMemoizedPermissions = (userRole: UserRole | null) => {
  return useMemo(() => {
    const config = getDashboardConfig(userRole || 'tenant');
    return {
      permissions: config.permissions,
      canCreate: config.permissions.includes('create'),
      canRead: config.permissions.includes('read'),
      canUpdate: config.permissions.includes('update'),
      canDelete: config.permissions.includes('delete'),
      canManage: config.permissions.includes('manage'),
      canAdmin: config.permissions.includes('admin'),
      canSystem: config.permissions.includes('system'),
    };
  }, [userRole]);
};

/**
 * Hook pour mémoriser les routes autorisées
 */
export const useMemoizedRoutes = (userRole: UserRole | null) => {
  return useMemo(() => {
    const config = getDashboardConfig(userRole || 'tenant');
    return config.sidebarContent.map(item => item.path);
  }, [userRole]);
};
