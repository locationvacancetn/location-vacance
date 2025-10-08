# 🚀 GUIDE DE DÉPLOIEMENT - SEC-004

## ✅ SYSTÈME EMAIL SÉCURISÉ - PRÊT À TESTER

---

## 📋 CE QUI A ÉTÉ CRÉÉ

### **1. Edge Function Sécurisée** ✅
📁 `supabase/functions/send-email-secure/index.ts`

**Fonctionnalités** :
- 🔒 Récupère la config email depuis la table (côté serveur)
- 🔒 Décode le mot de passe côté serveur uniquement
- 🔒 Envoie l'email sans exposer le mot de passe au client
- ✅ Compatible avec votre table `email_config` existante
- ✅ Compatible avec votre API PHP existante

### **2. Service Frontend Sécurisé** ✅
📁 `src/lib/email-service-secure.ts`

**Fonctionnalités** :
- 📧 Interface simple pour envoyer des emails
- 🔒 Ne manipule jamais le mot de passe SMTP
- ✅ Validation des données
- ✅ Gestion d'erreurs

### **3. Guides de Sécurité** ✅
- 📄 `SEC-004-ROLLBACK-GUIDE.md` - Procédures de rollback
- 📄 `SEC-004-DEPLOYMENT.md` - Ce guide

---

## 🚀 ÉTAPE 1 : DÉPLOYER L'EDGE FUNCTION

### **Commande à exécuter** :

```bash
# Déployer l'Edge Function sur Supabase
supabase functions deploy send-email-secure
```

**Résultat attendu** :
```
✅ Deployed Function send-email-secure
Function URL: https://snrlnfldhbopiyjwnjlu.supabase.co/functions/v1/send-email-secure
```

### **En cas d'erreur de connexion** :

```bash
# Se connecter à Supabase d'abord
supabase login

# Puis déployer
supabase functions deploy send-email-secure
```

---

## 🧪 ÉTAPE 2 : TESTER LE SYSTÈME SÉCURISÉ

### **Option A : Test via Console Navigateur**

1. Ouvrir votre application dans le navigateur
2. Ouvrir la console développeur (F12)
3. Coller ce code :

```javascript
// Importer le service sécurisé (à adapter selon votre contexte)
const { EmailServiceSecure } = await import('/src/lib/email-service-secure.ts');

// Tester l'envoi
const result = await EmailServiceSecure.sendTestEmail(
  'votre-email@example.com',  // Remplacer par votre email
  'Test Système Sécurisé',
  'Ceci est un test du nouveau système email sécurisé.'
);

console.log('Résultat:', result);
```

### **Option B : Créer un Bouton de Test Temporaire**

Ajouter ce code dans votre interface admin (ex: EmailSettings) :

```typescript
import { EmailServiceSecure } from '@/lib/email-service-secure';
import { Button } from '@/components/ui/button';

// Dans votre composant
const handleTestSecure = async () => {
  try {
    const result = await EmailServiceSecure.sendTestEmail(
      'votre-email@example.com',
      'Test Système Sécurisé',
      'Test du système email sécurisé'
    );
    
    if (result.success) {
      alert('✅ Email envoyé avec succès via le système sécurisé !');
    } else {
      alert('❌ Erreur : ' + result.error);
    }
  } catch (error) {
    console.error('Erreur test:', error);
    alert('❌ Erreur lors du test');
  }
};

// Dans le JSX
<Button onClick={handleTestSecure} variant="outline">
  🧪 Tester Système Sécurisé
</Button>
```

### **Option C : Test via Supabase Dashboard**

