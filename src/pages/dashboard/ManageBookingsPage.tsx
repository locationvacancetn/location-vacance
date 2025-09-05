import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const ManageBookingsPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('ManageBookingsPage');

  logger.debug('ManageBookingsPage rendered');

  const bookings = [
    {
      id: 1,
      property: 'Villa Sunrise',
      guest: 'Marie Dubois',
      checkIn: '2024-01-15',
      checkOut: '2024-01-20',
      amount: 2850,
      status: 'confirmed',
      statusLabel: 'Confirmée',
      guestCount: 4,
      phone: '+33 6 12 34 56 78',
      email: 'marie.dubois@email.com'
    },
    {
      id: 2,
      property: 'Appartement Marina',
      guest: 'Ahmed Ben Ali',
      checkIn: '2024-01-18',
      checkOut: '2024-01-22',
      amount: 1950,
      status: 'pending',
      statusLabel: 'En attente',
      guestCount: 2,
      phone: '+216 98 76 54 32',
      email: 'ahmed.benali@email.com'
    },
    {
      id: 3,
      property: 'Riad Médina',
      guest: 'Sophie Martin',
      checkIn: '2024-01-25',
      checkOut: '2024-01-28',
      amount: 1350,
      status: 'cancelled',
      statusLabel: 'Annulée',
      guestCount: 3,
      phone: '+33 6 98 76 54 32',
      email: 'sophie.martin@email.com'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleBookingAction = (id: number, action: string) => {
    logger.info('Booking action', { bookingId: id, action });
    // TODO: Implement booking actions
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion Réservations</h1>
          <p className="text-gray-600">Gérer les réservations des propriétés</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total réservations</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'pending').length}
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
                <p className="text-sm font-medium text-gray-600">Revenus</p>
                <p className="text-2xl font-bold text-gray-900">
                  TND {bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des réservations */}
      <Card>
        <CardHeader>
          <CardTitle>Réservations récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{booking.property}</h3>
                    <p className="text-sm text-gray-600">{booking.guest}</p>
                    <p className="text-xs text-gray-500">{booking.email} • {booking.phone}</p>
                    <div className="flex items-center mt-1 space-x-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">{booking.checkIn} - {booking.checkOut}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-1" />
                        <span className="text-sm">{booking.guestCount} voyageurs</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      TND {booking.amount.toLocaleString()}
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      <div className="flex items-center">
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{booking.statusLabel}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleBookingAction(booking.id, 'confirm')}
                        >
                          Confirmer
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleBookingAction(booking.id, 'reject')}
                        >
                          Rejeter
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBookingAction(booking.id, 'cancel')}
                      >
                        Annuler
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleBookingAction(booking.id, 'view')}
                    >
                      Voir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageBookingsPage;
