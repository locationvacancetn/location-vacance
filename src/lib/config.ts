// Configuration sécurisée de l'application
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://snrlnfldhbopiyjwnjlu.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucmxuZmxkaGJvcGl5anduamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDQ4MTEsImV4cCI6MjA3MTc4MDgxMX0.AhPDCWgV7CL0yWOI_lIi4RQd__aTsP0jmFx7ZA9GCng',
    // ✅ Sécurité : La clé service_role ne doit JAMAIS être exposée côté client
    // Utiliser des Edge Functions pour les opérations admin
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
  
  // Validation de l'URL Supabase
  if (!config.supabase.url.startsWith('https://')) {
    throw new Error('VITE_SUPABASE_URL must use HTTPS');
  }
  
  // Validation de la clé anonyme (format JWT)
  if (!config.supabase.anonKey.startsWith('eyJ')) {
    throw new Error('VITE_SUPABASE_ANON_KEY must be a valid JWT token');
  }
  
  console.log('✅ Configuration Supabase validée');
};

// Fonction pour vérifier si on utilise des variables d'environnement
export const isUsingEnvVars = () => {
  const hasEnvUrl = !!import.meta.env.VITE_SUPABASE_URL;
  const hasEnvKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!hasEnvUrl || !hasEnvKey) {
    console.warn('⚠️ Variables d\'environnement manquantes. Utilisation des valeurs par défaut.');
    console.warn('📝 Créez un fichier .env.local avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
  }
  
  return hasEnvUrl && hasEnvKey;
};
