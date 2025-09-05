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
  Megaphone,
  BarChart3,
  Target,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdvertiserMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isImportant: boolean;
  type: 'campaign_update' | 'performance_report' | 'approval' | 'support' | 'promotion';
  campaignId?: string;
  campaignName?: string;
  status: 'new' | 'read' | 'archived';
  priority: 'low' | 'medium' | 'high';
  avatar?: string;
}

const AdvertiserMessages = () => {
  const { userProfile } = useUserRole();
  const [activeTab, setActiveTab] = useState<'all' | 'campaigns' | 'reports' | 'approvals'>('all');
  const [selectedMessage, setSelectedMessage] = useState<AdvertiserMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Données d'exemple pour les messages annonceur
  const messages: AdvertiserMessage[] = [
    {
      id: '1',
      from: 'Équipe LocVac',
      to: userProfile?.full_name || 'Vous',
      subject: 'Votre campagne "Villa Luxe" a été approuvée',
      content: 'Félicitations ! Votre campagne publicitaire pour la "Villa de Luxe - Sidi Bou Said" a été approuvée et est maintenant active. Elle sera visible sur notre plateforme dans les prochaines heures.',
      timestamp: 'Il y a 30 min',
      isRead: false,
      isImportant: true,
      type: 'approval',
      campaignId: 'camp_123',
      campaignName: 'Villa Luxe - Sidi Bou Said',
      status: 'new',
      priority: 'high',
      avatar: 'LV'
    },
    {
      id: '2',
      from: 'Analytics LocVac',
      to: userProfile?.full_name || 'Vous',
      subject: 'Rapport de performance - Semaine 1',
      content: 'Voici votre rapport de performance pour la semaine du 1er au 7 janvier :\n\n- Impressions : 12,456 (+15%)\n- Clics : 234 (+8%)\n- Conversions : 12 (+20%)\n- ROI : 3.2x\n\nExcellente performance ! Continuez ainsi.',
      timestamp: 'Il y a 2 heures',
      isRead: true,
      isImportant: false,
      type: 'performance_report',
      campaignId: 'camp_456',
      campaignName: 'Appartement Centre-Ville',
      status: 'read',
      priority: 'medium',
      avatar: 'AL'
    },
    {
      id: '3',
      from: 'Support Publicitaire',
      to: userProfile?.full_name || 'Vous',
      subject: 'Mise à jour de votre campagne "Studio Moderne"',
      content: 'Nous avons détecté une amélioration possible pour votre campagne. Nous vous suggérons d\'ajuster vos mots-clés pour cibler "appartement moderne" en plus de "studio". Voulez-vous que nous appliquions cette modification ?',
      timestamp: 'Il y a 1 jour',
      isRead: true,
      isImportant: false,
      type: 'campaign_update',
      campaignId: 'camp_789',
      campaignName: 'Studio Moderne',
      status: 'read',
      priority: 'medium',
      avatar: 'SP'
    },
    {
      id: '4',
      from: 'Équipe LocVac',
      to: userProfile?.full_name || 'Vous',
      subject: 'Nouvelle fonctionnalité : Ciblage géographique',
      content: 'Découvrez notre nouvelle fonctionnalité de ciblage géographique ! Vous pouvez maintenant cibler vos publicités par région, ville ou même quartier. Essayez-la gratuitement pendant 30 jours !',
      timestamp: 'Il y a 3 jours',
      isRead: false,
      isImportant: false,
      type: 'promotion',
      status: 'new',
      priority: 'low',
      avatar: 'LV'
    }
  ];

  const filteredMessages = messages.filter(message => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'campaigns' && message.type === 'campaign_update') ||
      (activeTab === 'reports' && message.type === 'performance_report') ||
      (activeTab === 'approvals' && message.type === 'approval');
    
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (message.campaignName && message.campaignName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'campaign_update':
        return <Megaphone className="h-4 w-4 text-blue-500" />;
      case 'performance_report':
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      case 'approval':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
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
      case 'campaign_update':
        return <Badge className="bg-blue-100 text-blue-800">Campagne</Badge>;
      case 'performance_report':
        return <Badge className="bg-green-100 text-green-800">Rapport</Badge>;
      case 'approval':
        return <Badge className="bg-green-100 text-green-800">Approbation</Badge>;
      case 'support':
        return <Badge className="bg-purple-100 text-purple-800">Support</Badge>;
      case 'promotion':
        return <Badge className="bg-yellow-100 text-yellow-800">Promotion</Badge>;
      default:
        return <Badge variant="outline">Général</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Élevé</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-orange-600">Moyen</Badge>;
      case 'low':
        return <Badge variant="outline">Faible</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
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

  const newApprovalsCount = messages.filter(m => m.type === 'approval' && m.status === 'new').length;
  const reportsCount = messages.filter(m => m.type === 'performance_report' && !m.isRead).length;
  const campaignsCount = messages.filter(m => m.type === 'campaign_update' && !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-8 w-8" />
            Messages Annonceur
          </h1>
          <p className="text-muted-foreground">Gérez vos communications publicitaires</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
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
                <p className="text-sm font-medium text-muted-foreground">Nouvelles Approbations</p>
                <p className="text-2xl font-bold text-green-600">{newApprovalsCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rapports</p>
                <p className="text-2xl font-bold text-blue-600">{reportsCount}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campagnes</p>
                <p className="text-2xl font-bold text-purple-600">{campaignsCount}</p>
              </div>
              <Megaphone className="h-8 w-8 text-purple-500" />
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
                  onClick={() => setActiveTab('approvals')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'approvals'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Approbations {newApprovalsCount > 0 && <Badge variant="destructive" className="ml-1">{newApprovalsCount}</Badge>}
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'reports'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Rapports
                </button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'campaigns'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Campagnes
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
                        {message.campaignName && (
                          <p className="text-xs text-blue-600 truncate">{message.campaignName}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {getTypeBadge(message.type)}
                          {getPriorityBadge(message.priority)}
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
                          {message.campaignId && (
                            <DropdownMenuItem>
                              <Megaphone className="h-4 w-4 mr-2" />
                              Voir campagne
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Voir analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Target className="h-4 w-4 mr-2" />
                            Optimiser
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
                      {selectedMessage.campaignName && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">{selectedMessage.campaignName}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(selectedMessage.type)}
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
                  {selectedMessage.campaignId && (
                    <Button variant="outline">
                      <Megaphone className="h-4 w-4 mr-2" />
                      Voir campagne
                    </Button>
                  )}
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Optimiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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

export default AdvertiserMessages;
