import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Filter,
  MoreVertical,
  Reply,
  Archive,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  Calendar,
  Building,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TenantMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isImportant: boolean;
  type: 'booking_response' | 'property_info' | 'support' | 'promotion' | 'general';
  propertyId?: string;
  propertyName?: string;
  bookingId?: string;
  status: 'new' | 'read' | 'archived';
  avatar?: string;
}

const TenantMessages = () => {
  const { userProfile } = useUserRole();
  const [activeTab, setActiveTab] = useState<'all' | 'bookings' | 'properties' | 'support'>('all');
  const [selectedMessage, setSelectedMessage] = useState<TenantMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Données d'exemple pour les messages locataire
  const messages: TenantMessage[] = [
    {
      id: '1',
      from: 'Pierre Dubois',
      to: userProfile?.full_name || 'Vous',
      subject: 'Réservation confirmée - Villa Sidi Bou Said',
      content: 'Bonjour ! Votre réservation pour le week-end du 15-17 mars a été confirmée. Vous recevrez les détails d\'accès 24h avant votre arrivée. Merci !',
      timestamp: 'Il y a 1 heure',
      isRead: false,
      isImportant: true,
      type: 'booking_response',
      propertyId: 'prop_123',
      propertyName: 'Villa de luxe - Sidi Bou Said',
      bookingId: 'book_456',
      status: 'new',
      avatar: 'PD'
    },
    {
      id: '2',
      from: 'Marie Dupont',
      to: userProfile?.full_name || 'Vous',
      subject: 'Informations sur l\'appartement centre-ville',
      content: 'Bonjour ! Voici les informations complémentaires sur l\'appartement : il y a un lave-linge, un parking privé, et la WiFi est incluse. N\'hésitez pas si vous avez d\'autres questions !',
      timestamp: 'Il y a 3 heures',
      isRead: true,
      isImportant: false,
      type: 'property_info',
      propertyId: 'prop_789',
      propertyName: 'Appartement centre-ville',
      status: 'read',
      avatar: 'MD'
    },
    {
      id: '3',
      from: 'Support LocVac',
      to: userProfile?.full_name || 'Vous',
      subject: 'Votre problème de connexion a été résolu',
      content: 'Bonjour, nous avons résolu le problème de connexion que vous avez signalé. Vous devriez maintenant pouvoir accéder à votre compte normalement. Merci de nous avoir contactés !',
      timestamp: 'Il y a 1 jour',
      isRead: true,
      isImportant: false,
      type: 'support',
      status: 'read',
      avatar: 'SL'
    },
    {
      id: '4',
      from: 'Sophie Martin',
      to: userProfile?.full_name || 'Vous',
      subject: 'Nouvelle propriété disponible - 20% de réduction',
      content: 'Découvrez notre nouvelle villa avec piscine privée ! Réduction de 20% pour les réservations de plus de 7 jours. Disponible dès maintenant !',
      timestamp: 'Il y a 2 jours',
      isRead: false,
      isImportant: false,
      type: 'promotion',
      propertyId: 'prop_456',
      propertyName: 'Villa avec piscine - Hammamet',
      status: 'new',
      avatar: 'SM'
    }
  ];

  const filteredMessages = messages.filter(message => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'bookings' && message.type === 'booking_response') ||
      (activeTab === 'properties' && message.type === 'property_info') ||
      (activeTab === 'support' && message.type === 'support');
    
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (message.propertyName && message.propertyName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking_response':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'property_info':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'support':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case 'promotion':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'booking_response':
        return <Badge className="bg-green-100 text-green-800">Réservation</Badge>;
      case 'property_info':
        return <Badge className="bg-blue-100 text-blue-800">Propriété</Badge>;
      case 'support':
        return <Badge className="bg-purple-100 text-purple-800">Support</Badge>;
      case 'promotion':
        return <Badge className="bg-yellow-100 text-yellow-800">Promotion</Badge>;
      default:
        return <Badge variant="outline">Général</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive">Nouveau</Badge>;
      case 'read':
        return <Badge variant="outline" className="text-green-600">Lu</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const newBookingsCount = messages.filter(m => m.type === 'booking_response' && m.status === 'new').length;
  const propertiesCount = messages.filter(m => m.type === 'property_info' && !m.isRead).length;
  const supportCount = messages.filter(m => m.type === 'support' && !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-8 w-8" />
            Messages Locataire
          </h1>
          <p className="text-muted-foreground">Communiquez avec les propriétaires</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Building className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Nouveau Message
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nouvelles Réservations</p>
                <p className="text-2xl font-bold text-green-600">{newBookingsCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Propriétés</p>
                <p className="text-2xl font-bold text-blue-600">{propertiesCount}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Support</p>
                <p className="text-2xl font-bold text-purple-600">{supportCount}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des messages */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Messages</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Onglets */}
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'all'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'bookings'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Réservations {newBookingsCount > 0 && <Badge variant="destructive" className="ml-1">{newBookingsCount}</Badge>}
                </button>
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'properties'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Propriétés
                </button>
                <button
                  onClick={() => setActiveTab('support')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'support'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Support
                </button>
              </div>

              {/* Liste des messages */}
              <div className="max-h-96 overflow-y-auto">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-muted' : ''
                    } ${!message.isRead ? 'font-semibold' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {message.avatar || message.from.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium truncate">{message.from}</h4>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(message.type)}
                            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{message.subject}</p>
                        {message.propertyName && (
                          <p className="text-xs text-blue-600 truncate">{message.propertyName}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {getTypeBadge(message.type)}
                          {getStatusBadge(message.status)}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Reply className="h-4 w-4 mr-2" />
                            Répondre
                          </DropdownMenuItem>
                          {message.bookingId && (
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              Voir réservation
                            </DropdownMenuItem>
                          )}
                          {message.propertyId && (
                            <DropdownMenuItem>
                              <Building className="h-4 w-4 mr-2" />
                              Voir propriété
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Heart className="h-4 w-4 mr-2" />
                            Ajouter aux favoris
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="h-4 w-4 mr-2" />
                            Archiver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Détail du message */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>De: {selectedMessage.from}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedMessage.timestamp}
                      </span>
                      {selectedMessage.propertyName && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">{selectedMessage.propertyName}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(selectedMessage.type)}
                    {getStatusBadge(selectedMessage.status)}
                    <Badge variant={selectedMessage.isRead ? "secondary" : "default"}>
                      {selectedMessage.isRead ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Lu
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Non lu
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
                <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                  <Button>
                    <Reply className="h-4 w-4 mr-2" />
                    Répondre
                  </Button>
                  {selectedMessage.bookingId && (
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Voir réservation
                    </Button>
                  )}
                  {selectedMessage.propertyId && (
                    <Button variant="outline">
                      <Building className="h-4 w-4 mr-2" />
                      Voir propriété
                    </Button>
                  )}
                  <Button variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Favoris
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Sélectionnez un message
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choisissez un message dans la liste pour le lire
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantMessages;
