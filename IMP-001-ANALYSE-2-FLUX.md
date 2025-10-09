# 🔍 ANALYSE COMPLÈTE - 2 FLUX DE CRÉATION UTILISATEUR

## 📊 SITUATION ACTUELLE

### **FLUX 1 : INSCRIPTION NORMALE** (utilisateurs publics)
**Fichier** : `src/components/auth/SignupForm.tsx`

**Données collectées** :
- ✅ `full_name`
- ✅ `role` (tenant, owner, advertiser)
- ✅ `email`
- ✅ `password`

**Méthode** : `supabase.auth.signUp()`
```typescript
// Ligne 119-128
await supabase.auth.signUp({
  email: values.email,
  password: values.password,
  options: {
    data: {
      full_name: values.fullName,  // ← Dans user_metadata
      role: values.role,            // ← Dans user_metadata
    },
  },
});
```

**Ce qui se passe** :
1. ✅ Supabase Auth crée user avec `raw_user_meta_data = {full_name, role}`
2. ✅ Trigger `handle_new_user()` s'exécute
3. ✅ Copie `full_name` et `role` dans `profiles`
4. ✅ **TOUT FONCTIONNE** ✨

---

### **FLUX 2 : CRÉATION PAR ADMIN** (tableau de bord admin)
**Fichier** : `src/pages/dashboard/admin/AddUser.tsx`

**Données collectées** :
- ✅ `email`, `password`, `full_name`, `role`
- ✅ `phone`, `bio`, `whatsapp_number`
- ✅ `website_url`, `facebook_url`, `instagram_url`, `tiktok_url`, `messenger_url`
- ✅ `company_name`, `company_website`, `business_phone`, `business_email`
- ✅ `linkedin_url`, `twitter_url`

**TOTAL : 17 CHAMPS !**

**Méthode** : Edge Function `create-user`
```typescript
// Ligne 227-235
await fetch(`${config.supabase.url}/functions/v1/create-user`, {
  method: 'POST',
  body: JSON.stringify({
    email, password, full_name, role,
    phone, bio, whatsapp_number,
    website_url, facebook_url, instagram_url, tiktok_url, messenger_url,
    company_name, company_website, business_phone, business_email,
    linkedin_url, twitter_url
  }),
});
```

**Edge Function** : `supabase/functions/create-user/index.ts`
```typescript
// Ligne 172-194
await supabase.auth.admin.createUser({
  email: userData.email,
  password: userData.password,
  email_confirm: true,
  user_metadata: {
    full_name: userData.full_name,
    role: userData.role,
    phone: userData.phone,
    bio: userData.bio,
    whatsapp_number: userData.whatsapp_number,
    website_url: userData.website_url,
    facebook_url: userData.facebook_url,
    instagram_url: userData.instagram_url,
    tiktok_url: userData.tiktok_url,
    messenger_url: userData.messenger_url,
    company_name: userData.company_name,
    company_website: userData.company_website,
    business_phone: userData.business_phone,
    business_email: userData.business_email,
    linkedin_url: userData.linkedin_url,
    twitter_url: userData.twitter_url
    // ❌ TOUT mis dans user_metadata !
  }
});
```

**Trigger SQL** : `handle_new_user()`
```sql
-- Ne copie QUE 2 champs sur 17 !
INSERT INTO public.profiles (user_id, email, role, full_name, ...)
VALUES (
  new.id, 
  new.email, 
  raw_user_meta_data->>'role',       -- ✅ Copié
  raw_user_meta_data->>'full_name',  -- ✅ Copié
  ...
);
-- ❌ phone, bio, whatsapp, URLs sociales... PERDUS !
```

**Ce qui se passe** :
1. ❌ Edge Function met **17 champs** dans `user_metadata`
2. ❌ Trigger copie **SEULEMENT 2 champs** (`full_name`, `role`)
3. 🔴 **15 CHAMPS PERDUS** : phone, bio, whatsapp, URLs sociales, company_*, business_*, linkedin, twitter
4. 🔴 **DONNÉES DUPLIQUÉES** inutilement dans user_metadata
5. 🔴 **PERTE DE DONNÉES** massive pour les utilisateurs créés par admin !

---

## 🚨 **PROBLÈME CRITIQUE**

**Quand l'admin crée un utilisateur avec** :
- ✅ Email: `john@example.com`
- ✅ Full name: `John Doe`
- ✅ Role: `owner`
- ✅ WhatsApp: `+33612345678` ← **OBLIGATOIRE pour owner !**
- ✅ Facebook: `https://facebook.com/john`
- ✅ Instagram: `https://instagram.com/john`
- ... etc.

**Résultat en base** :
```sql
-- Table profiles
user_id: uuid
email: john@example.com
full_name: John Doe      ✅
role: owner              ✅
whatsapp_number: NULL    ❌ PERDU !
facebook_url: NULL       ❌ PERDU !
instagram_url: NULL      ❌ PERDU !
phone: NULL              ❌ PERDU !
bio: NULL                ❌ PERDU !
-- ... tous les autres NULL
```

