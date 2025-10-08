# 🚀 GUIDE DE DÉMARRAGE - CORRECTIONS DE SÉCURITÉ

## 📖 Vue d'ensemble

Ce guide vous aide à démarrer les corrections de sécurité identifiées lors de l'audit du code.

**Fichiers importants** :
- `SECURITY_ROADMAP.md` - Roadmap complète avec toutes les tâches
- `env.template` - Template de configuration mis à jour
- `SECURITY.md` - Documentation de sécurité existante

---

## ⚡ DÉMARRAGE RAPIDE (30 minutes)

### Étape 1 : Configuration des variables d'environnement

```bash
# 1. Copier le template
cp env.template .env.local

# 2. Éditer .env.local et remplir les valeurs
# Utiliser un éditeur de texte pour remplir :
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_GA_PROPERTY_ID (optionnel)
# - VITE_GA_MEASUREMENT_ID (optionnel)
```

### Étape 2 : Vérifier .gitignore

```bash
# S'assurer que .env.local est ignoré
grep ".env.local" .gitignore

# Si absent, l'ajouter :
echo ".env.local" >> .gitignore
```

### Étape 3 : Configurer les Secrets Supabase

```bash
# Aller sur https://app.supabase.com
# Projet > Settings > Edge Functions > Secrets
# Ajouter :
# - SMTP_HOST
# - SMTP_PORT
# - SMTP_USER
# - SMTP_PASSWORD
# - GOOGLE_ANALYTICS_PRIVATE_KEY (si utilisé)
# - GOOGLE_ANALYTICS_CLIENT_EMAIL (si utilisé)
```

---

## 🔴 CORRECTIONS CRITIQUES (À FAIRE EN PRIORITÉ)

### 1️⃣ Sécuriser SMTP (30 min)

**Fichier** : `supabase/functions/send-email/index.ts`

```typescript
// ❌ AVANT (ligne 173-176)
const smtpPassword = Deno.env.get('SMTP_PASSWORD') || 'e)1q6n3{u@#g';

// ✅ APRÈS
const smtpPassword = Deno.env.get('SMTP_PASSWORD');
if (!smtpPassword) {
  return new Response(
    JSON.stringify({ error: 'Configuration SMTP manquante' }),
    { status: 500, headers: corsHeaders }
  );
}
```

**Actions** :
1. Ouvrir `supabase/functions/send-email/index.ts`
2. Supprimer les valeurs par défaut (lignes 173-176)
3. Ajouter la validation
4. Configurer `SMTP_PASSWORD` dans Supabase Secrets
5. **Important** : Changer le mot de passe SMTP qui a été exposé

### 2️⃣ Supprimer les clés hardcodées (45 min)

**Fichier** : `src/integrations/supabase/client.ts`

```typescript
// ❌ AVANT (lignes 5-6)
const SUPABASE_URL = "https://snrlnfldhbopiyjwnjlu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJ...";

// ✅ APRÈS
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    '⚠️ Configuration Supabase manquante. Créez un fichier .env.local avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY'
  );
}
```

**Fichier** : `src/lib/config.ts`

```typescript
// Même correction
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  // ...
} as const;

// Validation
if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error('Configuration Supabase requise');
}
```

**Actions** :
1. Modifier `src/integrations/supabase/client.ts`
2. Modifier `src/lib/config.ts`
3. Créer `.env.local` avec les vraies valeurs
4. Tester l'application
5. Vérifier que tout fonctionne

### 3️⃣ Corriger le "chiffrement" Base64 (1 heure)

**Option A - Déplacer côté serveur (RECOMMANDÉ)**

Créer : `supabase/functions/manage-email-config/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

serve(async (req) => {
  // 1. Authentifier l'admin
  // 2. Récupérer/Sauvegarder la config
  // 3. Stocker le mot de passe dans les secrets
  // 4. Ne jamais envoyer le mot de passe au client
})
```

**Option B - Vrai chiffrement (si nécessaire)**

```typescript
// Utiliser Web Crypto API
async function encryptPassword(password: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Retourner IV + encrypted en base64
  return btoa(String.fromCharCode(...iv) + String.fromCharCode(...new Uint8Array(encrypted)));
}
```

