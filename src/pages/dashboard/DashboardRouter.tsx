import { useUserRole } from '@/hooks/useUserRole';
import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';
import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Routes, Route } from 'react-router-dom';

// Import des dashboards par rôle
import AdminDashboard from './admin/AdminDashboard';
import OwnerDashboard from './owner/OwnerDashboard';
import TenantDashboard from './tenant/TenantDashboard';
import AdvertiserDashboard from './advertiser/AdvertiserDashboard';

// Import des pages Messages par rôle
import AdminMessages from './messages/AdminMessages';
import OwnerMessages from './messages/OwnerMessages';
import TenantMessages from './messages/TenantMessages';
import AdvertiserMessages from './messages/AdvertiserMessages';

export const DashboardRouter = () => {
  const { userRole, loading, error } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Chargement du dashboard..." 
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-500 mb-4">Erreur lors du chargement</p>
          <p className="text-sm text-muted-foreground">{error}</p>
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
      case 'advertiser':
        return (
          <RoleProtectedRoute allowedRoles={['advertiser']}>
            <AdvertiserDashboard />
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
      <Routes>
        {/* Route principale du dashboard */}
        <Route path="/" element={renderDashboard()} />
        
        {/* Routes Messages par rôle */}
        <Route 
          path="/messages" 
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'owner', 'tenant', 'advertiser']}>
              {userRole === 'admin' && <AdminMessages />}
              {userRole === 'owner' && <OwnerMessages />}
              {userRole === 'tenant' && <TenantMessages />}
              {userRole === 'advertiser' && <AdvertiserMessages />}
            </RoleProtectedRoute>
          } 
        />
      </Routes>
    </DashboardLayout>
  );
};
