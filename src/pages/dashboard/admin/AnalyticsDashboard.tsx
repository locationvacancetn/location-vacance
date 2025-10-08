import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Globe, RotateCwSquare, Bug } from 'lucide-react';
import { googleAnalyticsService } from '@/lib/googleAnalyticsService';

/**
 * Dashboard Analytics simplifié - Utilisateurs en ligne uniquement
 */
export const AnalyticsDashboard = () => {
  const { realTimeData, loading, error, refresh } = useAnalyticsData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RotateCwSquare className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des données analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Monitoring du Site</h1>
          <p className="text-muted-foreground">
            Utilisateurs en ligne en temps réel
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              googleAnalyticsService.clearCache();

              refresh();
            }} 
            size="sm" 
            variant="outline"
          >
            <Bug className="h-4 w-4 mr-2" />
            Vider Cache
          </Button>
          <Button onClick={refresh} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <RotateCwSquare className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Utilisateurs en ligne et pays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilisateurs en ligne */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Utilisateurs en ligne</CardTitle>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600 text-center">
              {realTimeData?.activeUsers || 0}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Utilisateurs actifs au cours des 5 dernières minutes
            </p>
          </CardContent>
        </Card>

        {/* Pays d'origine */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Pays d'origine</CardTitle>
            <Globe className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realTimeData?.topCountries && realTimeData.topCountries.length > 0 ? (
                realTimeData.topCountries.slice(0, 5).map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{country.country}</span>
                    <Badge variant="outline" className="text-green-600">
                      {country.activeUsers} utilisateur{country.activeUsers > 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune donnée géographique disponible
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pages les plus visitées */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">📄 Pages les plus visitées</CardTitle>
          <p className="text-sm text-muted-foreground">
            Vues par titre de la page et nom de l'écran
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {realTimeData?.topPages && realTimeData.topPages.length > 0 ? (
              realTimeData.topPages.slice(0, 6).map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {page.pageTitle || page.pagePath}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {page.pagePath}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-blue-600">
                    {page.activeUsers} vues
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune donnée de pages disponible
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
