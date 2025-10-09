/**
 * Service Google Analytics professionnel et scalable
 * Gère toutes les interactions avec l'API Google Analytics
 */

export interface AnalyticsConfig {
  propertyId: string;
  dimensions: string[];
  metrics: string[];
  dateRanges: {
    startDate: string;
    endDate: string;
  }[];
  orderBys?: Array<{
    metric?: { metricName: string };
    dimension?: { dimensionName: string };
    desc: boolean;
  }>;
  limit?: number;
}

export interface AnalyticsResponse {
  dimensionHeaders: Array<{ name: string }>;
  metricHeaders: Array<{ name: string; type: string }>;
  rows: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
  totals?: Array<{
    metricValues: Array<{ value: string }>;
  }>;
  rowCount: number;
  metadata?: any;
}

export class GoogleAnalyticsService {
  private accessToken: string | null = null;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Obtient un token d'accès Google Analytics
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'obtention du token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      throw error;
    }
  }

  /**
   * Génère une clé de cache basée sur la configuration
   */
  private getCacheKey(config: AnalyticsConfig): string {
    return JSON.stringify(config);
  }

  /**
   * Vérifie si les données sont en cache et valides
   */
  private isCacheValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.CACHE_DURATION;
  }

  /**
   * Récupère les données depuis le cache ou l'API
   */
  private async fetchData(config: AnalyticsConfig): Promise<AnalyticsResponse> {
    const cacheKey = this.getCacheKey(config);
    
    // Vérifier le cache
    if (this.isCacheValid(cacheKey)) {

      return this.cache.get(cacheKey)!.data;
    }

    // Récupérer depuis l'API
    const accessToken = await this.getAccessToken();
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        accessToken,
        config,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Mettre en cache
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  /**
   * Récupère les données temps réel (utilisateurs actifs)
   */
  async getRealTimeData(): Promise<{
    activeUsers: number;
    topPages: Array<{ pagePath: string; pageTitle: string; activeUsers: number }>;
    topCountries: Array<{ country: string; activeUsers: number }>;
  }> {
    const config: AnalyticsConfig = {
      propertyId: import.meta.env.VITE_GA_PROPERTY_ID || '507427571',
      dimensions: ['pagePath', 'pageTitle', 'country'],
      metrics: ['activeUsers'],
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      limit: 10,
    };

    const data = await this.fetchData(config);
    
    // Calculer le total des utilisateurs actifs
    let activeUsers = 0;
    if (data.totals && data.totals.length > 0) {
      activeUsers = parseInt(data.totals[0].metricValues?.[0]?.value || '0');
    } else if (data.rows && data.rows.length > 0) {
      activeUsers = data.rows.reduce((sum, row) => {
        return sum + parseInt(row.metricValues?.[0]?.value || '0');
      }, 0);
    }

    // Traiter les pages
    const topPages = data.rows?.slice(0, 6).map((row) => ({
      pagePath: row.dimensionValues?.[0]?.value || '',
      pageTitle: row.dimensionValues?.[1]?.value || '',
      activeUsers: parseInt(row.metricValues?.[0]?.value || '0'),
    })) || [];

    // Traiter les pays
    const topCountries = data.rows?.slice(0, 5).map((row) => ({
      country: row.dimensionValues?.[2]?.value || '',
      activeUsers: parseInt(row.metricValues?.[0]?.value || '0'),
    })) || [];

    return {
      activeUsers,
      topPages,
      topCountries,
    };
  }

  /**
   * Récupère les données historiques
   */
  async getHistoricalData(days: number = 7): Promise<{
    topPages: Array<{ pagePath: string; pageTitle: string; pageViews: number }>;
    topCountries: Array<{ country: string; users: number }>;
    deviceCategories: Array<{ deviceCategory: string; users: number }>;
  }> {
    const config: AnalyticsConfig = {
      propertyId: import.meta.env.VITE_GA_PROPERTY_ID || '507427571',
      dimensions: ['pagePath', 'pageTitle', 'country', 'deviceCategory'],
      metrics: ['activeUsers', 'screenPageViews'],
      dateRanges: [{ 
        startDate: `${days}daysAgo`, 
        endDate: 'today' 
      }],
      orderBys: [{
        metric: { metricName: 'screenPageViews' },
        desc: true,
      }],
      limit: 10,
    };

    const data = await this.fetchData(config);

    const topPages = data.rows?.slice(0, 5).map((row) => ({
      pagePath: row.dimensionValues?.[0]?.value || '',
      pageTitle: row.dimensionValues?.[1]?.value || '',
      pageViews: parseInt(row.metricValues?.[1]?.value || '0'),
    })) || [];

    const topCountries = data.rows?.slice(0, 5).map((row) => ({
      country: row.dimensionValues?.[2]?.value || '',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
    })) || [];

    const deviceCategories = data.rows?.slice(0, 3).map((row) => ({
      deviceCategory: row.dimensionValues?.[3]?.value || '',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
    })) || [];

    return {
      topPages,
      topCountries,
      deviceCategories,
    };
  }

  /**
   * Récupère des données personnalisées
   */
  async getCustomData(config: AnalyticsConfig): Promise<AnalyticsResponse> {
    return await this.fetchData(config);
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obtient les statistiques du cache
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Instance singleton
export const googleAnalyticsService = new GoogleAnalyticsService();
