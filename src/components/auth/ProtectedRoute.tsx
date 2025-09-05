import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  console.log('ProtectedRoute - Component rendered');
  const { user, loading } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - loading:', loading);
  console.log('ProtectedRoute - user exists:', !!user);
  console.log('ProtectedRoute - user id:', user?.id);

  // Affichage du loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Redirection vers la page de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Si l'utilisateur est connecté, afficher le contenu
  return <>{children}</>;
};

