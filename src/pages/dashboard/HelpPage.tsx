import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Search, MessageCircle, Phone, Mail, BookOpen, Video, FileText } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const HelpPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('HelpPage');

  logger.debug('HelpPage rendered');

  const faqCategories = [
    {
      id: 1,
      title: 'Compte et profil',
      icon: <HelpCircle className="h-5 w-5" />,
      questions: [
        'Comment modifier mon profil ?',
        'Comment changer mon mot de passe ?',
        'Comment supprimer mon compte ?'
      ]
    },
    {
      id: 2,
      title: 'Réservations',
      icon: <MessageCircle className="h-5 w-5" />,
      questions: [
        'Comment créer une réservation ?',
        'Comment annuler une réservation ?',
        'Comment modifier une réservation ?'
      ]
    },
    {
      id: 3,
      title: 'Paiements',
      icon: <Phone className="h-5 w-5" />,
      questions: [
        'Quels modes de paiement sont acceptés ?',
        'Comment obtenir un remboursement ?',
        'Comment voir l\'historique des paiements ?'
      ]
    },
    {
      id: 4,
      title: 'Propriétés',
      icon: <BookOpen className="h-5 w-5" />,
      questions: [
        'Comment ajouter une propriété ?',
        'Comment modifier une propriété ?',
        'Comment gérer les photos ?'
      ]
    }
  ];

  const supportChannels = [
    {
      id: 1,
      title: 'Centre d\'aide',
      description: 'Consultez notre base de connaissances',
      icon: <BookOpen className="h-6 w-6" />,
      action: 'Consulter'
    },
    {
      id: 2,
      title: 'Chat en direct',
      description: 'Parlez avec notre équipe support',
      icon: <MessageCircle className="h-6 w-6" />,
      action: 'Démarrer le chat'
    },
    {
      id: 3,
      title: 'Téléphone',
      description: 'Appelez-nous au +216 71 123 456',
      icon: <Phone className="h-6 w-6" />,
      action: 'Appeler'
    },
    {
      id: 4,
      title: 'Email',
      description: 'Envoyez-nous un email',
      icon: <Mail className="h-6 w-6" />,
      action: 'Envoyer un email'
    }
  ];

  const tutorials = [
    {
      id: 1,
      title: 'Premiers pas sur OripioFin',
      description: 'Découvrez les fonctionnalités principales',
      duration: '5 min',
      type: 'video',
      icon: <Video className="h-5 w-5" />
    },
    {
      id: 2,
      title: 'Gérer vos propriétés',
      description: 'Apprenez à ajouter et gérer vos biens',
      duration: '8 min',
      type: 'video',
      icon: <Video className="h-5 w-5" />
    },
    {
      id: 3,
      title: 'Guide des réservations',
      description: 'Tout savoir sur le système de réservation',
      duration: '6 min',
      type: 'video',
      icon: <Video className="h-5 w-5" />
    },
    {
      id: 4,
      title: 'Documentation API',
      description: 'Guide technique pour les développeurs',
      duration: '15 min',
      type: 'document',
      icon: <FileText className="h-5 w-5" />
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centre d'aide</h1>
          <p className="text-gray-600">Trouvez l'aide dont vous avez besoin</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Comment pouvons-nous vous aider ?
            </h2>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher dans l'aide..."
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canaux de support */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {supportChannels.map((channel) => (
          <Card key={channel.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  {channel.icon}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{channel.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{channel.description}</p>
              <Button variant="outline" className="w-full">
                {channel.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Questions fréquemment posées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {faqCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    {category.icon}
                  </div>
                  {category.title}
                </h3>
                <div className="space-y-2">
                  {category.questions.map((question, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <p className="text-sm text-gray-700">{question}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tutoriels */}
      <Card>
        <CardHeader>
          <CardTitle>Tutoriels et guides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {tutorials.map((tutorial) => (
              <div key={tutorial.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {tutorial.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{tutorial.title}</h3>
                  <p className="text-sm text-gray-600">{tutorial.description}</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {tutorial.duration}
                    </Badge>
                    <Badge variant="outline" className="text-xs ml-2">
                      {tutorial.type === 'video' ? 'Vidéo' : 'Document'}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Voir
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Besoin d'aide supplémentaire ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Notre équipe support est là pour vous aider 7j/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <MessageCircle className="mr-2 h-4 w-4" />
                Démarrer une conversation
              </Button>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Envoyer un email
              </Button>
              <Button variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Appeler le support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;
