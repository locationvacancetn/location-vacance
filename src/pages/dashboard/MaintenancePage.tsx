import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Calendar, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const MaintenancePage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('MaintenancePage');

  logger.debug('MaintenancePage rendered');

  const maintenanceTasks = [
    {
      id: 1,
      property: 'Villa Sunrise',
      title: 'Réparation climatisation',
      description: 'La climatisation de la chambre principale ne fonctionne plus',
      priority: 'high',
      status: 'pending',
      assignedTo: 'Ahmed Technicien',
      dueDate: '2024-01-20',
      createdDate: '2024-01-15',
      estimatedCost: 250
    },
    {
      id: 2,
      property: 'Appartement Marina',
      title: 'Nettoyage piscine',
      description: 'Nettoyage et traitement de la piscine',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: 'Marie Nettoyage',
      dueDate: '2024-01-18',
      createdDate: '2024-01-10',
      estimatedCost: 150
    },
    {
      id: 3,
      property: 'Riad Médina',
      title: 'Réparation porte d\'entrée',
      description: 'La serrure de la porte d\'entrée est défaillante',
      priority: 'high',
      status: 'completed',
      assignedTo: 'Omar Serrurier',
      dueDate: '2024-01-12',
      createdDate: '2024-01-08',
      estimatedCost: 180
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Wrench className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-600">Suivi des maintenances</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Planifier
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Wrench className="mr-2 h-4 w-4" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total tâches</p>
                <p className="text-2xl font-bold text-gray-900">{maintenanceTasks.length}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {maintenanceTasks.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {maintenanceTasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {maintenanceTasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {maintenanceTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority === 'high' ? 'Urgent' : 
                       task.priority === 'medium' ? 'Moyen' : 'Faible'}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      <div className="flex items-center">
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{getStatusLabel(task.status)}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{task.assignedTo}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Échéance: {task.dueDate}</span>
                    </div>
                    <div className="flex items-center">
                      <span>Créé: {task.createdDate}</span>
                    </div>
                    <div className="flex items-center">
                      <span>Coût estimé: TND {task.estimatedCost}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button size="sm" variant="outline">
                    Voir détails
                  </Button>
                  {task.status === 'pending' && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Commencer
                    </Button>
                  )}
                  {task.status === 'in_progress' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      Terminer
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MaintenancePage;
