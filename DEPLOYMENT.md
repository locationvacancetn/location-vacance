# 🚀 Guide de Déploiement Sécurisé

## 📋 Prérequis

### **1. Variables d'environnement**
Créez un fichier `.env.local` à la racine du projet :

```bash
# Copiez env.template vers .env.local
cp env.template .env.local

# Éditez .env.local avec vos vraies valeurs
VITE_SUPABASE_URL=https://snrlnfldhbopiyjwnjlu.supabase.co
VITE_SUPABASE_ANON_KEY=votre_vraie_cle_anonyme
```

### **2. Vérification de sécurité**
```bash
# Vérifiez que la clé service_role n'est PAS dans .env.local
grep -i "service_role" .env.local
# Ne doit rien retourner
```

## 🔧 Déploiement

### **1. Déploiement de la Edge Function**
```bash
# Dans Supabase Dashboard
# 1. Allez dans Edge Functions
# 2. Créez une fonction "create-user"
# 3. Copiez le code de supabase/functions/create-user/index.ts
# 4. Déployez
```

### **2. Vérification post-déploiement**
```bash
# Testez l'endpoint
curl -X POST https://snrlnfldhbopiyjwnjlu.supabase.co/functions/v1/create-user \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'

# Doit retourner 401 (normal - pas d'auth)
```

## 🔒 Sécurité

### **✅ Ce qui est sécurisé :**
- ✅ Clé service_role protégée côté serveur
- ✅ Authentification admin requise
- ✅ Validation complète des données
- ✅ Gestion d'erreurs robuste
- ✅ CORS configuré

### **⚠️ Points d'attention :**
- ⚠️ Clé anonyme exposée (normal pour Supabase)
- ⚠️ URL Supabase visible (normal)
- ⚠️ Variables d'environnement dans .env.local (ajoutez à .gitignore)

## 🧪 Tests

### **Test de création d'utilisateur :**
1. Connectez-vous en tant qu'admin
2. Allez sur `/dashboard/admin/add-user`
3. Remplissez le formulaire
4. Vérifiez la création dans Supabase Dashboard

### **Test de sécurité :**
1. Essayez de créer un utilisateur sans être connecté → 401
2. Essayez avec un utilisateur non-admin → 403
3. Vérifiez les logs de la Edge Function

## 📊 Monitoring

### **Logs à surveiller :**
- Tentatives de création d'utilisateurs
- Erreurs d'authentification
- Erreurs de validation

### **Métriques importantes :**
- Nombre de créations d'utilisateurs par jour
- Taux d'erreur de la Edge Function
- Temps de réponse moyen
