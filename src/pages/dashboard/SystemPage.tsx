import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Server, Database, Shield, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const SystemPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('SystemPage');

  logger.debug('SystemPage rendered');

  const systemStatus = {
    database: 'online',
    api: 'online',
    storage: 'online',
    auth: 'online',
    uptime: '99.9%',
    lastBackup: '2024-01-15 02:00:00',
    version: '1.2.3'
  };

  const systemMetrics = {
    totalUsers: 1234,
    totalProperties: 456,
    totalBookings: 789,
    storageUsed: '2.3 GB',
    memoryUsage: '68%',
    cpuUsage: '45%'
  };

  const recentActivities = [
    {
      id: 1,
      type: 'backup',
      message: 'Sauvegarde automatique terminée',
      timestamp: '2024-01-15 02:00:00',
      status: 'success'
    },
    {
      id: 2,
      type: 'update',
      message: 'Mise à jour de sécurité appliquée',
      timestamp: '2024-01-14 18:30:00',
      status: 'success'
    },
    {
      id: 3,
      type: 'alert',
      message: 'Utilisation CPU élevée détectée',
      timestamp: '2024-01-14 15:45:00',
      status: 'warning'
    },
    {
      id: 4,
      type: 'maintenance',
      message: 'Maintenance programmée planifiée',
      timestamp: '2024-01-14 10:00:00',
      status: 'info'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'offline': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'backup': return <Database className="h-4 w-4" />;
      case 'update': return <Settings className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Server className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Système</h1>
          <p className="text-gray-600">Configuration et monitoring système</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configuration
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Shield className="mr-2 h-4 w-4" />
            Sécurité
          </Button>
        </div>
      </div>

      {/* Statut des services */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Base de données</p>
                <p className="text-lg font-semibold text-gray-900">En ligne</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Badge className={getStatusColor(systemStatus.database)}>
              <div className="flex items-center">
                {getStatusIcon(systemStatus.database)}
                <span className="ml-1">Opérationnel</span>
              </div>
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API</p>
                <p className="text-lg font-semibold text-gray-900">En ligne</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Server className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Badge className={getStatusColor(systemStatus.api)}>
              <div className="flex items-center">
                {getStatusIcon(systemStatus.api)}
                <span className="ml-1">Opérationnel</span>
              </div>
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stockage</p>
                <p className="text-lg font-semibold text-gray-900">En ligne</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Badge className={getStatusColor(systemStatus.storage)}>
              <div className="flex items-center">
                {getStatusIcon(systemStatus.storage)}
                <span className="ml-1">Opérationnel</span>
              </div>
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Authentification</p>
                <p className="text-lg font-semibold text-gray-900">En ligne</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Badge className={getStatusColor(systemStatus.auth)}>
              <div className="flex items-center">
                {getStatusIcon(systemStatus.auth)}
                <span className="ml-1">Opérationnel</span>
              </div>
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Métriques système */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Propriétés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics.totalProperties.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Réservations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics.totalBookings.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stockage utilisé</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics.storageUsed}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Database className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mémoire</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics.memoryUsage}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Server className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics.cpuUsage}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations système */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Version</span>
                <span className="text-sm text-gray-900">{systemStatus.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Uptime</span>
                <span className="text-sm text-gray-900">{systemStatus.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Dernière sauvegarde</span>
                <span className="text-sm text-gray-900">{systemStatus.lastBackup}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemPage;
