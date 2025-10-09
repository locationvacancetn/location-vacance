import { useEffect } from 'react';

// Déclaration globale pour gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

/**
 * Hook personnalisé pour Google Analytics
 * Permet de tracker les pages vues et événements
 */
export const useGoogleAnalytics = () => {
  // Fonction pour tracker une page vue
  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-59S7Q6K1HF', {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
  };

  // Fonction pour tracker un événement
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  };

  // Fonction pour tracker une conversion
  const trackConversion = (conversionName: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-59S7Q6K1HF',
        event_category: 'conversion',
        event_label: conversionName,
        value: value,
      });
    }
  };

  return {
    trackPageView,
    trackEvent,
    trackConversion,
  };
};

/**
 * Hook pour tracker automatiquement les changements de page
 */
export const usePageTracking = (pagePath: string, pageTitle?: string) => {
  const { trackPageView } = useGoogleAnalytics();

  useEffect(() => {
    trackPageView(pagePath, pageTitle);
  }, [pagePath, pageTitle, trackPageView]);
};
