import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  Building, 
  Calendar, 
  Wrench, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Star
} from "lucide-react";

const ManagerDashboard = () => {
  const { userProfile } = useUserRole();

  // Données d'exemple pour le gestionnaire
  const stats = [
    {
      title: "Propriétés Gérées",
      value: "15",
      change: "+3",
      changeType: "positive" as const,
      icon: Building,
      description: "Propriétés sous gestion"
    },
    {
      title: "Réservations",
      value: "42",
      change: "+12",
      changeType: "positive" as const,
      icon: Calendar,
      description: "Ce mois"
    },
    {
      title: "Maintenance",
      value: "8",
      change: "3 en cours",
      changeType: "neutral" as const,
      icon: Wrench,
      description: "Tâches actives"
    },
    {
      title: "Satisfaction",
      value: "4.7",
      change: "+0.3",
      changeType: "positive" as const,
      icon: Star,
      description: "Note moyenne"
    }
  ];

  const maintenanceTasks = [
    {
      id: 1,
      property: "Villa de luxe - Sidi Bou Said",
      task: "Réparation climatisation",
      priority: "high",
      dueDate: "20 Jan 2024",
      status: "in_progress"
    },
    {
      id: 2,
      property: "Appartement centre-ville",
      task: "Nettoyage après départ",
      priority: "medium",
      dueDate: "18 Jan 2024",
      status: "pending"
    },
    {
      id: 3,
      property: "Studio moderne",
      task: "Vérification sécurité",
      priority: "low",
      dueDate: "25 Jan 2024",
      status: "completed"
    }
  ];

  const recentBookings = [
    {
      id: 1,
      property: "Villa de luxe - Sidi Bou Said",
      guest: "Marie Dupont",
      checkIn: "15 Jan 2024",
      checkOut: "20 Jan 2024",
      status: "confirmed",
      amount: "€450"
    },
    {
      id: 2,
      property: "Appartement centre-ville",
      guest: "Ahmed Ben Ali",
      checkIn: "22 Jan 2024",
      checkOut: "25 Jan 2024",
      status: "pending",
      amount: "€180"
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Moyen</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Faible</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Terminé
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            En cours
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            En attente
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Annulée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tableau de Bord Gestionnaire
          </h1>
          <p className="text-muted-foreground">
            Bienvenue, {userProfile?.full_name || 'Gestionnaire'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Rapport
          </Button>
        </div>
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
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-blue-600'
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
        {/* Tâches de maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance
            </CardTitle>
            <CardDescription>
              Tâches de maintenance en cours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {maintenanceTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{task.property}</h4>
                  <p className="text-sm text-muted-foreground">{task.task}</p>
                  <p className="text-xs text-muted-foreground">Échéance: {task.dueDate}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              Voir toutes les tâches
            </Button>
          </CardContent>
        </Card>

        {/* Réservations récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Réservations Récentes
            </CardTitle>
            <CardDescription>
              Dernières réservations des propriétés gérées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{booking.property}</h4>
                  <p className="text-sm text-muted-foreground">{booking.guest}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>{booking.checkIn} - {booking.checkOut}</span>
                    <span className="font-medium text-foreground">{booking.amount}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getBookingStatusBadge(booking.status)}
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              Voir toutes les réservations
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Gestion rapide de vos propriétés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2 h-16">
              <Building className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Propriétés Gérées</div>
                <div className="text-xs text-muted-foreground">Gérer les propriétés</div>
              </div>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2 h-16">
              <Calendar className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Réservations</div>
                <div className="text-xs text-muted-foreground">Gérer les réservations</div>
              </div>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2 h-16">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Rapports</div>
                <div className="text-xs text-muted-foreground">Générer des rapports</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
