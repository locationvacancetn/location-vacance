import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  Megaphone, 
  Calendar, 
  Eye, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  Plus,
  BarChart3
} from "lucide-react";

const AdvertiserDashboard = () => {
  const { userProfile } = useUserRole();

  // Données d'exemple pour l'annonceur
  const stats = [
    {
      title: "Publicités Actives",
      value: "8",
      change: "+2",
      changeType: "positive" as const,
      icon: Megaphone,
      description: "Campagnes en cours"
    },
    {
      title: "Vues Total",
      value: "24,567",
      change: "+15%",
      changeType: "positive" as const,
      icon: Eye,
      description: "Ce mois"
    },
    {
      title: "Clics",
      value: "1,234",
      change: "+8%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Engagement"
    },
    {
      title: "Taux de Conversion",
      value: "5.2%",
      change: "+1.1%",
      changeType: "positive" as const,
      icon: BarChart3,
      description: "Performance"
    }
  ];

  const activeCampaigns = [
    {
      id: 1,
      title: "Promotion Villa de Luxe",
      type: "Banner",
      status: "active",
      views: "12,456",
      clicks: "234",
      ctr: "1.9%",
      budget: "€500",
      spent: "€320"
    },
    {
      id: 2,
      title: "Appartement Centre-Ville",
      type: "Carousel",
      status: "paused",
      views: "8,234",
      clicks: "156",
      ctr: "1.9%",
      budget: "€300",
      spent: "€180"
    },
    {
      id: 3,
      title: "Studio Moderne - Popup",
      type: "Popup",
      status: "active",
      views: "15,789",
      clicks: "445",
      ctr: "2.8%",
      budget: "€200",
      spent: "€95"
    }
  ];

  const recentPerformance = [
    {
      id: 1,
      campaign: "Promotion Villa de Luxe",
      date: "15 Jan 2024",
      impressions: "2,456",
      clicks: "45",
      conversions: "3",
      revenue: "€450"
    },
    {
      id: 2,
      campaign: "Appartement Centre-Ville",
      date: "14 Jan 2024",
      impressions: "1,789",
      clicks: "32",
      conversions: "2",
      revenue: "€180"
    }
  ];

  const getCampaignStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Actif
          </Badge>
        );
      case 'paused':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            En pause
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Terminé
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Banner':
        return <Badge className="bg-blue-100 text-blue-800">Banner</Badge>;
      case 'Carousel':
        return <Badge className="bg-purple-100 text-purple-800">Carousel</Badge>;
      case 'Popup':
        return <Badge className="bg-orange-100 text-orange-800">Popup</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Publicité
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className={`font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {stat.change}
                </span>
                <span>vs mois dernier</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campagnes actives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Campagnes Actives
            </CardTitle>
            <CardDescription>
              Vos publicités en cours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{campaign.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeBadge(campaign.type)}
                    <span className="text-xs text-muted-foreground">
                      {campaign.views} vues • {campaign.clicks} clics
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>CTR: {campaign.ctr}</span>
                    <span>Budget: {campaign.budget}</span>
                    <span>Dépensé: {campaign.spent}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getCampaignStatusBadge(campaign.status)}
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              Voir toutes les campagnes
            </Button>
          </CardContent>
        </Card>

        {/* Performance récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Récente
            </CardTitle>
            <CardDescription>
              Dernières performances de vos campagnes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPerformance.map((perf) => (
              <div key={perf.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{perf.campaign}</h4>
                  <p className="text-sm text-muted-foreground">{perf.date}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>{perf.impressions} impressions</span>
                    <span>{perf.clicks} clics</span>
                    <span>{perf.conversions} conversions</span>
                    <span className="font-medium text-foreground">{perf.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              Voir le rapport complet
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Gestion rapide de vos publicités
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2 h-16">
              <Megaphone className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Mes Publicités</div>
                <div className="text-xs text-muted-foreground">Gérer les campagnes</div>
              </div>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2 h-16">
              <BarChart3 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Analytics</div>
                <div className="text-xs text-muted-foreground">Voir les performances</div>
              </div>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2 h-16">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Rapports</div>
                <div className="text-xs text-muted-foreground">Générer des rapports</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvertiserDashboard;
