import { ReactNode } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TenantRouteGuardProps {
  children: ReactNode;
}

export const TenantRouteGuard = ({ children }: TenantRouteGuardProps) => {
  const { userRole, loading } = useUserRole();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Vérification des permissions..." />
      </div>
    );
  }

  if (userRole !== 'tenant' && userRole !== 'admin') {
    // Rediriger vers le dashboard approprié selon le rôle
    const redirectPath = userRole === 'admin' ? '/dashboard/admin' :
                        userRole === 'owner' ? '/dashboard/owner' :
                        userRole === 'advertiser' ? '/dashboard/advertiser' :
                        '/dashboard';
    
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
