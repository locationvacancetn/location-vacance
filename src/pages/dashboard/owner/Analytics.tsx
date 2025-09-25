import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Calendar,
  DollarSign,
  Users,
  Home,
  Star,
  MapPin,
  Clock,
  RefreshCw
} from "lucide-react";

interface AnalyticsData {
  totalViews: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  occupancyRate: number;
  conversionRate: number;
  topProperty: string;
  monthlyViews: number[];
  monthlyBookings: number[];
  monthlyRevenue: number[];
}

const Analytics = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("30days");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    occupancyRate: 0,
    conversionRate: 0,
    topProperty: "",
    monthlyViews: [],
    monthlyBookings: [],
    monthlyRevenue: []
  });

  // Charger les données analytiques
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) return;

      // Récupérer les propriétés du propriétaire
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, views, price_per_night')
        .eq('owner_id', user.id);

      if (propertiesError) throw propertiesError;

      if (!properties || properties.length === 0) {
        setAnalyticsData({
          totalViews: 0,
          totalBookings: 0,
          totalRevenue: 0,
          averageRating: 0,
          occupancyRate: 0,
          conversionRate: 0,
          topProperty: "Aucune propriété",
          monthlyViews: new Array(12).fill(0),
          monthlyBookings: new Array(12).fill(0),
          monthlyRevenue: new Array(12).fill(0)
        });
        return;
      }

      // Calculer les statistiques
      const totalViews = properties.reduce((sum, prop) => sum + (prop.views || 0), 0);
      const topProperty = properties.reduce((max, prop) => 
        (prop.views || 0) > (max.views || 0) ? prop : max, properties[0]
      );

      // Données simulées pour la démonstration
      // Dans une vraie application, ces données viendraient de votre base de données
      const simulatedData: AnalyticsData = {
        totalViews,
        totalBookings: Math.floor(totalViews * 0.05), // 5% de conversion simulée
        totalRevenue: Math.floor(totalViews * 0.05 * 120), // Prix moyen simulé
        averageRating: 4.2 + Math.random() * 0.6, // Rating simulé entre 4.2 et 4.8
        occupancyRate: 65 + Math.random() * 25, // Taux d'occupation simulé
        conversionRate: 3 + Math.random() * 4, // Taux de conversion simulé
        topProperty: topProperty?.title || "Aucune propriété",
        monthlyViews: Array.from({ length: 12 }, () => Math.floor(Math.random() * 200) + 50),
        monthlyBookings: Array.from({ length: 12 }, () => Math.floor(Math.random() * 15) + 2),
        monthlyRevenue: Array.from({ length: 12 }, () => Math.floor(Math.random() * 3000) + 500)
      };

      setAnalyticsData(simulatedData);

    } catch (error: any) {
      console.error('Erreur lors du chargement des analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données analytiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Actualiser les données
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    toast({
      title: "Succès",
      description: "Données actualisées"
    });
  };

  useEffect(() => {
    loadAnalytics();
  }, [user?.id, timeRange]);

  // Calculer les tendances (simulation)
  const getTrend = (current: number) => {
    const change = (Math.random() - 0.5) * 20; // Changement aléatoire entre -10% et +10%
    return {
      value: Math.abs(change),
      isPositive: change > 0
    };
  };

  const viewsTrend = getTrend(analyticsData.totalViews);
  const bookingsTrend = getTrend(analyticsData.totalBookings);
  const revenueTrend = getTrend(analyticsData.totalRevenue);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Suivez les performances de vos propriétés
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="3months">3 derniers mois</SelectItem>
              <SelectItem value="12months">12 derniers mois</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vues totales</p>
                <p className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              {viewsTrend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={viewsTrend.isPositive ? "text-green-500" : "text-red-500"}>
                {viewsTrend.isPositive ? '+' : '-'}{viewsTrend.value.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Réservations</p>
                <p className="text-2xl font-bold">{analyticsData.totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              {bookingsTrend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={bookingsTrend.isPositive ? "text-green-500" : "text-red-500"}>
                {bookingsTrend.isPositive ? '+' : '-'}{bookingsTrend.value.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold">{analyticsData.totalRevenue.toLocaleString()} DT</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              {revenueTrend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={revenueTrend.isPositive ? "text-green-500" : "text-red-500"}>
                {revenueTrend.isPositive ? '+' : '-'}{revenueTrend.value.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Note moyenne</p>
                <p className="text-2xl font-bold">{analyticsData.averageRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.floor(analyticsData.averageRating)
                        ? 'text-orange-500 fill-orange-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métriques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux d'occupation</p>
                <p className="text-2xl font-bold">{analyticsData.occupancyRate.toFixed(1)}%</p>
              </div>
              <Home className="w-6 h-6 text-purple-500" />
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${analyticsData.occupancyRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de conversion</p>
                <p className="text-2xl font-bold">{analyticsData.conversionRate.toFixed(1)}%</p>
              </div>
              <Users className="w-6 h-6 text-cyan-500" />
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full" 
                  style={{ width: `${analyticsData.conversionRate * 5}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Propriété top</p>
                <p className="text-lg font-bold truncate">{analyticsData.topProperty}</p>
              </div>
              <MapPin className="w-6 h-6 text-red-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary">
                <TrendingUp className="w-3 h-3 mr-1" />
                Meilleure performance
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques simulés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Évolution des vues
            </CardTitle>
            <CardDescription>
              Nombre de vues par mois sur les 12 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analyticsData.monthlyViews.map((views, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(views / Math.max(...analyticsData.monthlyViews)) * 200}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <span className="text-xs text-muted-foreground mt-2">
                    {new Date(2024, index).toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Réservations mensuelles
            </CardTitle>
            <CardDescription>
              Nombre de réservations par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analyticsData.monthlyBookings.map((bookings, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ 
                      height: `${(bookings / Math.max(...analyticsData.monthlyBookings)) * 200}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <span className="text-xs text-muted-foreground mt-2">
                    {new Date(2024, index).toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conseils d'optimisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Conseils d'optimisation
          </CardTitle>
          <CardDescription>
            Recommandations pour améliorer vos performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.averageRating < 4.0 && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Améliorer la satisfaction client</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Votre note moyenne est de {analyticsData.averageRating.toFixed(1)}/5. 
                    Considérez améliorer l'accueil, la propreté ou les équipements.
                  </p>
                </div>
              </div>
            )}
            
            {analyticsData.conversionRate < 3.0 && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Optimiser le taux de conversion</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Votre taux de conversion est de {analyticsData.conversionRate.toFixed(1)}%. 
                    Améliorez vos photos, descriptions et prix pour convertir plus de visiteurs.
                  </p>
                </div>
              </div>
            )}
            
            {analyticsData.occupancyRate < 50 && (
              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Clock className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-800">Augmenter le taux d'occupation</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Votre taux d'occupation est de {analyticsData.occupancyRate.toFixed(1)}%. 
                    Considérez ajuster vos prix ou améliorer votre visibilité.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