1. Aller sur [app.supabase.com](https://app.supabase.com)
2. Votre projet → Edge Functions → `send-email-secure`
3. Onglet "Invoke"
4. Body :
```json
{
  "to": "votre-email@example.com",
  "subject": "Test Système Sécurisé",
  "message": "Ceci est un test du nouveau système",
  "isTest": true
}
```
5. Cliquer "Invoke"

---

## ✅ ÉTAPE 3 : VÉRIFICATION

### **Checklist de test** :

- [ ] Edge Function déployée sans erreur
- [ ] Email de test envoyé sans erreur
- [ ] Email reçu dans la boîte de réception
- [ ] Logs Edge Function OK (pas d'erreur dans Supabase)
- [ ] Mot de passe JAMAIS visible dans la console navigateur

### **Vérifier les logs** :

```bash
# Voir les logs de l'Edge Function
supabase functions logs send-email-secure --limit 20
```

Ou dans le Dashboard Supabase :
- Edge Functions → send-email-secure → Logs

---

## 🔄 ÉTAPE 4 : BASCULE (Après validation)

### **Seulement si TOUS les tests sont OK** :

**Modifier** : `src/lib/email-service.ts`

**Ajouter en haut du fichier** :
```typescript
import { EmailServiceSecure } from './email-service-secure';
```

**Remplacer la méthode sendEmail** :
```typescript
static async sendEmail(emailData: EmailRequest): Promise<EmailResponse> {
  // 🔄 ROLLBACK : Décommenter le bloc ci-dessous pour revenir à l'ancien système
  /*
  try {
    const emailConfig = await EmailConfigService.getActiveConfig();
    if (!emailConfig) {
      return {
        success: false,
        error: 'Configuration email non trouvée',
        message: 'Aucune configuration email active.'
      };
    }
    
    const response = await fetch('https://location-vacance.tn/send-email.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...emailData,
        smtp_config: {
          host: emailConfig.smtp_host,
          port: emailConfig.smtp_port,
          user: emailConfig.smtp_user,
          password: emailConfig.smtp_password,
          ssl: emailConfig.is_ssl,
          from_email: emailConfig.from_email,
          from_name: emailConfig.from_name
        }
      }),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || `Erreur HTTP ${response.status}`);
    }
    return result;
  } catch (error) {
    console.error('Erreur EmailService:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      message: 'Erreur lors de l\'envoi de l\'email'
    };
  }
  */
  
  // ✅ NOUVEAU SYSTÈME SÉCURISÉ (commenter cette ligne pour rollback)
  return EmailServiceSecure.sendEmail(emailData);
}
```

---

## ⚠️ ROLLBACK IMMÉDIAT

### **Si problème après la bascule** :

1. Ouvrir `src/lib/email-service.ts`
2. **Commenter** la ligne : `return EmailServiceSecure.sendEmail(emailData);`
3. **Décommenter** le bloc de l'ancien système
4. Sauvegarder
5. ✅ **Retour immédiat à l'ancien système fonctionnel**

**Temps de rollback** : 30 secondes

---

## 📊 COMPARAISON AVANT/APRÈS

### **AVANT (Ancien système)** :
```
Frontend → Récupère config DB → Décode Base64 → 
Envoie mdp à API PHP → Email envoyé
(🔴 Mot de passe visible côté client)
```

### **APRÈS (Nouveau système)** :
```
Frontend → Edge Function → Récupère config DB → 
Décode en serveur → Envoie à API PHP → Email envoyé
(✅ Mot de passe JAMAIS côté client)
```

---

## 🔒 AVANTAGES DU NOUVEAU SYSTÈME

### **Sécurité** :
- ✅ Mot de passe SMTP jamais exposé au client
- ✅ Pas de décodage Base64 côté navigateur
- ✅ Requêtes serveur-à-serveur uniquement
- ✅ Protection contre l'interception client

### **Performance** :
- ✅ 1 seule requête au lieu de 2
- ✅ Moins de données transférées
- ✅ Temps de réponse optimisé

### **Maintenabilité** :
- ✅ Code plus propre
- ✅ Logique centralisée
- ✅ Facilite les futures améliorations

---

## 🎯 PROCHAINES ÉTAPES

### **Phase Actuelle : Tests**
- [x] Système créé
- [x] Documentation complète
- [ ] Déploiement Edge Function
- [ ] Tests fonctionnels
- [ ] Validation réception emails

### **Phase Suivante : Production** (après validation)
- [ ] Bascule progressive
- [ ] Surveillance 24h
- [ ] Confirmation stabilité
- [ ] Suppression ancien code (si tout OK)

---

## 📞 SUPPORT

### **Logs à consulter en cas de problème** :

**Edge Function** :
```bash
supabase functions logs send-email-secure
```

**Console navigateur** :
- Chercher les erreurs préfixées par `🔒` ou `❌`

**Supabase Dashboard** :
- Edge Functions → send-email-secure → Logs
- Database → Tables → email_config (vérifier config)

---

## ✅ CHECKLIST FINALE

Avant de considérer SEC-004 comme terminé :

- [ ] Edge Function déployée
- [ ] Tests réussis (minimum 3 emails)
- [ ] Emails reçus confirmés
- [ ] Aucune erreur dans les logs
- [ ] Mot de passe jamais visible client (vérifié)
- [ ] Rollback testé et fonctionnel
- [ ] Documentation lue et comprise
- [ ] Équipe informée du changement

---

**Vous êtes prêt à sécuriser vos emails ! 🚀**

En cas de doute, référez-vous à `SEC-004-ROLLBACK-GUIDE.md`

