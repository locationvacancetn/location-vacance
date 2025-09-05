import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Search, MoreVertical, Phone, Video } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const MessagesPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('MessagesPage');

  logger.debug('MessagesPage rendered');

  const conversations = [
    {
      id: 1,
      name: 'Marie Dubois',
      avatar: '/placeholder.svg',
      lastMessage: 'Merci pour votre accueil ! Nous avons passé un excellent séjour.',
      timestamp: 'Il y a 2h',
      unread: 2,
      isOnline: true
    },
    {
      id: 2,
      name: 'Ahmed Ben Ali',
      avatar: '/placeholder.svg',
      lastMessage: 'Pouvez-vous confirmer l\'heure d\'arrivée ?',
      timestamp: 'Il y a 4h',
      unread: 0,
      isOnline: false
    },
    {
      id: 3,
      name: 'Sophie Martin',
      avatar: '/placeholder.svg',
      lastMessage: 'La propriété est parfaite, je recommande !',
      timestamp: 'Hier',
      unread: 1,
      isOnline: true
    },
    {
      id: 4,
      name: 'Jean Dupont',
      avatar: '/placeholder.svg',
      lastMessage: 'Nous arrivons demain à 14h',
      timestamp: 'Il y a 2 jours',
      unread: 0,
      isOnline: false
    }
  ];

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Vos conversations avec les utilisateurs</p>
        </div>
        <div className="flex items-center space-x-2">
          {totalUnread > 0 && (
            <Badge variant="destructive" className="text-sm">
              {totalUnread} non lus
            </Badge>
          )}
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            Nouveau message
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Liste des conversations */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une conversation..."
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback>
                          {conversation.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conversation.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unread > 0 && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Zone de conversation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">Marie Dubois</h3>
                  <p className="text-sm text-green-600">En ligne</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-96 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-600">
                  Choisissez une conversation dans la liste pour commencer à discuter
                </p>
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Tapez votre message..."
                  className="flex-1"
                />
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;
