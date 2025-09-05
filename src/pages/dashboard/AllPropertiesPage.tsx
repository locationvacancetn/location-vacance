import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, DollarSign, Calendar, Users, Star, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const AllPropertiesPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('AllPropertiesPage');

  logger.debug('AllPropertiesPage rendered');

  const properties = [
    {
      id: 1,
      name: 'Villa Sunrise',
      location: 'Sousse, Tunisie',
      owner: 'Marie Dubois',
      price: 'TND 950/nuit',
      status: 'active',
      bookings: 23,
      revenue: 12540,
      rating: 4.8,
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      image: '/placeholder.svg'
    },
    {
      id: 2,
      name: 'Appartement Marina',
      location: 'Hammamet, Tunisie',
      owner: 'Ahmed Ben Ali',
      price: 'TND 650/nuit',
      status: 'maintenance',
      bookings: 18,
      revenue: 9800,
      rating: 4.6,
      guests: 4,
      bedrooms: 2,
      bathrooms: 1,
      image: '/placeholder.svg'
    },
    {
      id: 3,
      name: 'Riad Médina',
      location: 'Tunis, Tunisie',
      owner: 'Sophie Martin',
      price: 'TND 450/nuit',
      status: 'active',
      bookings: 31,
      revenue: 15600,
      rating: 4.9,
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      image: '/placeholder.svg'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'maintenance': return 'Maintenance';
      case 'inactive': return 'Inactive';
      default: return 'Inconnu';
    }
  };

  const handlePropertyAction = (id: number, action: string) => {
    logger.info('Property action', { propertyId: id, action });
    // TODO: Implement property actions
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Toutes les Propriétés</h1>
          <p className="text-gray-600">Vue d'ensemble des propriétés</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Building className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Building className="mr-2 h-4 w-4" />
            Ajouter propriété
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total propriétés</p>
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Réservations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.reduce((sum, p) => sum + p.bookings, 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                <p className="text-2xl font-bold text-gray-900">
                  TND {properties.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des propriétés */}
      <div className="grid gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img 
                    src={property.image} 
                    alt={property.name}
                    className="h-full w-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {property.name}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm">Propriétaire: {property.owner}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.bookings} réservations</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        <span className="text-sm">{property.rating}/5</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {property.price}
                      </div>
                      <Badge className={getStatusColor(property.status)}>
                        {getStatusLabel(property.status)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>Revenus: TND {property.revenue.toLocaleString()}</span>
                      <span>{property.guests} voyageurs • {property.bedrooms} chambres • {property.bathrooms} salles de bain</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePropertyAction(property.id, 'view')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePropertyAction(property.id, 'edit')}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePropertyAction(property.id, 'delete')}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AllPropertiesPage;
