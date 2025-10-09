# 🧪 IMP-001 : GUIDE DE TESTS COMPLETS

## ✅ MODIFICATIONS EFFECTUÉES

### **Phase 1 : Edge Function ✅**
- ✅ `create-user` modifiée : ne remplit plus `user_metadata` avec les données métier
- ✅ Création directe dans `profiles` avec TOUS les 17 champs
- ✅ CORS sécurisé intégré
- ✅ Déployée (version 15)

### **Phase 2 : Migration SQL ✅**
- ✅ Trigger `handle_new_user()` simplifié
- ✅ Gère UNIQUEMENT l'inscription normale (2 champs)
- ✅ Utilise `ON CONFLICT DO NOTHING` pour éviter les doublons
- ✅ Migration appliquée avec succès

### **Phase 3 : Frontend ✅**
- ✅ `useUserRole.ts` : suppression du fallback vers `user_metadata`
- ✅ `Navbar.tsx` : suppression du fallback vers `user_metadata.full_name`
- ✅ `profiles` est maintenant la source unique de vérité

---

## 🧪 TESTS À EFFECTUER

### **TEST 1 : INSCRIPTION NORMALE (signUp)** 🔵

**Objectif** : Vérifier que l'inscription crée bien un profil avec `full_name` et `role`

**Étapes** :
1. ✅ Se déconnecter si connecté
2. ✅ Aller sur `/signup`
3. ✅ Remplir le formulaire :
   - Nom complet : `Jean Dupont`
   - Email : `test-signup-imp001@example.com`
   - Mot de passe : `Test123456!`
   - Rôle : `Propriétaire` (owner)
4. ✅ Soumettre le formulaire
5. ✅ Se connecter avec ces identifiants

**Résultat attendu** :
- ✅ L'utilisateur peut se connecter
- ✅ Le nom "Jean Dupont" s'affiche dans la Navbar
- ✅ Le rôle est "Propriétaire"

**Vérification en base** :
```sql
-- Copier cet ID après la création
SELECT 
  id,
  user_id, 
  email, 
  full_name,  -- ✅ Doit être "Jean Dupont"
  role,       -- ✅ Doit être "owner"
  whatsapp_number, -- ✅ Doit être NULL (pas fourni à l'inscription)
  phone,
  bio
FROM profiles 
WHERE email = 'test-signup-imp001@example.com';

-- Vérifier user_metadata
SELECT 
  id,
  email,
  raw_user_meta_data -- ✅ Doit contenir {full_name: "Jean Dupont", role: "owner"}
FROM auth.users 
WHERE email = 'test-signup-imp001@example.com';
```

---

### **TEST 2 : CRÉATION PAR ADMIN (17 CHAMPS)** 🔴

**Objectif** : Vérifier que la création admin sauvegarde TOUS les champs

**Prérequis** : Se connecter en tant qu'admin

**Étapes** :
1. ✅ Se connecter en tant qu'admin
2. ✅ Aller sur `/dashboard/admin/users`
3. ✅ Cliquer sur "Ajouter un utilisateur"
4. ✅ Remplir **TOUS** les champs :
   
   **Informations de base** :
   - Email : `test-admin-imp001@example.com`
   - Mot de passe : `TempPass123!`
   - Nom complet : `Marie Martin`
   - Rôle : `Propriétaire` (owner)
   - WhatsApp : `+33612345678` ← **OBLIGATOIRE pour owner !**
   
   **Réseaux sociaux** :
   - Facebook : `https://facebook.com/mariemartin`
   - Instagram : `https://instagram.com/mariemartin`
   - LinkedIn : `https://linkedin.com/in/mariemartin`
   - Twitter : `https://twitter.com/mariemartin`
   - TikTok : `https://tiktok.com/@mariemartin`
   - Messenger : `https://m.me/mariemartin`

5. ✅ Soumettre le formulaire
6. ✅ Vérifier le message de succès

**Résultat attendu** :
- ✅ Message "Utilisateur créé avec succès"
- ✅ Redirection vers la liste des utilisateurs
- ✅ L'utilisateur apparaît dans la liste

**Vérification en base** :
```sql
-- Vérifier que TOUS les champs sont sauvegardés
SELECT 
  user_id,
  email,               -- ✅ test-admin-imp001@example.com
  full_name,           -- ✅ "Marie Martin"
  role,                -- ✅ "owner"
  whatsapp_number,     -- ✅ "+33612345678" (CRITIQUE !)
  facebook_url,        -- ✅ "https://facebook.com/mariemartin"
  instagram_url,       -- ✅ "https://instagram.com/mariemartin"
  linkedin_url,        -- ✅ "https://linkedin.com/in/mariemartin"
  twitter_url,         -- ✅ "https://twitter.com/mariemartin"
  tiktok_url,          -- ✅ "https://tiktok.com/@mariemartin"
  messenger_url        -- ✅ "https://m.me/mariemartin"
FROM profiles 
WHERE email = 'test-admin-imp001@example.com';

-- Vérifier user_metadata (doit être VIDE ou minimal)
SELECT 
  id,
  email,
  raw_user_meta_data -- ✅ Doit être {} ou vide (plus de duplication !)
FROM auth.users 
WHERE email = 'test-admin-imp001@example.com';
```

