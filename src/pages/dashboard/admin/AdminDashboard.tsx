import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  Users, 
  Building, 
  Calendar, 
  Settings, 
  Activity, 
  Shield,
  TrendingUp,
  AlertTriangle,
  MapPin,
  CreditCard
} from "lucide-react";

const AdminDashboard = () => {
  const { userProfile } = useUserRole();

  // Données d'exemple pour l'admin
  const stats = [
    {
      title: "Utilisateurs Totaux",
      value: "1,234",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      description: "Utilisateurs actifs ce mois"
    },
    {
      title: "Propriétés",
      value: "456",
      change: "+8%",
      changeType: "positive" as const,
      icon: Building,
      description: "Propriétés enregistrées"
    },
    {
      title: "Réservations",
      value: "2,890",
      change: "+15%",
      changeType: "positive" as const,
      icon: Calendar,
      description: "Réservations ce mois"
    },
    {
      title: "Revenus",
      value: "€45,678",
      change: "+23%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Revenus totaux"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "user_registration",
      message: "Nouvel utilisateur inscrit: Marie Dupont",
      time: "Il y a 2 minutes",
      icon: Users
    },
    {
      id: 2,
      type: "property_added",
      message: "Nouvelle propriété ajoutée: Villa de luxe à Sidi Bou Said",
      time: "Il y a 15 minutes",
      icon: Building
    },
    {
      id: 3,
      type: "booking_confirmed",
      message: "Réservation confirmée: Appartement centre-ville",
      time: "Il y a 1 heure",
      icon: Calendar
    },
    {
      id: 4,
      type: "system_alert",
      message: "Alerte système: Sauvegarde automatique terminée",
      time: "Il y a 2 heures",
      icon: AlertTriangle
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-end">
        <Badge variant="destructive" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Administrateur
        </Badge>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className={`font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span>vs mois dernier</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              Activités Récentes
            </CardTitle>
            <CardDescription>
              Dernières actions sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <activity.icon className="h-4 w-4 text-muted-foreground mt-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions Rapides</CardTitle>
            <CardDescription>
              Gestion rapide de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Gérer les Utilisateurs
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Building className="mr-2 h-4 w-4" />
              Toutes les Propriétés
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Toutes les Réservations
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres Système
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dashboard/admin/cities">
                <MapPin className="mr-2 h-4 w-4" />
                Gestion Villes & Régions
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dashboard/admin/equipments">
                <Settings className="mr-2 h-4 w-4" />
                Gestion des Équipements
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dashboard/admin/property-types">
                <Building className="mr-2 h-4 w-4" />
                Gestion des Types de Propriétés
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dashboard/admin/konnect">
                <CreditCard className="mr-2 h-4 w-4" />
                Configuration Konnect
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
