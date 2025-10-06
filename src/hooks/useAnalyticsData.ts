import { useState, useEffect } from 'react';
import { googleAnalyticsService } from '@/lib/analytics/GoogleAnalyticsService';

/**
 * Hook pour récupérer et gérer les données Google Analytics
 */
export const useAnalyticsData = () => {
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les données analytics
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [realTime, historical] = await Promise.all([
        googleAnalyticsService.getRealTimeData(),
        googleAnalyticsService.getHistoricalData(7),
      ]);

      setRealTimeData(realTime);
      setHistoricalData(historical);
    } catch (err) {
      console.error('Erreur lors de la récupération des données analytics:', err);
      setError('Impossible de récupérer les données analytics');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les données au montage du composant
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Rafraîchir les données en temps réel toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchAnalyticsData();
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [loading]);

  return {
    realTimeData,
    historicalData,
    loading,
    error,
    refresh: fetchAnalyticsData,
    clearCache: () => googleAnalyticsService.clearCache(),
    cacheStats: googleAnalyticsService.getCacheStats(),
  };
};
