import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageTracking } from '@/hooks/useGoogleAnalytics';

/**
 * Composant pour tracker automatiquement les changements de page
 * avec Google Analytics
 */
export const GoogleAnalyticsTracker = () => {
  const location = useLocation();
  
  // Tracker chaque changement de page
  usePageTracking(location.pathname, document.title);

  return null; // Ce composant ne rend rien
};
