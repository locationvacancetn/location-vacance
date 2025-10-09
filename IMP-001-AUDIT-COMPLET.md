# 🔍 IMP-001 : AUDIT COMPLET - Utilisation de user_metadata

## ✅ ROLLBACK ASSURÉ
- **Branche créée** : `fix/imp-001-user-metadata-duplication`
- **Commande rollback** : `git checkout main` (ou branche précédente)

---

## 📍 TOUS LES ENDROITS OÙ `user_metadata` EST UTILISÉ

### **1️⃣ EDGE FUNCTION : create-user** ❌ À MODIFIER
**Fichier** : `supabase/functions/create-user/index.ts`

**Ligne 176-179** : Création utilisateur avec métadonnées
```typescript
user_metadata: {
  full_name: userData.full_name,
  role: userData.role,
  phone: userData.phone,
  // ... autres données
}
```

**❌ PROBLÈME** : Stocke full_name, role, phone dans user_metadata  
**✅ SOLUTION** : Ne plus remplir user_metadata, créer directement dans profiles

---

### **2️⃣ SQL TRIGGER : handle_new_user()** ❌ À MODIFIER
**Fichier** : `supabase/migrations/20250110000000_add_role_to_profiles.sql`

**Ligne 28-35** : Le trigger copie depuis user_metadata vers profiles
```sql
INSERT INTO public.profiles (id, full_name, avatar_url, email, role)
VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',     -- ❌ Copie depuis metadata
    NEW.raw_user_meta_data->>'avatar_url',    -- ❌ Copie depuis metadata
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant')  -- ❌ Copie depuis metadata
);
```

**❌ PROBLÈME** : Le trigger copie les données de user_metadata vers profiles  
**✅ SOLUTION** : Simplifier le trigger pour créer une ligne vide/minimale

---

### **3️⃣ HOOK : useUserRole** ⚠️ À MODIFIER (FALLBACK)
**Fichier** : `src/hooks/useUserRole.ts`

**Ligne 179-190** : Fallback vers user_metadata si pas de profil
```typescript
// Si pas de profil trouvé, utilise auth metadata
const roleFromAuth = user.user_metadata?.role as UserRole || 'tenant';
setUserRole(roleFromAuth);

setUserProfile({
  id: user.id,
  full_name: user.user_metadata?.full_name || user.email || '',  // ❌ Fallback
  email: user.email || '',
  role: roleFromAuth,
  avatar_url: user.user_metadata?.avatar_url,  // ❌ Fallback
});
```

**⚠️ PROBLÈME** : Fallback vers user_metadata si profil manquant  
**✅ SOLUTION** : Supprimer le fallback, forcer la lecture depuis profiles uniquement

---

### **4️⃣ COMPOSANT : Navbar** ⚠️ À MODIFIER (FALLBACK)
**Fichier** : `src/components/Navbar.tsx`

**Ligne 137** : Affichage nom avec fallback
```typescript
const displayName = loading ? "Chargement..." : 
  userProfile?.full_name || (user?.user_metadata as any)?.full_name || user?.email || "Utilisateur";
```

**⚠️ PROBLÈME** : Fallback vers user_metadata.full_name  
**✅ SOLUTION** : Utiliser uniquement userProfile.full_name

---

### **5️⃣ PAGE : TestAuth** ℹ️ AFFICHAGE DEBUG (OK)
**Fichier** : `src/pages/TestAuth.tsx`

**Ligne 38** : Affichage du rôle
```typescript
<span className="text-sm text-muted-foreground">({user.user_metadata?.role || 'N/A'})</span>
```

**ℹ️ STATUT** : Page de test/debug, peut rester pour afficher les métadonnées brutes  
**ℹ️ ACTION** : Optionnel - peut rester ou afficher depuis profiles

---

### **6️⃣ COMPOSANT : AuthDebugger** ℹ️ DEBUG (OK)
**Fichier** : `src/components/auth/AuthDebugger.tsx`

**Ligne 34** : Debug du rôle
```typescript
role: user.user_metadata?.role || 'N/A'
```

**ℹ️ STATUT** : Composant de debug, affiche les métadonnées brutes  
**ℹ️ ACTION** : Peut rester pour le debug

