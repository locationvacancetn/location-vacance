import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Activity,
  Search,
  Heart,
  Star
} from 'lucide-react';

const DashboardHome = () => {
  const { userRole, userProfile, loading, error } = useUserRole();
  const { navigateToRoleRoute } = useNavigation();
  const logger = useLogger('DashboardHome');

  // Log de rendu pour debug (seulement en développement)
  logger.debug('Component rendered', { userRole, loading, error });

  if (loading) {
    logger.debug('Loading state active');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    logger.error('Error state active', { error });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  // Fallback si userRole est null/undefined après le chargement
  if (!loading && !userRole) {
    logger.warn('User role not defined after loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-orange-600 mb-4">Rôle utilisateur non défini</p>
          <p className="text-gray-600 mb-4">Veuillez contacter l'administrateur</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  // Données simulées basées sur le rôle
  const getDashboardData = () => {
    switch (userRole) {
      case 'owner':
        return {
          title: 'Dashboard Propriétaire',
          description: 'Vue d\'ensemble de vos propriétés et réservations',
          stats: [
            { 
              title: 'Propriétés', 
              value: '4', 
              change: '+2 ce mois', 
              icon: Building,
              trend: 'up' 
            },
            { 
              title: 'Réservations', 
              value: '23', 
              change: '+12%', 
              icon: Calendar,
              trend: 'up' 
            },
            { 
              title: 'Revenus', 
              value: '€3,450', 
              change: '+18%', 
              icon: DollarSign,
              trend: 'up' 
            },
            { 
              title: 'Taux d\'occupation', 
              value: '85%', 
              change: '+5%', 
              icon: TrendingUp,
              trend: 'up' 
            }
          ]
        };

      case 'tenant':
        return {
          title: 'Mon Espace Locataire',
          description: 'Gérez vos réservations et découvrez de nouvelles propriétés',
          stats: [
            { 
              title: 'Réservations Actives', 
              value: '2', 
              change: 'En cours', 
              icon: Calendar,
              trend: 'neutral' 
            },
            { 
              title: 'Favoris', 
              value: '8', 
              change: '+3 cette semaine', 
              icon: Building,
              trend: 'up' 
            },
            { 
              title: 'Avis Donnés', 
              value: '15', 
              change: 'Note moy: 4.8/5', 
              icon: Activity,
              trend: 'up' 
            }
          ]
        };

      case 'manager':
        return {
          title: 'Dashboard Gestionnaire',
          description: 'Supervision des propriétés sous votre gestion',
          stats: [
            { 
              title: 'Propriétés Gérées', 
              value: '12', 
              change: '+1 ce mois', 
              icon: Building,
              trend: 'up' 
            },
            { 
              title: 'Réservations', 
              value: '67', 
              change: '+23%', 
              icon: Calendar,
              trend: 'up' 
            },
            { 
              title: 'Maintenance', 
              value: '3', 
              change: 'En attente', 
              icon: Activity,
              trend: 'neutral' 
            }
          ]
        };

      case 'admin':
        return {
          title: 'Administration Système',
          description: 'Vue globale de la plateforme',
          stats: [
            { 
              title: 'Utilisateurs', 
              value: '1,234', 
              change: '+45 ce mois', 
              icon: Users,
              trend: 'up' 
            },
            { 
              title: 'Propriétés Totales', 
              value: '456', 
              change: '+12%', 
              icon: Building,
              trend: 'up' 
            },
            { 
              title: 'Revenus Platform', 
              value: '€12,340', 
              change: '+8%', 
              icon: DollarSign,
              trend: 'up' 
            },
            { 
              title: 'Activité', 
              value: '98%', 
              change: 'Système actif', 
              icon: Activity,
              trend: 'up' 
            }
          ]
        };

      default:
        return {
          title: 'Dashboard',
          description: 'Bienvenue sur votre tableau de bord',
          stats: []
        };
    }
  };

  const dashboardData = getDashboardData();

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      owner: "bg-blue-500 text-white",
      tenant: "bg-green-500 text-white", 
      manager: "bg-orange-500 text-white",
      admin: "bg-red-500 text-white"
    };
    return colors[role as keyof typeof colors] || "bg-gray-500 text-white";
  };

  return (
    <ErrorBoundary context="DashboardHome">
      <div className="space-y-8 bg-gray-50 min-h-screen p-6">
      {/* Section Bienvenue */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bienvenue sur OripioFin</h2>
            <p className="text-gray-600">Votre tableau de bord de gestion immobilière</p>
          </div>
          <Badge className={getRoleBadgeColor(userRole || '')}>
            {userRole === 'owner' && 'Propriétaire'}
            {userRole === 'tenant' && 'Locataire'}
            {userRole === 'manager' && 'Gestionnaire'}
            {userRole === 'admin' && 'Administrateur'}
          </Badge>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardData.stats.map((stat, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-100">
                    <stat.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </h3>
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Section Propriétés Populaires */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Propriétés Populaires</h2>
            <p className="text-gray-600">Vos propriétés les plus réservées</p>
          </div>
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => navigateToRoleRoute('properties')}
          >
            Voir toutes
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Villa Sunrise', location: 'Sousse, Tunisie', price: 'TND 950/nuit', rating: 4.8, bookings: 23 },
            { name: 'Appartement Marina', location: 'Hammamet, Tunisie', price: 'TND 650/nuit', rating: 4.6, bookings: 18 },
            { name: 'Riad Médina', location: 'Tunis, Tunisie', price: 'TND 450/nuit', rating: 4.9, bookings: 31 }
          ].map((property, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Image de la propriété</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">{property.name}</h3>
                    <p className="text-sm text-gray-600">{property.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">{property.price}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600">{property.rating}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{property.bookings} réservations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Section Réservations Récentes */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Réservations Récentes</h2>
            <p className="text-gray-600">Dernières activités de réservation</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateToRoleRoute('bookings')}
            >
              Ce mois
            </Button>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => navigateToRoleRoute('bookings')}
            >
              Cette année
            </Button>
          </div>
        </div>

        {/* Graphique simple - placeholder */}
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 mb-2">Graphique des Réservations</div>
            <div className="text-sm text-gray-400">Jan à Déc 2024</div>
          </div>
        </div>
      </div>

      {/* Section Activités Récentes */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Activités Récentes</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des activités..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logger.debug('Filter button clicked')}
            >
              Filtrer
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { 
              activity: 'Nouvelle réservation', 
              property: 'Villa Sunrise', 
              client: 'Marie Dubois', 
              date: '15 Jan 2024', 
              time: '14:30', 
              amount: 'TND 2,850', 
              status: 'Confirmée' 
            },
            { 
              activity: 'Paiement reçu', 
              property: 'Appartement Marina', 
              client: 'Ahmed Ben Ali', 
              date: '14 Jan 2024', 
              time: '09:15', 
              amount: 'TND 1,950', 
              status: 'Payé' 
            },
            { 
              activity: 'Avis client', 
              property: 'Riad Médina', 
              client: 'Sophie Martin', 
              date: '13 Jan 2024', 
              time: '16:45', 
              amount: '5 étoiles', 
              status: 'Avisé' 
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{activity.activity}</h3>
                  <p className="text-sm text-gray-600">{activity.property} - {activity.client}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">{activity.date} à {activity.time}</div>
                <div className="font-medium text-gray-900">{activity.amount}</div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'Confirmée' ? 'bg-green-100 text-green-800' :
                  activity.status === 'Payé' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardHome;
