import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

/**
 * Composant de test pour Google Analytics
 * Permet de tester les événements et conversions
 */
export const GoogleAnalyticsTest = () => {
  const { trackEvent, trackConversion } = useGoogleAnalytics();

  const handleTestEvent = () => {
    trackEvent('test_event', {
      event_category: 'test',
      event_label: 'bouton_test',
      value: 1
    });

  };

  const handleTestConversion = () => {
    trackConversion('test_conversion', 100);

  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">🧪 Test Google Analytics</h3>
      <div className="space-y-2">
        <button 
          onClick={handleTestEvent}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tester un événement
        </button>
        <button 
          onClick={handleTestConversion}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Tester une conversion
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Ouvrez la console pour voir les logs. Vérifiez Google Analytics en temps réel.
      </p>
    </div>
  );
};
