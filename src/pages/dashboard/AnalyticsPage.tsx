import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, TrendingUp, Users, Calendar, DollarSign, Eye } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const AnalyticsPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('AnalyticsPage');

  logger.debug('AnalyticsPage rendered');

  const analyticsData = {
    totalViews: 12540,
    conversionRate: 3.2,
    averageStay: 4.5,
    occupancyRate: 78,
    revenueGrowth: 15.3,
    guestSatisfaction: 4.8
  };

  const monthlyData = [
    { month: 'Jan', bookings: 12, revenue: 3240 },
    { month: 'Fév', bookings: 15, revenue: 4100 },
    { month: 'Mar', bookings: 18, revenue: 4850 },
    { month: 'Avr', bookings: 22, revenue: 6200 },
    { month: 'Mai', bookings: 25, revenue: 7100 },
    { month: 'Juin', bookings: 28, revenue: 8200 }
  ];

  const topProperties = [
    { name: 'Villa Sunrise', bookings: 23, revenue: 12540, rating: 4.8 },
    { name: 'Appartement Marina', bookings: 18, revenue: 9800, rating: 4.6 },
    { name: 'Riad Médina', bookings: 31, revenue: 15600, rating: 4.9 }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600">Analyses et performances</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">3 derniers mois</SelectItem>
              <SelectItem value="1y">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Eye className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vues totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+8% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de conversion</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.conversionRate}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+0.5% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Séjour moyen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.averageStay} nuits
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">Par réservation</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux d'occupation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.occupancyRate}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+5% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Croissance revenus</p>
                <p className="text-2xl font-bold text-gray-900">
                  +{analyticsData.revenueGrowth}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction client</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.guestSatisfaction}/5
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">Note moyenne</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique des revenus */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des revenus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Graphique des revenus mensuels</p>
              <p className="text-sm text-gray-500">Janvier - Juin 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top propriétés */}
      <Card>
        <CardHeader>
          <CardTitle>Top propriétés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProperties.map((property, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{property.name}</h3>
                    <p className="text-sm text-gray-600">{property.bookings} réservations</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    TND {property.revenue.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Note:</span>
                    <span className="text-sm font-medium">{property.rating}/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
