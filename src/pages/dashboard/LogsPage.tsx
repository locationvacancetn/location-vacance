import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, AlertTriangle, CheckCircle, Info, Search, Download, Filter } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const LogsPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('LogsPage');

  logger.debug('LogsPage rendered');

  const logs = [
    {
      id: 1,
      level: 'info',
      message: 'User login successful',
      timestamp: '2024-01-15 14:30:25',
      source: 'auth',
      userId: 'user_123',
      details: 'User marie.dubois@email.com logged in from 192.168.1.100'
    },
    {
      id: 2,
      level: 'error',
      message: 'Database connection failed',
      timestamp: '2024-01-15 14:25:10',
      source: 'database',
      userId: null,
      details: 'Connection timeout after 30 seconds'
    },
    {
      id: 3,
      level: 'warning',
      message: 'High memory usage detected',
      timestamp: '2024-01-15 14:20:15',
      source: 'system',
      userId: null,
      details: 'Memory usage reached 85% of available capacity'
    },
    {
      id: 4,
      level: 'info',
      message: 'Property created successfully',
      timestamp: '2024-01-15 14:15:30',
      source: 'api',
      userId: 'user_456',
      details: 'Property "Villa Sunrise" created by user ahmed.benali@email.com'
    },
    {
      id: 5,
      level: 'error',
      message: 'Payment processing failed',
      timestamp: '2024-01-15 14:10:45',
      source: 'payment',
      userId: 'user_789',
      details: 'Stripe API returned error: card_declined'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'auth': return 'bg-purple-100 text-purple-800';
      case 'database': return 'bg-blue-100 text-blue-800';
      case 'system': return 'bg-orange-100 text-orange-800';
      case 'api': return 'bg-green-100 text-green-800';
      case 'payment': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs & Analytics</h1>
          <p className="text-gray-600">Journaux système et analyses</p>
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

      {/* Statistiques des logs */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total logs</p>
                <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Erreurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.level === 'error').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avertissements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.level === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Informations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.level === 'info').length}
                </p>
              </div>
              <Info className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans les logs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="error">Erreur</SelectItem>
                <SelectItem value="warning">Avertissement</SelectItem>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="success">Succès</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sources</SelectItem>
                <SelectItem value="auth">Authentification</SelectItem>
                <SelectItem value="database">Base de données</SelectItem>
                <SelectItem value="system">Système</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="payment">Paiement</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Dernière heure</SelectItem>
                <SelectItem value="24h">Dernières 24h</SelectItem>
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className={`p-2 rounded-lg ${getLevelColor(log.level)}`}>
                  {getLevelIcon(log.level)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getLevelColor(log.level)}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <Badge className={getSourceColor(log.source)}>
                      {log.source.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">{log.timestamp}</span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-1">{log.message}</h3>
                  <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                  
                  {log.userId && (
                    <div className="text-xs text-gray-500">
                      User ID: {log.userId}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Voir détails
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsPage;
