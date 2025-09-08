import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { 
  Building, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Plus,
  TrendingUp,
  Star,
  MapPin
} from "lucide-react";

const OwnerDashboard = () => {
  const { userProfile } = useUserRole();
  const navigate = useNavigate();

  // Données d'exemple pour le propriétaire
  const stats = [
    {
      title: "Mes Propriétés",
      value: "8",
      change: "+2",
      changeType: "positive" as const,
      icon: Building,
      description: "Propriétés actives"
    },
    {
      title: "Réservations",
      value: "24",
      change: "+5",
      changeType: "positive" as const,
      icon: Calendar,
      description: "Ce mois"
    },
    {
      title: "Revenus",
      value: "€3,240",
      change: "+18%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "Ce mois"
    },
    {
      title: "Note Moyenne",
      value: "4.8",
      change: "+0.2",
      changeType: "positive" as const,
      icon: Star,
      description: "Sur 5 étoiles"
    }
  ];

  const recentBookings = [
    {
      id: 1,
      property: "Villa de luxe à Sidi Bou Said",
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
    },
    {
      id: 3,
      property: "Studio moderne",
      guest: "Sophie Martin",
      checkIn: "28 Jan 2024",
      checkOut: "30 Jan 2024",
      status: "confirmed",
      amount: "€120"
    }
  ];

  const getStatusBadge = (status: string) => {
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
      <div className="flex items-center justify-end">
        <Button 
          className="flex items-center gap-2"
          onClick={() => navigate('/dashboard/owner/add-property')}
        >
          <Plus className="h-4 w-4" />
          Ajouter une Propriété
        </Button>
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
        {/* Réservations récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Réservations Récentes
            </CardTitle>
            <CardDescription>
              Dernières réservations de vos propriétés
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
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mes propriétés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Mes Propriétés
            </CardTitle>
            <CardDescription>
              Gestion de vos propriétés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div>
                    <h4 className="font-medium">Villa de luxe</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Sidi Bou Said
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">€150/nuit</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-current text-yellow-400" />
                    <span>4.8</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div>
                    <h4 className="font-medium">Appartement centre-ville</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Tunis Centre
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">€80/nuit</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-current text-yellow-400" />
                    <span>4.6</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Voir toutes mes propriétés
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;
