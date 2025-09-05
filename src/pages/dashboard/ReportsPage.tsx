import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, TrendingUp, BarChart, PieChart } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const ReportsPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('ReportsPage');

  logger.debug('ReportsPage rendered');

  const reportData = {
    totalRevenue: 45600,
    totalBookings: 89,
    averageStay: 4.2,
    occupancyRate: 76,
    guestSatisfaction: 4.7,
    maintenanceCosts: 3200
  };

  const monthlyReports = [
    { month: 'Janvier', revenue: 8200, bookings: 18, occupancy: 72 },
    { month: 'Février', revenue: 9100, bookings: 21, occupancy: 78 },
    { month: 'Mars', revenue: 10500, bookings: 24, occupancy: 82 },
    { month: 'Avril', revenue: 9800, bookings: 22, occupancy: 75 },
    { month: 'Mai', revenue: 11200, bookings: 26, occupancy: 85 },
    { month: 'Juin', revenue: 12800, bookings: 28, occupancy: 88 }
  ];

  const propertyPerformance = [
    { name: 'Villa Sunrise', revenue: 18500, bookings: 42, rating: 4.8 },
    { name: 'Appartement Marina', revenue: 15200, bookings: 35, rating: 4.6 },
    { name: 'Riad Médina', revenue: 11900, bookings: 28, rating: 4.9 }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-600">Rapports d'activité et analyses</p>
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
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                <p className="text-2xl font-bold text-gray-900">
                  TND {reportData.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-green-600">+15% vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Réservations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.totalBookings}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-green-600">+12% vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux d'occupation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.occupancyRate}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-green-600">+8% vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Séjour moyen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.averageStay} nuits
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
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
                <p className="text-sm font-medium text-gray-600">Satisfaction client</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.guestSatisfaction}/5
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coûts maintenance</p>
                <p className="text-2xl font-bold text-gray-900">
                  TND {reportData.maintenanceCosts.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">Cette période</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique des revenus mensuels */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des revenus mensuels</CardTitle>
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

      {/* Performance des propriétés */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par propriété</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {propertyPerformance.map((property, index) => (
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

      {/* Rapports disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Rapport financier</h3>
                  <p className="text-sm text-gray-600">Revenus et dépenses</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Rapport réservations</h3>
                  <p className="text-sm text-gray-600">Statistiques de réservation</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <PieChart className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Rapport satisfaction</h3>
                  <p className="text-sm text-gray-600">Avis et évaluations</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
