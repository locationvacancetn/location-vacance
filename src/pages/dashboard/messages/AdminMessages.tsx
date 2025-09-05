import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Users,
  Shield,
  Ban,
  CheckCircle2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isImportant: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'support' | 'complaint' | 'suggestion' | 'technical' | 'billing';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  userId: string;
  userRole: string;
  avatar?: string;
}

const AdminMessages = () => {
  const { userProfile } = useUserRole();
  const [activeTab, setActiveTab] = useState<'all' | 'support' | 'complaints' | 'urgent'>('all');
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Données d'exemple pour les messages admin
  const messages: AdminMessage[] = [
    {
      id: '1',
      from: 'Marie Dupont',
      to: 'Support',
      subject: 'Problème de paiement - URGENT',
      content: 'Bonjour, j\'ai un problème avec mon paiement. La transaction a été débitée mais la réservation n\'apparaît pas. Pouvez-vous m\'aider rapidement ?',
      timestamp: 'Il y a 30 min',
      isRead: false,
      isImportant: true,
      priority: 'urgent',
      category: 'billing',
      status: 'open',
      userId: 'user_123',
      userRole: 'tenant',
      avatar: 'MD'
    },
    {
      id: '2',
      from: 'Ahmed Ben Ali',
      to: 'Support',
      subject: 'Signalement de contenu inapproprié',
      content: 'J\'ai trouvé une annonce avec des photos inappropriées. Voici le lien : /property/456',
      timestamp: 'Il y a 2 heures',
      isRead: true,
      isImportant: true,
      priority: 'high',
      category: 'complaint',
      status: 'in_progress',
      userId: 'user_456',
      userRole: 'tenant',
      avatar: 'AB'
    },
    {
      id: '3',
      from: 'Sophie Martin',
      to: 'Support',
      subject: 'Suggestion d\'amélioration',
      content: 'Serait-il possible d\'ajouter un filtre par prix dans la recherche ? Cela m\'aiderait beaucoup.',
      timestamp: 'Il y a 1 jour',
      isRead: true,
      isImportant: false,
      priority: 'low',
      category: 'suggestion',
      status: 'open',
      userId: 'user_789',
      userRole: 'tenant',
      avatar: 'SM'
    },
    {
      id: '4',
      from: 'Pierre Dubois',
      to: 'Support',
      subject: 'Problème technique - Connexion',
      content: 'Je n\'arrive pas à me connecter depuis hier. Erreur 500 sur la page de connexion.',
      timestamp: 'Il y a 3 heures',
      isRead: false,
      isImportant: false,
      priority: 'medium',
      category: 'technical',
      status: 'open',
      userId: 'user_321',
      userRole: 'owner',
      avatar: 'PD'
    }
  ];

  const filteredMessages = messages.filter(message => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'support' && message.category === 'support') ||
      (activeTab === 'complaints' && message.category === 'complaint') ||
      (activeTab === 'urgent' && message.priority === 'urgent');
    
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || message.priority === priorityFilter;
    
    return matchesTab && matchesSearch && matchesPriority;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-500">Élevé</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-500">Moyen</Badge>;
      case 'low':
        return <Badge variant="outline">Faible</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="text-blue-600">Ouvert</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="text-orange-600">En cours</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-600">Résolu</Badge>;
      case 'closed':
        return <Badge variant="secondary">Fermé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'support':
        return <MessageCircle className="h-4 w-4" />;
      case 'complaint':
        return <AlertCircle className="h-4 w-4" />;
      case 'suggestion':
        return <Star className="h-4 w-4" />;
      case 'technical':
        return <Shield className="h-4 w-4" />;
      case 'billing':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const urgentCount = messages.filter(m => m.priority === 'urgent' && !m.isRead).length;
  const supportCount = messages.filter(m => m.category === 'support' && !m.isRead).length;
  const complaintsCount = messages.filter(m => m.category === 'complaint' && !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Messages Administrateur
          </h1>
          <p className="text-muted-foreground">Gérez tous les messages de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Utilisateurs
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
                <p className="text-sm font-medium text-muted-foreground">Messages Urgents</p>
                <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Support</p>
                <p className="text-2xl font-bold text-blue-600">{supportCount}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plaintes</p>
                <p className="text-2xl font-bold text-orange-600">{complaintsCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
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
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">Élevé</SelectItem>
                      <SelectItem value="medium">Moyen</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
                    </SelectContent>
                  </Select>
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
                  onClick={() => setActiveTab('urgent')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'urgent'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Urgent {urgentCount > 0 && <Badge variant="destructive" className="ml-1">{urgentCount}</Badge>}
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
                <button
                  onClick={() => setActiveTab('complaints')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'complaints'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Plaintes
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
                            {getPriorityBadge(message.priority)}
                            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{message.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getCategoryIcon(message.category)}
                            <span className="capitalize">{message.category}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {message.userRole}
                          </Badge>
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
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marquer résolu
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="h-4 w-4 mr-2" />
                            Archiver
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="h-4 w-4 mr-2" />
                            Suspendre utilisateur
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
                      <span>Rôle: {selectedMessage.userRole}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedMessage.timestamp}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(selectedMessage.priority)}
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
                  <Button variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer résolu
                  </Button>
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Transférer
                  </Button>
                  <Button variant="outline" className="text-red-600">
                    <Ban className="h-4 w-4 mr-2" />
                    Suspendre
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Sélectionnez un message
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choisissez un message dans la liste pour le gérer
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

export default AdminMessages;
