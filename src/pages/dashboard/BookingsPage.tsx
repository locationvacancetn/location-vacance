import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, DollarSign, Clock } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const BookingsPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('BookingsPage');

  logger.debug('BookingsPage rendered');

  const bookings = [
    {
      id: 1,
      property: 'Villa Sunrise',
      guest: 'Marie Dubois',
      checkIn: '2024-01-15',
      checkOut: '2024-01-20',
      amount: 'TND 4,750',
      status: 'confirmed',
      statusLabel: 'Confirmée'
    },
    {
      id: 2,
      property: 'Appartement Marina',
      guest: 'Ahmed Ben Ali',
      checkIn: '2024-01-18',
      checkOut: '2024-01-22',
      amount: 'TND 2,600',
      status: 'pending',
      statusLabel: 'En attente'
    },
    {
      id: 3,
      property: 'Riad Médina',
      guest: 'Sophie Martin',
      checkIn: '2024-01-25',
      checkOut: '2024-01-28',
      amount: 'TND 1,350',
      status: 'completed',
      statusLabel: 'Terminée'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Réservations</h1>
          <p className="text-gray-600">Vue d'ensemble des réservations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.property}
                      </h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <User className="h-4 w-4 mr-1" />
                        <span className="text-sm">{booking.guest}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {booking.checkIn} - {booking.checkOut}
                        </span>
                      </div>
                      <div className="flex items-center text-green-600 mt-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="font-semibold">{booking.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.statusLabel}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Voir
                    </Button>
                    <Button size="sm" variant="outline">
                      Modifier
                    </Button>
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

export default BookingsPage;