**🚨 POINT CRITIQUE** :
- ✅ `whatsapp_number` ne doit PAS être NULL !
- ✅ Tous les URLs ne doivent PAS être NULL !
- ✅ `raw_user_meta_data` ne doit PAS contenir les données métier !

---

### **TEST 3 : CONNEXION ET AFFICHAGE** 🟢

**Objectif** : Vérifier que les utilisateurs créés peuvent se connecter et s'afficher correctement

**Test 3.1 : Utilisateur inscription normale**
1. ✅ Se connecter avec `test-signup-imp001@example.com`
2. ✅ Vérifier que "Jean Dupont" s'affiche dans la Navbar
3. ✅ Vérifier le rôle dans le profil

**Test 3.2 : Utilisateur créé par admin**
1. ✅ Se connecter avec `test-admin-imp001@example.com` (mot de passe : `TempPass123!`)
2. ✅ Vérifier que "Marie Martin" s'affiche dans la Navbar
3. ✅ Aller dans le profil utilisateur
4. ✅ Vérifier que TOUS les champs sont affichés :
   - WhatsApp : `+33612345678`
   - Facebook, Instagram, LinkedIn, Twitter, TikTok, Messenger

---

## 📊 RÉSUMÉ DES RÉSULTATS ATTENDUS

| Test | Inscription Normale | Création Admin |
|------|---------------------|----------------|
| **Champs sauvegardés** | 2 (full_name, role) | 17 (tous les champs) |
| **user_metadata** | `{full_name, role}` | `{}` (vide) |
| **WhatsApp** | NULL | `+33612345678` ✅ |
| **URLs sociales** | NULL | Toutes remplies ✅ |
| **Source de données** | `profiles` uniquement | `profiles` uniquement |

---

## ✅ CHECKLIST DE VALIDATION

### **Avant le test** :
- [ ] Frontend démarré (`npm run dev`)
- [ ] Connecté en tant qu'admin pour TEST 2
- [ ] Accès à la console SQL ou Supabase Dashboard

### **Test 1 - Inscription** :
- [ ] Formulaire d'inscription fonctionne
- [ ] Profil créé avec full_name et role
- [ ] user_metadata contient {full_name, role}
- [ ] Connexion réussie
- [ ] Nom affiché dans Navbar

### **Test 2 - Création admin** :
- [ ] Formulaire admin fonctionne
- [ ] Profil créé avec TOUS les 17 champs
- [ ] whatsapp_number = `+33612345678` ✅
- [ ] URLs sociales toutes sauvegardées ✅
- [ ] user_metadata = {} (vide) ✅
- [ ] Message de succès affiché

### **Test 3 - Connexion** :
- [ ] Utilisateur inscription peut se connecter
- [ ] Utilisateur admin peut se connecter
- [ ] Noms affichés correctement
- [ ] Profils complets accessibles

---

## 🚨 EN CAS DE PROBLÈME

### **Problème 1 : WhatsApp NULL après création admin**
- ❌ **Cause** : Edge Function n'a pas sauvegardé le champ
- ✅ **Solution** : Vérifier les logs de l'Edge Function

### **Problème 2 : user_metadata contient encore des données**
- ❌ **Cause** : Edge Function non déployée
- ✅ **Solution** : Redéployer `create-user` (version 15)

### **Problème 3 : Erreur "Profil introuvable"**
- ❌ **Cause** : Trigger n'a pas créé le profil
- ✅ **Solution** : Vérifier la migration SQL

### **Problème 4 : Nom ne s'affiche pas dans Navbar**
- ❌ **Cause** : Fallback user_metadata encore présent
- ✅ **Solution** : Vérifier `Navbar.tsx` ligne 137

---

## 🎯 OBJECTIF FINAL

**Après ces tests, vous devez avoir** :
1. ✅ Inscription normale : 2 champs sauvegardés (full_name, role)
2. ✅ Création admin : 17 champs sauvegardés (TOUS)
3. ✅ Plus de duplication dans user_metadata
4. ✅ `profiles` comme source unique de vérité
5. ✅ WhatsApp et URLs sociales bien sauvegardés pour utilisateurs admin

---

## 📝 RAPPORT DE TEST

**Après les tests, merci de confirmer** :
- ✅ TEST 1 (Inscription) : **PASS** / FAIL
- ✅ TEST 2 (Création admin) : **PASS** / FAIL  
- ✅ TEST 3 (Connexion) : **PASS** / FAIL

**Captures SQL à fournir** :
1. Profil de `test-signup-imp001@example.com` (doit avoir 2 champs)
2. Profil de `test-admin-imp001@example.com` (doit avoir 17 champs)
3. user_metadata des 2 utilisateurs (comparaison)

---

**Tapez "TESTS OK" quand tous les tests sont passés** ✅

