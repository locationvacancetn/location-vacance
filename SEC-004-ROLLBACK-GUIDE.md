# 🔄 GUIDE DE ROLLBACK - SEC-004

## 📋 INFORMATIONS DE SAUVEGARDE

**Date de sauvegarde** : 8 Octobre 2025  
**Branche de backup** : `backup-before-sec-004`  
**Commit de référence** : Créé avant toute modification SEC-004

---

## ✅ NOUVEAU SYSTÈME CRÉÉ (Phase de test)

### **Fichiers NOUVEAUX (peuvent être supprimés sans risque)** :
1. ✅ `supabase/functions/send-email-secure/index.ts` - Edge Function sécurisée
2. ✅ `src/lib/email-service-secure.ts` - Service frontend sécurisé
3. ✅ `SEC-004-ROLLBACK-GUIDE.md` - Ce guide

### **Fichiers NON MODIFIÉS (système actuel intact)** :
- ✅ `src/lib/email-service.ts` - Ancien service (fonctionne toujours)
- ✅ `src/lib/email-config-service.ts` - Config actuelle (fonctionne toujours)
- ✅ `src/lib/email-bulk-service.ts` - Bulk email (fonctionne toujours)
- ✅ Table `email_config` - Base de données intacte
- ✅ API PHP `send-email.php` - Serveur intact

---

## 🔄 PROCÉDURES DE ROLLBACK

### **OPTION 1 : Rollback Git Complet (30 secondes)**

Retour complet à l'état avant SEC-004 :

```bash
# Revenir à la branche de backup
git checkout backup-before-sec-004

# Ou revenir sur main et annuler les changements
git checkout main
git reset --hard backup-before-sec-004
```

**Résultat** : État exact avant SEC-004 restauré ✅

---

### **OPTION 2 : Suppression des Nouveaux Fichiers (1 minute)**

Si vous voulez juste désactiver le nouveau système :

```bash
# Supprimer l'Edge Function
rm -rf supabase/functions/send-email-secure

# Supprimer le service frontend
rm src/lib/email-service-secure.ts

# Supprimer ce guide
rm SEC-004-ROLLBACK-GUIDE.md
```

**Résultat** : Nouveau système supprimé, ancien système actif ✅

---

### **OPTION 3 : Désactiver sans Supprimer (10 secondes)**

Si vous voulez garder le code mais ne pas l'utiliser :

**Rien à faire !** 

Le nouveau système n'est PAS activé par défaut. L'ancien système continue de fonctionner normalement.

---

## 🧪 PHASE DE TEST (Actuelle)

### **État actuel du système** :

#### **Système ACTIF (ancien)** :
- ✅ `EmailService.sendEmail()` - Utilisé partout
- ✅ Fonctionne normalement
- ✅ Aucun changement

#### **Système DISPONIBLE (nouveau)** :
- 🧪 `EmailServiceSecure.sendEmail()` - Prêt à tester
- 🧪 Edge Function déployable
- 🧪 Pas encore utilisé dans l'app

### **Comment tester le nouveau système** :

1. **Déployer l'Edge Function** :
```bash
supabase functions deploy send-email-secure
```

2. **Tester via le code** :
```typescript
import { EmailServiceSecure } from '@/lib/email-service-secure';

// Test
const result = await EmailServiceSecure.sendTestEmail('votre@email.com');
console.log(result);
```

3. **Vérifier que l'email arrive**

---

## 🚀 PHASE DE BASCULE (Après validation)

### **Quand vous êtes SATISFAIT des tests** :

#### **Modification à faire** (réversible en 30 secondes) :

**Fichier** : `src/lib/email-service.ts`

```typescript
// 🔄 ROLLBACK : Décommenter ces lignes pour revenir à l'ancien système
// import { EmailConfigService } from './email-config-service';
// const emailConfig = await EmailConfigService.getActiveConfig();
// const response = await fetch('https://location-vacance.tn/send-email.php', ...);

// ✅ NOUVEAU SYSTÈME SÉCURISÉ (commenter pour rollback)
import { EmailServiceSecure } from './email-service-secure';
const response = await EmailServiceSecure.sendEmail(emailData);
```

---

## ⚠️ EN CAS DE PROBLÈME APRÈS BASCULE

### **Symptômes possibles** :
- ❌ Emails ne s'envoient plus
- ❌ Erreur dans la console
- ❌ Timeout ou erreur serveur

### **Solution IMMÉDIATE (30 secondes)** :

1. **Ouvrir** `src/lib/email-service.ts`
2. **Commenter** la ligne du nouveau système
3. **Décommenter** les lignes de l'ancien système
4. **Sauvegarder**
5. ✅ **Retour immédiat à l'ancien système**

---

## 📊 COMPARAISON SYSTÈMES

| Critère | Ancien Système | Nouveau Système |
|---------|----------------|-----------------|
| **Sécurité mot de passe** | 🔴 Exposé client (Base64) | 🟢 Serveur uniquement |
| **Performance** | 🟡 2 requêtes | 🟢 1 requête |
| **Complexité** | 🟢 Simple | 🟡 Edge Function |
| **Rollback** | ✅ Immédiat | ✅ 30 secondes |
| **Configuration** | ✅ Interface admin | ✅ Interface admin |
| **Table email_config** | ✅ Utilisée | ✅ Utilisée |

---

## 📝 CHECKLIST DE MIGRATION

### **Avant de basculer** :
- [ ] Edge Function déployée
- [ ] Test envoi email réussi
- [ ] Email reçu et vérifié
- [ ] Backup Git créé
- [ ] Guide rollback lu et compris

### **Après bascule** :
- [ ] Tester envoi email en production
- [ ] Vérifier les logs Supabase
- [ ] Confirmer réception emails
- [ ] Surveiller pendant 24h
- [ ] Si OK → supprimer l'ancien code
- [ ] Si KO → rollback immédiat

---

## 🆘 CONTACTS & SUPPORT

**En cas de problème** :
1. Suivre la procédure de rollback ci-dessus
2. Consulter les logs : Dashboard Supabase → Edge Functions → Logs
3. Vérifier la console développeur navigateur

**Logs utiles** :
```bash
# Logs Edge Function
supabase functions logs send-email-secure

# Logs API
# Consulter les logs de votre serveur PHP
```

---

## 📅 HISTORIQUE

- **8 Oct 2025** : Création système sécurisé (Phase de test)
- **À venir** : Tests et validation
- **À venir** : Bascule progressive
- **À venir** : Suppression ancien système (si validé)

---

## ✅ GARANTIES

- ✅ **Ancien système intact** : Fonctionne toujours
- ✅ **Nouveau système isolé** : Aucun impact sur l'existant
- ✅ **Rollback garanti** : 3 options de retour arrière
- ✅ **Aucune perte de données** : Table email_config intacte
- ✅ **Tests en parallèle** : Validation avant bascule

**Vous gardez le contrôle total à chaque étape ! 🚀**

