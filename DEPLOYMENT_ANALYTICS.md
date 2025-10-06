# 🚀 Guide de Déploiement - Google Analytics en Production

## 📋 **Vue d'ensemble**
Ce guide vous accompagne pour déployer votre application avec Google Analytics depuis localhost vers un domaine de production, en conservant toutes les fonctionnalités analytics.

---

## 🔧 **1. Configuration Google Analytics**

### **1.1. Mise à jour du domaine dans Google Analytics**
1. **Allez dans Google Analytics** → **Admin** → **Propriétés de données**
2. **Sélectionnez votre propriété** (Location-vacance)
3. **Cliquez sur "Flux de données"**
4. **Modifiez votre flux de données Web** :
   - **Nom du site** : `location-vacance.tn` (ou votre domaine)
   - **URL du site** : `https://location-vacance.tn` (ou votre domaine)
   - **Sauvegardez**

### **1.2. Mise à jour du code de suivi**
1. **Allez dans** → **Admin** → **Propriétés de données** → **Flux de données**
2. **Cliquez sur votre flux** → **Détails du flux de données**
3. **Copiez le nouveau code de suivi** (ID de mesure : `G-59S7Q6K1HF`)

### **1.3. Mise à jour dans votre code**
```html
<!-- Dans index.html, remplacez le code existant par : -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-59S7Q6K1HF"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-59S7Q6K1HF', {
    // Configuration pour la production
    page_title: 'Location-vacance.tn',
    page_location: 'https://location-vacance.tn'
  });
</script>
```

---

## 🔐 **2. Configuration Supabase**

### **2.1. Variables d'environnement Supabase**
1. **Allez dans Supabase Dashboard** → **Settings** → **Edge Functions** → **Secrets**
2. **Vérifiez que ces variables existent** :
   - ✅ `GOOGLE_ANALYTICS_PRIVATE_KEY` (votre clé privée)
   - ✅ `GOOGLE_ANALYTICS_CLIENT_EMAIL` (votre email de service)
3. **Ajoutez si nécessaire** :
   - `GA_PROPERTY_ID` = `507427571`
   - `GA_MEASUREMENT_ID` = `G-59S7Q6K1HF`

### **2.2. Edge Functions**
1. **Vérifiez que ces fonctions sont déployées** :
   - ✅ `analytics-token` (pour l'authentification)
   - ✅ `analytics-data` (pour récupérer les données)
2. **Testez les fonctions** :
   ```bash
   # Test analytics-token
   curl -X POST "https://snrlnfldhbopiyjwnjlu.supabase.co/functions/v1/analytics-token" \
     -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
     -H "Content-Type: application/json"
   
   # Test analytics-data
   curl -X POST "https://snrlnfldhbopiyjwnjlu.supabase.co/functions/v1/analytics-data" \
     -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"accessToken":"YOUR_TOKEN","reportType":"realtime"}'
   ```

---

## 🌐 **3. Configuration du domaine**

### **3.1. Variables d'environnement de production**
Créez un fichier `.env.production` :
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://snrlnfldhbopiyjwnjlu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucmxuZmxkaGJvcGl5anduamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDQ4MTEsImV4cCI6MjA3MTc4MDgxMX0.AhPDCWgV7CL0yWOI_lIi4RQd__aTsP0jmFx7ZA9GCng

# Google Analytics Configuration
VITE_GA_MEASUREMENT_ID=G-59S7Q6K1HF
VITE_GA_PROPERTY_ID=507427571
```

### **3.2. Mise à jour du code de suivi**
Dans `src/components/GoogleAnalyticsTracker.tsx` :
```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);
};
```

---

## 🚀 **4. Déploiement**

### **4.1. Build de production**
```bash
# Build pour la production
npm run build

