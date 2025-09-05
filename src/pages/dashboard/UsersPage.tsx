import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Plus, MoreVertical, Edit, Trash2, Shield, UserCheck } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const UsersPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('UsersPage');

  logger.debug('UsersPage rendered');

  const users = [
    {
      id: 1,
      name: 'Marie Dubois',
      email: 'marie.dubois@email.com',
      role: 'owner',
      status: 'active',
      joinDate: '2024-01-15',
      avatar: '/placeholder.svg',
      properties: 3,
      bookings: 0
    },
    {
      id: 2,
      name: 'Ahmed Ben Ali',
      email: 'ahmed.benali@email.com',
      role: 'tenant',
      status: 'active',
      joinDate: '2024-01-10',
      avatar: '/placeholder.svg',
      properties: 0,
      bookings: 5
    },
    {
      id: 3,
      name: 'Sophie Martin',
      email: 'sophie.martin@email.com',
      role: 'manager',
      status: 'active',
      joinDate: '2024-01-08',
      avatar: '/placeholder.svg',
      properties: 8,
      bookings: 0
    },
    {
      id: 4,
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      role: 'tenant',
      status: 'inactive',
      joinDate: '2024-01-05',
      avatar: '/placeholder.svg',
      properties: 0,
      bookings: 2
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'owner': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-orange-100 text-orange-800';
      case 'tenant': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'owner': return 'Propriétaire';
      case 'manager': return 'Gestionnaire';
      case 'tenant': return 'Locataire';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const handleUserAction = (id: number, action: string) => {
    logger.info('User action', { userId: id, action });
    // TODO: Implement user actions
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion Utilisateurs</h1>
          <p className="text-gray-600">Administration des utilisateurs de la plateforme</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Rechercher
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter utilisateur
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Propriétaires</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'owner').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Locataires</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'tenant').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="owner">Propriétaire</SelectItem>
                <SelectItem value="manager">Gestionnaire</SelectItem>
                <SelectItem value="tenant">Locataire</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {getStatusLabel(user.status)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Membre depuis {new Date(user.joinDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>{user.properties} propriétés</span>
                      <span>{user.bookings} réservations</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUserAction(user.id, 'edit')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUserAction(user.id, 'view')}
                  >
                    Voir
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUserAction(user.id, 'more')}
                  >
                    <MoreVertical className="h-4 w-4" />
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

export default UsersPage;
