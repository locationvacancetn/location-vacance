import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  Calendar, 
  Search, 
  Heart, 
  MapPin,
  Star,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

const TenantDashboard = () => {
  const { userProfile } = useUserRole();

  // Données d'exemple pour le locataire
  const stats = [
    {
      title: "Mes Réservations",
      value: "5",
      change: "+2",
      changeType: "positive" as const,
      icon: Calendar,
      description: "Réservations actives"
    },
    {
      title: "Favoris",
      value: "12",
      change: "+3",
      changeType: "positive" as const,
      icon: Heart,
      description: "Propriétés sauvegardées"
    },
    {
      title: "Prochain Voyage",
      value: "3 jours",
      change: "Dans 2 semaines",
      changeType: "neutral" as const,
      icon: Clock,
      description: "Villa de luxe à Sidi Bou Said"
    },
    {
      title: "Note Moyenne",
      value: "4.9",
      change: "+0.1",
      changeType: "positive" as const,
      icon: Star,
      description: "Vos évaluations"
    }
  ];

  const upcomingTrips = [
    {
      id: 1,
      property: "Villa de luxe à Sidi Bou Said",
      checkIn: "15 Jan 2024",
      checkOut: "20 Jan 2024",
      status: "confirmed",
      amount: "€450",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&h=100&fit=crop"
    },
    {
      id: 2,
      property: "Appartement centre-ville",
      checkIn: "22 Jan 2024",
      checkOut: "25 Jan 2024",
      status: "pending",
      amount: "€180",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=100&h=100&fit=crop"
    }
  ];

  const favoriteProperties = [
    {
      id: 1,
      title: "Villa moderne avec piscine",
      location: "Hammamet",
      price: "€200/nuit",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&h=100&fit=crop"
    },
    {
      id: 2,
      title: "Studio cosy centre-ville",
      location: "Tunis",
      price: "€60/nuit",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=100&h=100&fit=crop"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Confirmée
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            En attente
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Annulée
          </Badge>
        );
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
            Tableau de Bord Locataire
          </h1>
          <p className="text-muted-foreground">
            Bienvenue, {userProfile?.full_name || 'Locataire'}
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Rechercher
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
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {stat.change}
                </span>
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
        {/* Voyages à venir */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Voyages à Venir
            </CardTitle>
            <CardDescription>
              Vos prochaines réservations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTrips.map((trip) => (
              <div key={trip.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <img 
                  src={trip.image} 
                  alt={trip.property}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{trip.property}</h4>
                  <p className="text-sm text-muted-foreground">
                    {trip.checkIn} - {trip.checkOut}
                  </p>
                  <p className="text-sm font-medium text-foreground">{trip.amount}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(trip.status)}
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              Voir toutes mes réservations
            </Button>
          </CardContent>
        </Card>

        {/* Favoris */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Mes Favoris
            </CardTitle>
            <CardDescription>
              Propriétés sauvegardées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {favoriteProperties.map((property) => (
              <div key={property.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{property.title}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {property.location}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-medium text-foreground">{property.price}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                      <span>{property.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              Voir tous mes favoris
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantDashboard;
