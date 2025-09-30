# 🔒 Guide de Sécurité - Création d'Utilisateurs

## ✅ Sécurité Implémentée

### **1. Architecture Sécurisée**
- ✅ **Edge Function** : Toute la logique de création d'utilisateur est côté serveur
- ✅ **Clé service_role protégée** : Jamais exposée côté client
- ✅ **Authentification requise** : Seuls les admins peuvent créer des utilisateurs
- ✅ **Validation complète** : Côté client ET serveur

### **2. Variables d'Environnement**
```bash
# Obligatoires
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ⚠️ INTERDIT côté client
# SUPABASE_SERVICE_ROLE_KEY (uniquement dans les Edge Functions)
```

### **3. Flux de Sécurité**
1. **Client** → Validation des données
2. **Client** → Envoi avec token d'authentification
3. **Edge Function** → Validation serveur + création utilisateur
4. **Edge Function** → Retour sécurisé

## 🚨 Points de Vigilance

### **Ne JAMAIS faire :**
- ❌ Exposer la clé `service_role` côté client
- ❌ Créer des utilisateurs directement depuis le client
- ❌ Hardcoder des mots de passe par défaut
- ❌ Oublier la validation côté serveur

### **Toujours vérifier :**
- ✅ Variables d'environnement configurées
- ✅ Authentification admin active
- ✅ Validation des rôles
- ✅ Gestion d'erreurs complète

## 🔧 Maintenance

### **Mise à jour des clés :**
1. Régénérer les clés dans Supabase Dashboard
2. Mettre à jour les variables d'environnement
3. Redéployer les Edge Functions si nécessaire

### **Monitoring :**
- Vérifier les logs des Edge Functions
- Surveiller les tentatives de création d'utilisateurs
- Contrôler les accès admin

## 📞 Support

En cas de problème de sécurité :
1. Vérifier les logs Supabase
2. Contrôler les variables d'environnement
3. Tester l'authentification admin
