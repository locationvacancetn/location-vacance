import { useUserRole } from '@/hooks/useUserRole';
import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';
import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';

// Import des dashboards par rôle
import AdminDashboard from './admin/AdminDashboard';
import OwnerDashboard from './owner/OwnerDashboard';
import TenantDashboard from './tenant/TenantDashboard';
import ManagerDashboard from './manager/ManagerDashboard';

export const DashboardRouter = () => {
  const { userRole, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirection basée sur le rôle
  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return (
          <RoleProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleProtectedRoute>
        );
      case 'owner':
        return (
          <RoleProtectedRoute allowedRoles={['owner']}>
            <OwnerDashboard />
          </RoleProtectedRoute>
        );
      case 'tenant':
        return (
          <RoleProtectedRoute allowedRoles={['tenant']}>
            <TenantDashboard />
          </RoleProtectedRoute>
        );
      case 'manager':
        return (
          <RoleProtectedRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </RoleProtectedRoute>
        );
      default:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Rôle non reconnu
              </h1>
              <p className="text-muted-foreground">
                Votre rôle utilisateur n'est pas reconnu. Veuillez contacter l'administrateur.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};
