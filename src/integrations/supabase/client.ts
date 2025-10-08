// ✅ CODE-002 : Configuration centralisée depuis config.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { config } from '@/lib/config';

// Validation de la configuration au chargement
if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error(
    '⚠️ Configuration Supabase manquante.\n' +
    'Veuillez créer un fichier .env.local à la racine du projet avec :\n' +
    '- VITE_SUPABASE_URL=votre-url-supabase\n' +
    '- VITE_SUPABASE_ANON_KEY=votre-cle-anon'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  config.supabase.url, 
  config.supabase.anonKey, 
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);