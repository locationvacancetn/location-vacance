# 🔄 GUIDE DE ROLLBACK - SEC-006 (CORS)

## ✅ OUI, ROLLBACK COMPLET DISPONIBLE !

Vous avez **3 options de rollback** selon le niveau de retour souhaité.

---

## 📊 POINTS DE SAUVEGARDE DISPONIBLES

| Point de sauvegarde | Branche/Commit | Contenu |
|---------------------|----------------|---------|
| **Actuel** | `security-sec-006-cors` | CORS sécurisé (6 fonctions modifiées) |
| **Avant CORS** | `e5097d4` | Après SEC-004 & SEC-005 validés |
| **Avant SEC-004** | `backup-before-sec-004` | État avant sécurisation email |
| **Production** | `master` | Dernière version stable |

---

## 🔄 OPTION 1 : ROLLBACK TOTAL SEC-006 (30 secondes)

**Revenir à l'état AVANT SEC-006 (CORS ouvert à tous `*`)**

### **Commandes** :
```bash
# Retour à l'état avant SEC-006
git checkout e5097d4

# Ou retour à la branche de backup
git checkout backup-before-sec-004
```

### **Résultat** :
- ❌ CORS redevient `*` (ouvert à tous)
- ✅ SEC-004 & SEC-005 conservés (email sécurisé)
- ✅ Toutes les autres corrections conservées

### **Pour redéployer l'ancien code** :
```bash
# Redéployer les Edge Functions avec CORS ouvert
supabase functions deploy send-email-secure
supabase functions deploy send-email
supabase functions deploy analytics-data
supabase functions deploy analytics-token
supabase functions deploy create-user
supabase functions deploy delete-user
```

---

## 🔄 OPTION 2 : ROLLBACK PARTIEL - Fichiers uniquement

**Annuler les modifications CORS mais garder le commit actuel**

### **Commandes** :
```bash
# Restaurer les fichiers CORS à leur état précédent
git checkout e5097d4 -- supabase/functions/

# Supprimer le module CORS
rm -rf supabase/functions/_shared/
```

### **Résultat** :
- ❌ Modifications CORS annulées localement
- ✅ Historique Git conservé
- ⚠️ Nécessite redéploiement

---

## 🔄 OPTION 3 : ROLLBACK GIT COMPLET

**Annuler complètement le commit SEC-006**

### **Commandes** :
```bash
# Annuler le dernier commit (SEC-006) mais garder les modifications
git reset --soft HEAD~1

# OU annuler le commit ET les modifications
git reset --hard HEAD~1
```

### **Résultat** :
- ❌ Commit SEC-006 supprimé de l'historique
- ✅ Retour à l'état `e5097d4`
- ⚠️ Modifications perdues si `--hard`

---

## 🚨 ROLLBACK D'URGENCE - Edge Functions déployées

**Si les Edge Functions sont déjà déployées et causent un problème**

### **Solution immédiate** :

#### **1. Redéployer l'ancienne version**
```bash
# Revenir à l'ancien code
git checkout e5097d4

# Redéployer immédiatement
supabase functions deploy send-email-secure
supabase functions deploy analytics-data
# ... (toutes les fonctions)
```

#### **2. Via Dashboard Supabase**
1. Aller sur [app.supabase.com](https://app.supabase.com)
2. Votre projet → Edge Functions
3. Pour chaque fonction :
   - Cliquer sur la fonction
   - Onglet "Versions"
   - Sélectionner **Version 1** (avant SEC-006)
   - Cliquer "Deploy this version"

**Temps de rollback** : 2-3 minutes

---

## 📋 ÉTAT ACTUEL DES EDGE FUNCTIONS

| Edge Function | Version actuelle | Version de rollback |
|---------------|------------------|---------------------|
| send-email-secure | v2 (CORS sécurisé) ✅ | v1 (CORS `*`) |
| send-email | v? (non déployé) | Ancienne version |
| analytics-data | v? (non déployé) | Ancienne version |
| analytics-token | v? (non déployé) | Ancienne version |
| create-user | v? (non déployé) | Ancienne version |
| delete-user | v? (non déployé) | Ancienne version |

---

## ✅ PLAN DE ROLLBACK SÉCURISÉ

### **Avant le déploiement** :
1. ✅ **Créer une branche de backup** (déjà fait : `backup-before-sec-004`)
2. ✅ **Commit des modifications** (déjà fait : `2568fa5`)
3. ✅ **Tester sur send-email-secure** (déjà déployé v2)

### **Pendant le déploiement** :
1. ⏳ Déployer une fonction à la fois
2. ⏳ Tester après chaque déploiement
3. ⏳ Si erreur → rollback immédiat

### **Si problème détecté** :
1. **Ne PAS paniquer** ✅
2. **Vérifier les logs** : `supabase functions logs <nom-fonction>`
3. **Rollback via Dashboard** : Version précédente
4. **OU Rollback via Git + Redéploiement**

---

## 🧪 TEST DE ROLLBACK (Optionnel)

**Vous pouvez tester le rollback MAINTENANT avant de déployer** :

```bash
# 1. Sauvegarder l'état actuel
git branch backup-sec-006-test

# 2. Tester le rollback
git checkout e5097d4

# 3. Vérifier les fichiers
ls supabase/functions/_shared/  # Ne devrait PAS exister

# 4. Revenir à SEC-006
git checkout security-sec-006-cors

# 5. Vérifier que tout est revenu
ls supabase/functions/_shared/  # Devrait exister
```

---

## 📞 CHECKLIST DE SÉCURITÉ

Avant de déployer SEC-006, vérifiez :

- [x] Branche de backup créée (`backup-before-sec-004`)
- [x] Commit SEC-006 créé (`2568fa5`)
- [x] Test rollback Git compris
- [ ] Test rollback Dashboard Supabase compris
- [ ] Plan d'action en cas de problème défini

---

## 🎯 RECOMMANDATION

**Je recommande** :

1. ✅ **Déployer progressivement** : une fonction à la fois
2. ✅ **Tester après chaque déploiement**
3. ✅ **Garder le Dashboard Supabase ouvert** pour rollback rapide
4. ✅ **Surveiller les logs** en temps réel

**En cas de doute** : ROLLBACK IMMÉDIAT ✅

---

## ✅ VOUS ÊTES PROTÉGÉ !

- ✅ **3 options de rollback** disponibles
- ✅ **Historique Git complet** préservé
- ✅ **Versions Edge Functions** conservées
- ✅ **Temps de rollback** : 30 secondes - 3 minutes

**Vous pouvez déployer en toute sécurité ! 🚀**

---

**Voulez-vous procéder au déploiement maintenant ?**

