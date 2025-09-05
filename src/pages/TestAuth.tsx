import { AuthDebugger } from '@/components/auth/AuthDebugger';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, LogIn, Home, Settings, User, MessageSquare, HelpCircle, Building, Calendar, DollarSign, BarChart3, Search, Heart, Wrench, FileText, Users, Shield, Activity } from 'lucide-react';
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
                    <Link to={ROUTES.DASHBOARD}>
                      <Home className="w-4 h-4 mr-2" />
                      Dashboard Principal
                    </Link>
                  </Button>
                </div>

                {/* Liens vers les pages du dashboard */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Navigation Dashboard</h3>
                  
                  {/* Pages communes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Button asChild variant="outline" className="justify-start">
                      <Link to={ROUTES.DASHBOARD_PROFILE}>
                        <User className="w-4 h-4 mr-2" />
                        Profil
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                      <Link to={ROUTES.DASHBOARD_MESSAGES}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Messages
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                      <Link to={ROUTES.DASHBOARD_SETTINGS}>
                        <Settings className="w-4 h-4 mr-2" />
                        Paramètres
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                      <Link to={ROUTES.DASHBOARD_HELP}>
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Aide
                      </Link>
                    </Button>
                  </div>

                  {/* Pages propriétaire */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Pages Propriétaire</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_PROPERTIES}>
                          <Building className="w-4 h-4 mr-2" />
                          Mes Propriétés
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_BOOKINGS}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Réservations
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_FINANCES}>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Finances
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_ANALYTICS}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analytics
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Pages locataire */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Pages Locataire</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_MY_BOOKINGS}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Mes Réservations
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_SEARCH}>
                          <Search className="w-4 h-4 mr-2" />
                          Recherche
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_FAVORITES}>
                          <Heart className="w-4 h-4 mr-2" />
                          Favoris
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Pages gestionnaire */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Pages Gestionnaire</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_MANAGED_PROPERTIES}>
                          <Building className="w-4 h-4 mr-2" />
                          Propriétés Gérées
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_MANAGE_BOOKINGS}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Gérer Réservations
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_MAINTENANCE}>
                          <Wrench className="w-4 h-4 mr-2" />
                          Maintenance
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_REPORTS}>
                          <FileText className="w-4 h-4 mr-2" />
                          Rapports
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Pages administrateur */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Pages Administrateur</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_USERS}>
                          <Users className="w-4 h-4 mr-2" />
                          Utilisateurs
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_ALL_PROPERTIES}>
                          <Building className="w-4 h-4 mr-2" />
                          Toutes les Propriétés
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_ALL_BOOKINGS}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Toutes les Réservations
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_SYSTEM}>
                          <Shield className="w-4 h-4 mr-2" />
                          Système
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={ROUTES.DASHBOARD_LOGS}>
                          <Activity className="w-4 h-4 mr-2" />
                          Logs
                        </Link>
                      </Button>
                    </div>
                  </div>
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
