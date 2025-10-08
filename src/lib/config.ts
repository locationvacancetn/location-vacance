// Configuration sécurisée de l'application
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    // ✅ Sécurité : La clé service_role ne doit JAMAIS être exposée côté client
    // Utiliser des Edge Functions pour les opérations admin
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
    throw new Error(
      '⚠️ Variables d\'environnement manquantes.\n' +
      'Créez un fichier .env.local avec :\n' +
      '- VITE_SUPABASE_URL\n' +
      '- VITE_SUPABASE_ANON_KEY'
    );
  }
  
  return true;
};