# Vérifiez que le build fonctionne
npm run preview
```

### **4.2. Déploiement sur votre hébergeur**
1. **Uploadez** le dossier `dist/` sur votre serveur
2. **Configurez** votre serveur web (Apache/Nginx) pour servir les fichiers statiques
3. **Vérifiez** que les variables d'environnement sont correctement configurées

### **4.3. Configuration du serveur web**
**Pour Nginx :**
```nginx
server {
    listen 80;
    server_name location-vacance.tn;
    root /path/to/your/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Pour Apache :**
```apache
<VirtualHost *:80>
    ServerName location-vacance.tn
    DocumentRoot /path/to/your/dist
    
    <Directory /path/to/your/dist>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

---

## ✅ **5. Vérifications post-déploiement**

### **5.1. Test du code de suivi**
1. **Ouvrez** votre site en production
2. **Ouvrez la console** (F12)
3. **Vérifiez** que `gtag` est chargé :
   ```javascript
   console.log(window.gtag); // Doit retourner une fonction
   ```

### **5.2. Configuration pour utilisateurs connectés**
- **Dashboard affiche** : "Utilisateurs actifs au cours des 5 dernières minutes"
- **Filtre** : Utilisateurs avec session active (connectés)
- **Mise à jour** : Toutes les 30 secondes

### **5.2. Test des Edge Functions**
1. **Allez sur** `https://location-vacance.tn/dashboard/admin/analytics`
2. **Ouvrez la console** (F12)
3. **Vérifiez** les messages :
   - ✅ `Real Google Analytics data received!`
   - ✅ `Processed real-time data: { activeUsers: X, ... }`

### **5.3. Test Google Analytics**
1. **Allez dans Google Analytics** → **Temps réel** → **Aperçu**
2. **Naviguez** sur votre site de production
3. **Vérifiez** que les données apparaissent dans Google Analytics
4. **Comparez** avec votre dashboard admin

---

## 🔧 **6. Dépannage**

### **6.1. Problèmes courants**

**❌ "Erreur lors de l'obtention du token"**
- ✅ Vérifiez `GOOGLE_ANALYTICS_PRIVATE_KEY` dans Supabase
- ✅ Vérifiez `GOOGLE_ANALYTICS_CLIENT_EMAIL` dans Supabase
- ✅ Vérifiez que les Edge Functions sont déployées

**❌ "Aucune donnée disponible"**
- ✅ Vérifiez que le code de suivi est présent sur toutes les pages
- ✅ Attendez 2-3 minutes pour que Google Analytics traite les données
- ✅ Vérifiez que le domaine est correctement configuré dans Google Analytics

**❌ "CORS error"**
- ✅ Vérifiez que votre domaine est autorisé dans Supabase
- ✅ Vérifiez que les Edge Functions ont les bons headers CORS

### **6.2. Logs de débogage**
```javascript
// Dans la console du navigateur
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('GA Measurement ID:', import.meta.env.VITE_GA_MEASUREMENT_ID);
```

---

## 📊 **7. Monitoring en production**

### **7.1. Vérifications régulières**
- **Dashboard admin** : Vérifiez que les données se mettent à jour
- **Google Analytics** : Comparez les données avec votre dashboard
- **Logs Supabase** : Vérifiez les logs des Edge Functions

### **7.2. Alertes**
Configurez des alertes pour :
- **Erreurs** dans les Edge Functions
- **Données manquantes** dans le dashboard
- **Problèmes d'authentification** Google

---

## 🎯 **8. Checklist finale**

### **✅ Configuration Google Analytics**
- [ ] Domaine mis à jour dans Google Analytics
- [ ] Code de suivi mis à jour dans `index.html`
- [ ] Test du suivi sur le site de production

### **✅ Configuration Supabase**
- [ ] Variables d'environnement configurées
- [ ] Edge Functions déployées et testées
- [ ] Secrets correctement configurés

### **✅ Configuration de production**
- [ ] Variables d'environnement de production
- [ ] Build de production fonctionnel
- [ ] Serveur web configuré

### **✅ Tests de validation**
- [ ] Dashboard analytics fonctionnel
- [ ] Données synchronisées avec Google Analytics
- [ ] Pas d'erreurs dans la console

---

## 🆘 **Support**

En cas de problème :
1. **Vérifiez** les logs Supabase Edge Functions
2. **Testez** les Edge Functions individuellement
3. **Comparez** avec la configuration localhost
4. **Vérifiez** que tous les secrets sont correctement configurés

**🎉 Votre système analytics est maintenant prêt pour la production !**
