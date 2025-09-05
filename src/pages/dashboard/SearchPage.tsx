import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Calendar, Users, Star, Heart } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const SearchPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('SearchPage');

  logger.debug('SearchPage rendered');

  const searchResults = [
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
      isFavorite: false
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
      isFavorite: true
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
      isFavorite: false
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rechercher</h1>
        <p className="text-gray-600">Trouvez votre prochain logement idéal</p>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Où allez-vous ?"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Dates</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Dates de séjour"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Voyageurs</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Nombre de voyageurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 voyageur</SelectItem>
                    <SelectItem value="2">2 voyageurs</SelectItem>
                    <SelectItem value="3">3 voyageurs</SelectItem>
                    <SelectItem value="4">4 voyageurs</SelectItem>
                    <SelectItem value="5+">5+ voyageurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats de recherche */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {searchResults.length} propriétés trouvées
          </h2>
          <div className="flex items-center space-x-2">
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="rating">Meilleures notes</SelectItem>
                <SelectItem value="reviews">Plus de commentaires</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((property) => (
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
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <Heart className={`h-4 w-4 ${property.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                  </button>
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
                  <Button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white">
                    Voir les détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
