/**
 * Configuration centralisée pour Google Analytics
 * Facilite l'ajout de nouvelles dimensions et métriques
 */

export const ANALYTICS_CONFIG = {
  // ✅ CODE-004 : ID depuis variable d'environnement
  PROPERTY_ID: import.meta.env.VITE_GA_PROPERTY_ID || '507427571',
  
  // Dimensions disponibles
  DIMENSIONS: {
    // Pages
    PAGE_PATH: 'pagePath',
    PAGE_TITLE: 'pageTitle',
    
    // Géographie
    COUNTRY: 'country',
    CITY: 'city',
    REGION: 'region',
    
    // Démographie
    AGE: 'age',
    GENDER: 'gender',
    
    // Appareils
    DEVICE_CATEGORY: 'deviceCategory',
    DEVICE_BRAND: 'deviceBrand',
    OPERATING_SYSTEM: 'operatingSystem',
    BROWSER: 'browser',
    
    // Sources de trafic
    SOURCE: 'source',
    MEDIUM: 'medium',
    CAMPAIGN: 'campaign',
    
    // Événements
    EVENT_NAME: 'eventName',
    EVENT_CATEGORY: 'eventCategory',
    EVENT_ACTION: 'eventAction',
    EVENT_LABEL: 'eventLabel',
  },
  
  // Métriques disponibles
  METRICS: {
    // Utilisateurs
    ACTIVE_USERS: 'activeUsers',
    TOTAL_USERS: 'totalUsers',
    NEW_USERS: 'newUsers',
    
    // Sessions
    SESSIONS: 'sessions',
    SESSION_DURATION: 'averageSessionDuration',
    BOUNCE_RATE: 'bounceRate',
    
    // Pages
    PAGE_VIEWS: 'screenPageViews',
    PAGE_VIEWS_PER_SESSION: 'screenPageViewsPerSession',
    
    // Événements
    EVENT_COUNT: 'eventCount',
    CONVERSIONS: 'conversions',
    
    // E-commerce
    REVENUE: 'totalRevenue',
    PURCHASES: 'purchases',
    PURCHASE_REVENUE: 'purchaseRevenue',
  },
  
  // Périodes prédéfinies
  DATE_RANGES: {
    TODAY: { startDate: 'today', endDate: 'today' },
    YESTERDAY: { startDate: 'yesterday', endDate: 'yesterday' },
    LAST_7_DAYS: { startDate: '7daysAgo', endDate: 'today' },
    LAST_30_DAYS: { startDate: '30daysAgo', endDate: 'today' },
    LAST_90_DAYS: { startDate: '90daysAgo', endDate: 'today' },
    THIS_MONTH: { startDate: 'thisMonth', endDate: 'today' },
    LAST_MONTH: { startDate: 'lastMonth', endDate: 'lastMonth' },
  },
  
  // Configurations prédéfinies
  PRESETS: {
    // Dashboard temps réel
    REALTIME_DASHBOARD: {
      dimensions: ['pagePath', 'pageTitle', 'country'],
      metrics: ['activeUsers'],
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      limit: 10,
    },
    
    // Pages populaires
    TOP_PAGES: {
      dimensions: ['pagePath', 'pageTitle'],
      metrics: ['screenPageViews', 'activeUsers'],
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    },
    
    // Géographie
    GEOGRAPHY: {
      dimensions: ['country', 'city'],
      metrics: ['activeUsers', 'sessions'],
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10,
    },
    
    // Appareils
    DEVICES: {
      dimensions: ['deviceCategory', 'operatingSystem', 'browser'],
      metrics: ['activeUsers', 'sessions'],
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10,
    },
    
    // Sources de trafic
    TRAFFIC_SOURCES: {
      dimensions: ['source', 'medium', 'campaign'],
      metrics: ['sessions', 'activeUsers'],
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    },
    
    // Événements
    EVENTS: {
      dimensions: ['eventName', 'eventCategory', 'eventAction'],
      metrics: ['eventCount', 'activeUsers'],
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 10,
    },
  },
} as const;

/**
 * Crée une configuration personnalisée
 */
export function createCustomConfig(
  dimensions: string[],
  metrics: string[],
  dateRange: { startDate: string; endDate: string },
  options: {
    orderBys?: Array<{ metric?: { metricName: string }; dimension?: { dimensionName: string }; desc: boolean }>;
    limit?: number;
  } = {}
) {
  return {
    propertyId: ANALYTICS_CONFIG.PROPERTY_ID,
    dimensions,
    metrics,
    dateRanges: [dateRange],
    orderBys: options.orderBys || [],
    limit: options.limit || 10,
  };
}

/**
 * Utilise une configuration prédéfinie
 */
export function usePreset(presetName: keyof typeof ANALYTICS_CONFIG.PRESETS) {
  return {
    propertyId: ANALYTICS_CONFIG.PROPERTY_ID,
    ...ANALYTICS_CONFIG.PRESETS[presetName],
  };
}
