import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Star, Users, Trash2, Eye } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const FavoritesPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('FavoritesPage');

  logger.debug('FavoritesPage rendered');

  const favorites = [
    {
      id: 1,
      name: 'Villa Sunrise',
      location: 'Sousse, Tunisie',
      price: 'TND 950/nuit',
      rating: 4.8,
      reviews: 124,
      image: '/placeholder.svg',
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      addedDate: '2024-01-10'
    },
    {
      id: 2,
      name: 'Appartement Marina',
      location: 'Hammamet, Tunisie',
      price: 'TND 650/nuit',
      rating: 4.6,
      reviews: 89,
      image: '/placeholder.svg',
      guests: 4,
      bedrooms: 2,
      bathrooms: 1,
      addedDate: '2024-01-08'
    },
    {
      id: 3,
      name: 'Riad Médina',
      location: 'Tunis, Tunisie',
      price: 'TND 450/nuit',
      rating: 4.9,
      reviews: 156,
      image: '/placeholder.svg',
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      addedDate: '2024-01-05'
    },
    {
      id: 4,
      name: 'Villa Djerba',
      location: 'Djerba, Tunisie',
      price: 'TND 750/nuit',
      rating: 4.7,
      reviews: 98,
      image: '/placeholder.svg',
      guests: 5,
      bedrooms: 3,
      bathrooms: 2,
      addedDate: '2024-01-03'
    }
  ];

  const handleRemoveFavorite = (id: number) => {
    logger.info('Remove favorite clicked', { propertyId: id });
    // TODO: Implement remove from favorites
  };

  const handleViewProperty = (id: number) => {
    logger.info('View property clicked', { propertyId: id });
    // TODO: Navigate to property details
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
          <p className="text-gray-600">Vos propriétés favorites sauvegardées</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            {favorites.length} propriétés
          </Badge>
          <Button variant="outline" size="sm">
            Trier par date
          </Button>
        </div>
      </div>

      {favorites.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun favori pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez à explorer et ajoutez des propriétés à vos favoris
            </p>
            <Button 
              onClick={() => navigateTo('search')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Commencer la recherche
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative">
                  <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <img 
                      src={property.image} 
                      alt={property.name}
                      className="h-full w-full object-cover rounded-t-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button 
                      onClick={() => handleRemoveFavorite(property.id)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500"
                      title="Supprimer des favoris"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleViewProperty(property.id)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                      title="Voir la propriété"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-white text-gray-700">
                      Ajouté le {new Date(property.addedDate).toLocaleDateString('fr-FR')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">{property.name}</h3>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.guests} voyageurs • {property.bedrooms} chambres • {property.bathrooms} salles de bain</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{property.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({property.reviews} avis)</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{property.price}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleViewProperty(property.id)}
                    >
                      Voir les détails
                    </Button>
                    <Button 
                      variant="outline" 
                      className="px-3"
                      onClick={() => handleRemoveFavorite(property.id)}
                    >
                      <Heart className="h-4 w-4 text-red-500 fill-current" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