```json
// auth.users.raw_user_meta_data
{
  "full_name": "John Doe",          // ✅ Dupliqué
  "role": "owner",                   // ✅ Dupliqué
  "whatsapp_number": "+33612345678", // ❌ Stocké UNIQUEMENT ici (inutile !)
  "facebook_url": "...",             // ❌ Stocké UNIQUEMENT ici (inutile !)
  "instagram_url": "...",            // ❌ Stocké UNIQUEMENT ici (inutile !)
  // ...
}
```

**🔴 CONSÉQUENCES** :
- Admin remplit 17 champs
- SEULEMENT 2 sont sauvegardés dans `profiles`
- 15 champs sont perdus (sauf dans user_metadata, mais INACCESSIBLES !)
- L'utilisateur créé n'a PAS de WhatsApp (pourtant obligatoire !)
- L'utilisateur créé n'a PAS de réseaux sociaux
- L'utilisateur créé n'a PAS d'infos entreprise

---

## ✅ **SOLUTION IMP-001**

### **OBJECTIF**
1. ✅ Supprimer la duplication dans `user_metadata`
2. ✅ Sauvegarder TOUS les champs dans `profiles` (pas juste 2 !)
3. ✅ Utiliser `profiles` comme unique source de vérité

### **MODIFICATIONS REQUISES**

#### **1. Edge Function `create-user`** ❌→✅
**AVANT** : Tout dans user_metadata
```typescript
user_metadata: {
  full_name, role, phone, bio, whatsapp, urls, company, ...
}
// Trigger copie SEULEMENT full_name et role
```

**APRÈS** : Créer directement dans profiles
```typescript
// 1. Créer user Auth (sans métadonnées métier)
await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {} // ✅ Vide ou juste email
});

// 2. Créer profil complet directement
await supabase.from('profiles').insert({
  user_id: user.id,
  email,
  full_name,
  role,
  phone,
  bio,
  whatsapp_number,
  website_url,
  facebook_url,
  // ... TOUS les champs ! ✅
});
```

#### **2. Trigger `handle_new_user()`** ❌→✅
**AVANT** : Copie depuis user_metadata
```sql
INSERT INTO profiles (user_id, email, role, full_name)
VALUES (
  NEW.id,
  NEW.email,
  NEW.raw_user_meta_data->>'role',
  NEW.raw_user_meta_data->>'full_name'
);
```

**APRÈS** : Profil minimal pour inscription normale
```sql
INSERT INTO profiles (user_id, email, role, full_name)
VALUES (
  NEW.id,
  NEW.email,
  COALESCE(NEW.raw_user_meta_data->>'role', 'tenant'),
  COALESCE(NEW.raw_user_meta_data->>'full_name', '')
);
-- ✅ Juste pour l'inscription normale (2 champs)
-- ✅ L'admin créera le profil complet via Edge Function
```

#### **3. Hook `useUserRole`** ❌→✅
**AVANT** : Fallback vers user_metadata
```typescript
const roleFromAuth = user.user_metadata?.role || 'tenant';
setUserProfile({
  full_name: user.user_metadata?.full_name || user.email,
  // ...
});
```

**APRÈS** : Lire UNIQUEMENT depuis profiles
```typescript
// Si pas de profil, c'est une erreur critique
if (!profile) {
  throw new Error('Profil introuvable');
}
setUserRole(profile.role);
setUserProfile(profile);
```

#### **4. Navbar** ❌→✅
**AVANT** : `userProfile?.full_name || user?.user_metadata?.full_name`  
**APRÈS** : `userProfile?.full_name || user?.email`

---

## 🎯 **PLAN D'EXÉCUTION**

### **Phase 1 : Edge Function (15 min)**
1. ✅ Modifier `create-user/index.ts`
2. ✅ Ne plus remplir user_metadata
3. ✅ Créer directement dans profiles avec TOUS les champs
4. ✅ Déployer via MCP

### **Phase 2 : Trigger SQL (10 min)**
1. ✅ Créer nouvelle migration
2. ✅ Simplifier handle_new_user() pour inscription normale
3. ✅ Tester

### **Phase 3 : Frontend (10 min)**
1. ✅ Modifier useUserRole.ts (supprimer fallback)
2. ✅ Modifier Navbar.tsx (supprimer fallback)
3. ✅ Tester

### **Phase 4 : Tests (10 min)**
1. ✅ Tester création utilisateur par admin (17 champs)
2. ✅ Tester inscription normale (2 champs)
3. ✅ Vérifier affichage
4. ✅ Vérifier rôles

---

## ✅ **ROLLBACK GARANTI**
- ✅ Branche : `fix/imp-001-user-metadata-duplication`
- ✅ Commande : `git checkout main`

---

## ❓ **VALIDATION FINALE**

**Confirmez-vous que** :
1. ✅ Le problème est clair ? (15 champs perdus lors de création par admin)
2. ✅ La solution est comprise ?
3. ✅ On peut procéder aux modifications ?

**Tapez "GO" pour lancer** 🚀

