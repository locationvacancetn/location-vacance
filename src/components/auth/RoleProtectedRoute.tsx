import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
  requireAuth?: boolean;
}

export const RoleProtectedRoute = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/',
  requireAuth = true 
}: RoleProtectedRouteProps) => {
  const { userRole, loading, error } = useUserRole();
  const location = useLocation();

  // Affichage du loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertTitle>Erreur d'authentification</AlertTitle>
          <AlertDescription>
            Une erreur s'est produite lors de la vérification de vos permissions. 
            Veuillez vous reconnecter.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Vérification de l'authentification si requise
  if (requireAuth && !userRole) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Vérification des rôles autorisés
  if (userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              Rôles autorisés : {allowedRoles.join(', ')}
            </span>
            <span className="text-sm text-muted-foreground">
              Votre rôle : {userRole}
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Si tout est ok, afficher le contenu
  return <>{children}</>;
};

