import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, DollarSign, Clock, Star } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const MyBookingsPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('MyBookingsPage');

  logger.debug('MyBookingsPage rendered');

  const bookings = [
    {
      id: 1,
      property: 'Villa Sunrise',
      location: 'Sousse, Tunisie',
      checkIn: '2024-01-15',
      checkOut: '2024-01-20',
      amount: 'TND 4,750',
      status: 'confirmed',
      statusLabel: 'Confirmée',
      rating: 4.8,
      image: '/placeholder.svg'
    },
    {
      id: 2,
      property: 'Appartement Marina',
      location: 'Hammamet, Tunisie',
      checkIn: '2024-01-18',
      checkOut: '2024-01-22',
      amount: 'TND 2,600',
      status: 'pending',
      statusLabel: 'En attente',
      rating: 4.6,
      image: '/placeholder.svg'
    },
    {
      id: 3,
      property: 'Riad Médina',
      location: 'Tunis, Tunisie',
      checkIn: '2024-01-25',
      checkOut: '2024-01-28',
      amount: 'TND 1,350',
      status: 'completed',
      statusLabel: 'Terminée',
      rating: 4.9,
      image: '/placeholder.svg'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Réservations</h1>
          <p className="text-gray-600">Vos réservations passées et à venir</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            Nouvelle recherche
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img 
                    src={booking.image} 
                    alt={booking.property}
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
                        {booking.property}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{booking.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {booking.checkIn} - {booking.checkOut}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        <span className="text-sm">{booking.rating}/5</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {booking.amount}
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.statusLabel}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Voir détails
                      </Button>
                      {booking.status === 'confirmed' && (
                        <Button size="sm" variant="outline">
                          Modifier
                        </Button>
                      )}
                      {booking.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          Noter
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Réservation #{booking.id}
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

export default MyBookingsPage;
