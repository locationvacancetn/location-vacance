# 🚀 DÉPLOIEMENT SEC-006 - CORS SÉCURISÉ

## ✅ CE QUI A ÉTÉ FAIT

### **Fichiers modifiés** :
1. ✅ `supabase/functions/_shared/cors.ts` - Module CORS partagé créé
2. ✅ `supabase/functions/send-email-secure/index.ts` - CORS sécurisé + déployé ✅
3. ✅ `supabase/functions/send-email/index.ts` - CORS sécurisé  
4. ✅ `supabase/functions/analytics-data/index.ts` - CORS sécurisé
5. ✅ `supabase/functions/analytics-token/index.ts` - CORS sécurisé
6. ✅ `supabase/functions/create-user/index.ts` - CORS sécurisé
7. ✅ `supabase/functions/delete-user/index.ts` - CORS sécurisé

---

## 🔒 SÉCURITÉ CORS

### **Domaines autorisés** :
- ✅ `https://location-vacance.tn` (production)
- ✅ `https://www.location-vacance.tn` (production www)
- ✅ `http://localhost:*` (tous les ports - développement)
- ✅ `http://127.0.0.1:*` (tous les ports - développement)

### **Domaines bloqués** :
- ❌ Tous les autres domaines

---

## 📋 DÉPLOIEMENT

### **OPTION A : CLI Supabase (Recommandé - plus rapide)** 

Déployer toutes les fonctions restantes en une seule commande :

```bash
# Déployer toutes les Edge Functions
supabase functions deploy send-email
supabase functions deploy analytics-data
supabase functions deploy analytics-token
supabase functions deploy create-user
supabase functions deploy delete-user
```

**Avantages** :
- ✅ Plus rapide (5 fonctions en 30 secondes)
- ✅ Supporte nativement les fichiers partagés (`_shared/cors.ts`)
- ✅ Une seule commande par fonction

---

### **OPTION B : Déploiement manuel via Dashboard Supabase**

Si vous préférez une interface visuelle :

1. Aller sur [app.supabase.com](https://app.supabase.com)
2. Projet → Edge Functions
3. Pour chaque fonction :
   - Cliquer sur la fonction
   - Onglet "Deploy"
   - Upload le fichier `index.ts` modifié
   - Upload le fichier `cors.ts` dans le même déploiement

---

### **OPTION C : Continuer via MCP (Plus long)**

Je peux déployer les 5 fonctions restantes via MCP une par une (environ 5-10 minutes).

---

## 🧪 TESTS APRÈS DÉPLOIEMENT

Après le déploiement, tester :

### **1. Test depuis votre application**
- ✅ Envoyer un email
- ✅ Consulter Google Analytics  
- ✅ Créer/supprimer un utilisateur
- ✅ Vérifier que tout fonctionne normalement

### **2. Test de sécurité CORS**
Ouvrir la console développeur et vérifier :
```javascript
// Devrait fonctionner
fetch('https://snrlnfldhbopiyjwnjlu.supabase.co/functions/v1/send-email-secure', {
  method: 'OPTIONS',
  headers: { 'Origin': 'https://location-vacance.tn' }
})

// Devrait être bloqué
fetch('https://snrlnfldhbopiyjwnjlu.supabase.co/functions/v1/send-email-secure', {
  method: 'OPTIONS',
  headers: { 'Origin': 'https://site-malveillant.com' }
})
```

### **3. Vérifier les logs**
```bash
supabase functions logs send-email-secure
```

---

## 🔄 ROLLBACK SI PROBLÈME

Si un problème survient après déploiement :

### **Git Rollback**
```bash
git checkout backup-before-sec-004  # Ou la branche précédente
git push -f  # Si nécessaire
```

### **Redéploiement ancien code**
Redéployer les Edge Functions avec l'ancien code (CORS `*`)

---

## 📊 STATUT DÉPLOIEMENT

| Edge Function | Code CORS | Déployé | Testé |
|---------------|-----------|---------|-------|
| send-email-secure | ✅ Sécurisé | ✅ Oui (v2) | ⏳ À faire |
| send-email | ✅ Sécurisé | ⏳ À déployer | ⏳ À faire |
| analytics-data | ✅ Sécurisé | ⏳ À déployer | ⏳ À faire |
| analytics-token | ✅ Sécurisé | ⏳ À déployer | ⏳ À faire |
| create-user | ✅ Sécurisé | ⏳ À déployer | ⏳ À faire |
| delete-user | ✅ Sécurisé | ⏳ À déployer | ⏳ À faire |

---

## 🎯 PROCHAINES ÉTAPES

1. **Choisir une option de déploiement** (A, B ou C)
2. **Déployer les 5 fonctions restantes**
3. **Tester depuis votre application**
4. **Vérifier que les domaines non autorisés sont bloqués**
5. **Mettre à jour la SECURITY_ROADMAP.md**
6. **Commit final**

---

## ✅ CHECKLIST

- [x] Module CORS créé (`_shared/cors.ts`)
- [x] 6 Edge Functions mises à jour
- [x] send-email-secure déployé (v2)
- [ ] 5 Edge Functions restantes à déployer
- [ ] Tests fonctionnels
- [ ] Tests sécurité CORS
- [ ] Roadmap mise à jour
- [ ] SEC-006 validé

**Vous avez le choix ! Quelle option préférez-vous ? 🎯**