---

### **7️⃣ COMPOSANT : DatabaseTest** ℹ️ DEBUG (OK)
**Fichier** : `src/components/DatabaseTest.tsx`

**Ligne 49-53** : Test des métadonnées
```typescript
results.userMetadata = {
  user_id: user.id,
  email: user.email,
  user_metadata: user.user_metadata,  // Affichage brut pour test
  created_at: user.created_at
};
```

**ℹ️ STATUT** : Composant de test database  
**ℹ️ ACTION** : Peut rester pour les tests

---

### **8️⃣ UTILS : authTestUtils** ℹ️ TESTS (OK)
**Fichier** : `src/utils/authTestUtils.ts`

**Ligne 29-31, 54-56** : Mock user pour tests
```typescript
user_metadata: {
  role: 'owner'
}
```

**ℹ️ STATUT** : Utilitaires de test  
**ℹ️ ACTION** : Peut rester pour les mocks de test

---

## 📊 RÉSUMÉ - FICHIERS À MODIFIER

### 🔴 **MODIFICATIONS OBLIGATOIRES (4 fichiers)**

1. ✅ **supabase/functions/create-user/index.ts**  
   → Ne plus remplir user_metadata avec full_name, role, phone

2. ✅ **SQL Trigger handle_new_user()**  
   → Ne plus copier depuis raw_user_meta_data

3. ✅ **src/hooks/useUserRole.ts**  
   → Supprimer fallback vers user_metadata

4. ✅ **src/components/Navbar.tsx**  
   → Supprimer fallback vers user_metadata.full_name

### 🟡 **MODIFICATIONS OPTIONNELLES (3 fichiers)**

5. ⚠️ **src/pages/TestAuth.tsx** (page debug)  
   → Peut afficher depuis profiles au lieu de user_metadata

6. ⚠️ **src/components/auth/AuthDebugger.tsx** (debug)  
   → OK de garder pour debug des métadonnées brutes

7. ⚠️ **src/components/DatabaseTest.tsx** (test)  
   → OK de garder pour tests

8. ⚠️ **src/utils/authTestUtils.ts** (mocks)  
   → OK de garder pour mocks de test

---

## 🎯 PLAN D'ACTION PROPOSÉ

### **PHASE 1 : Modifier Edge Function** (5 min)
1. Modifier `create-user/index.ts`
2. Ne plus remplir user_metadata
3. Créer directement dans profiles après création user

### **PHASE 2 : Modifier Trigger SQL** (10 min)
1. Créer nouvelle migration
2. Simplifier handle_new_user()
3. Créer profil minimal (id, email seulement)

### **PHASE 3 : Supprimer Fallbacks Frontend** (10 min)
1. Modifier useUserRole.ts
2. Modifier Navbar.tsx
3. Optionnel : Modifier TestAuth.tsx

### **PHASE 4 : Tests** (5 min)
1. Tester création nouvel utilisateur
2. Vérifier profil créé correctement
3. Vérifier affichage Navbar

---

## ⚠️ POINTS D'ATTENTION

1. **Migration existante** : Le trigger a plusieurs versions dans différentes migrations
2. **Utilisateurs existants** : Ont déjà des données dans user_metadata (pas grave, on ne les touche pas)
3. **Nouveaux utilisateurs** : Auront profiles comme seule source
4. **Tests critiques** :
   - ✅ Création utilisateur fonctionne
   - ✅ Profil créé dans profiles
   - ✅ Connexion et affichage nom fonctionne
   - ✅ Rôle bien récupéré

---

## 🔄 ROLLBACK SI PROBLÈME

```bash
# Retour à l'état initial
git checkout main  # ou votre branche précédente
git branch -D fix/imp-001-user-metadata-duplication

# Réinitialiser l'environnement local
npm run dev
```

---

## ❓ VALIDATION REQUISE

**Avant de continuer, confirmez :**

1. ✅ Tous les endroits ont été trouvés ?
2. ✅ Le plan d'action est clair ?
3. ✅ Vous êtes OK pour modifier ces 4 fichiers obligatoires ?
4. ✅ On garde les fichiers debug/test en l'état ?

**Tapez "GO" pour lancer les modifications** 🚀

