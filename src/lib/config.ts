// ✅ CODE-002 : Configuration centralisée de l'application
// Cette configuration est utilisée par tous les services, y compris le client Supabase

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    // ✅ Sécurité : La clé service_role ne doit JAMAIS être exposée côté client
    // Utiliser des Edge Functions pour les opérations admin
  },
  site: {
    url: import.meta.env.VITE_SITE_URL || 'https://location-vacance.tn',
  },
  api: {
    baseUrl: import.meta.env.VITE_SUPABASE_URL,
    timeout: 10000, // 10 secondes
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  debounce: {
    searchDelay: 300, // 300ms
  }
} as const;
