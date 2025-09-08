// Configuration sécurisée de l'application
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://snrlnfldhbopiyjwnjlu.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucmxuZmxkaGJvcGl5anduamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDQ4MTEsImV4cCI6MjA3MTc4MDgxMX0.AhPDCWgV7CL0yWOI_lIi4RQd__aTsP0jmFx7ZA9GCng',
    // ⚠️ En production, utiliser une Edge Function au lieu de la clé de service
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || null,
  },
  api: {
    baseUrl: 'https://snrlnfldhbopiyjwnjlu.supabase.co',
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

// Validation de la configuration
export const validateConfig = () => {
  if (!config.supabase.url) {
    throw new Error('VITE_SUPABASE_URL is required');
  }
  if (!config.supabase.anonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY is required');
  }
};