**Actions** :
1. Choisir l'option (A recommandée)
2. Implémenter la solution
3. Migrer les mots de passe existants
4. Tester

### 4️⃣ Restreindre CORS (30 min)

**Fichier** : Créer `supabase/functions/_shared/cors.ts`

```typescript
const ALLOWED_ORIGINS = [
  'https://location-vacance.tn',
  'http://localhost:8085', // Dev only
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
```

**Puis dans chaque Edge Function** :

```typescript
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // ... reste du code
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
```

**Actions** :
1. Créer `supabase/functions/_shared/cors.ts`
2. Mettre à jour les 5 Edge Functions
3. Tester depuis le domaine autorisé
4. Vérifier le blocage des autres domaines

---

## 🟠 APRÈS LES CORRECTIONS CRITIQUES

### 5️⃣ Supprimer le service dupliqué (30 min)

```bash
# 1. Lister les imports de l'ancien service
grep -r "from.*googleAnalyticsService" src/

# 2. Remplacer par le nouveau
# Ancien : from '@/lib/googleAnalyticsService'
# Nouveau : from '@/lib/analytics/GoogleAnalyticsService'

# 3. Supprimer l'ancien fichier
rm src/lib/googleAnalyticsService.ts
```

### 6️⃣ Créer utilitaires partagés (20 min)

**Fichier** : `src/lib/utils/validation.ts`

```typescript
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validateEmailList(emails: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  emails.forEach(email => {
    if (validateEmail(email)) {
      valid.push(email.trim());
    } else {
      invalid.push(email);
    }
  });

  return { valid, invalid };
}
```

**Utilisation** :

```typescript
import { validateEmail } from '@/lib/utils/validation';

// Au lieu de répéter la regex partout
if (validateEmail(email)) {
  // ...
}
```

---

## 📋 CHECKLIST DE SÉCURITÉ

Avant de déployer en production :

- [ ] ✅ Toutes les variables d'environnement sont configurées
- [ ] ✅ Aucun mot de passe ou secret dans le code
- [ ] ✅ CORS restreint aux domaines autorisés
- [ ] ✅ Secrets configurés dans Supabase
- [ ] ✅ `.env.local` dans `.gitignore`
- [ ] ✅ Mot de passe SMTP changé (s'il était exposé)
- [ ] ✅ Tests fonctionnels OK
- [ ] ✅ Pas de `console.log` sensibles
- [ ] ✅ Edge Functions déployées
- [ ] ✅ Documentation mise à jour

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Configuration Supabase
```bash
# Sans .env.local, l'app doit afficher une erreur claire
rm .env.local
npm run dev
# Devrait afficher : "Configuration Supabase manquante"
```

### Test 2 : Envoi d'email
```bash
# Avec les secrets configurés
# Tester l'envoi d'email depuis l'admin
# Vérifier que ça fonctionne sans exposer le mot de passe
```

### Test 3 : CORS
```bash
# Depuis un autre domaine (ex: CodePen), essayer d'appeler l'API
# Devrait être bloqué par CORS
```

---

## 🆘 EN CAS DE PROBLÈME

### Erreur : "Configuration Supabase manquante"
**Solution** : Créer `.env.local` et remplir `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

### Erreur : "SMTP configuration missing"
**Solution** : Configurer les secrets SMTP dans Supabase

### Erreur CORS
**Solution** : Vérifier que votre domaine est dans `ALLOWED_ORIGINS`

### L'app ne démarre pas
**Solution** : Vérifier les logs console pour voir quelle config manque

---

## 📞 PROCHAINES ÉTAPES

1. **Suivre la roadmap** : Ouvrir `SECURITY_ROADMAP.md`
2. **Cocher les tâches** : Marquer `[x]` quand complété
3. **Mettre à jour le statut** : ❌ → 🔄 → ✅
4. **Tester régulièrement** : Après chaque correction majeure
5. **Committer** : Git commit après chaque tâche complétée

---

## 📚 RESSOURCES

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

**Temps estimé total** : 3-4 heures pour les corrections critiques  
**Bonne chance ! 🚀**

