import { AuthDebugger } from '@/components/auth/AuthDebugger';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, LogIn, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

/**
 * Page de test pour l'authentification
 * Permet de tester la gestion des erreurs de token de rafraîchissement
 */
export default function TestAuth() {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test d'Authentification</CardTitle>
            <CardDescription>
              Page de test pour vérifier la gestion des erreurs de token de rafraîchissement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Chargement...</p>
            ) : user ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Connecté en tant que:</span>
                  <span className="text-primary">{user.email}</span>
                  <span className="text-sm text-muted-foreground">({user.user_metadata?.role || 'N/A'})</span>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSignOut} variant="destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                  <Button asChild variant="outline">
                    <Link to={ROUTES.HOME}>
                      <Home className="w-4 h-4 mr-2" />
                      Retour à l'accueil
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to={ROUTES.DASHBOARD}>
                      <Home className="w-4 h-4 mr-2" />
                      Accéder au Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p>Vous n'êtes pas connecté</p>
                <Button asChild>
                  <Link to={ROUTES.LOGIN}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <AuthDebugger />
      </div>
    </div>
  );
}
