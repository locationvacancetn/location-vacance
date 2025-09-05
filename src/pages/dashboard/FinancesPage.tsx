import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Filter } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const FinancesPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('FinancesPage');

  logger.debug('FinancesPage rendered');

  const financialData = {
    totalRevenue: 12540,
    monthlyRevenue: 3240,
    pendingPayments: 890,
    totalBookings: 45,
    averageBookingValue: 278.67
  };

  const transactions = [
    {
      id: 1,
      type: 'booking',
      description: 'Réservation Villa Sunrise',
      amount: 2850,
      date: '2024-01-15',
      status: 'completed',
      guest: 'Marie Dubois'
    },
    {
      id: 2,
      type: 'booking',
      description: 'Réservation Appartement Marina',
      amount: 1950,
      date: '2024-01-14',
      status: 'completed',
      guest: 'Ahmed Ben Ali'
    },
    {
      id: 3,
      type: 'booking',
      description: 'Réservation Riad Médina',
      amount: 1350,
      date: '2024-01-13',
      status: 'pending',
      guest: 'Sophie Martin'
    },
    {
      id: 4,
      type: 'refund',
      description: 'Remboursement - Annulation',
      amount: -450,
      date: '2024-01-12',
      status: 'completed',
      guest: 'Jean Dupont'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finances</h1>
          <p className="text-gray-600">Revenus et paiements</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                <p className="text-2xl font-bold text-gray-900">
                  TND {financialData.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ce mois</p>
                <p className="text-2xl font-bold text-gray-900">
                  TND {financialData.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+8% vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  TND {financialData.pendingPayments.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">3 paiements en attente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valeur moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  TND {financialData.averageBookingValue.toFixed(0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">Par réservation</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions récentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions récentes</CardTitle>
            <Button variant="outline" size="sm">
              Voir toutes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${
                    transaction.type === 'booking' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'booking' ? (
                      <DollarSign className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                    <p className="text-sm text-gray-600">{transaction.guest}</p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}TND {transaction.amount.toLocaleString()}
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {getStatusLabel(transaction.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancesPage;
