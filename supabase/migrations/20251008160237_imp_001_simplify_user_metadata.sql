-- ✅ IMP-001 : Simplifier le trigger handle_new_user()
-- 
-- CONTEXTE :
-- - L'inscription normale (signUp) utilise ce trigger
-- - La création admin utilise maintenant l'Edge Function qui insère directement dans profiles
--
-- OBJECTIF :
-- - Le trigger ne doit gérer QUE l'inscription normale (2 champs: full_name, role)
-- - Supprimer la duplication des données dans user_metadata
-- - Utiliser profiles comme unique source de vérité
--
-- IMPACT :
-- - Inscription normale : ✅ full_name et role sauvegardés
-- - Création admin : ✅ TOUS les champs sauvegardés (via Edge Function)

-- Recréer la fonction handle_new_user() avec une logique simplifiée
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text := 'tenant'; -- Valeur par défaut
  user_full_name text := '';
BEGIN
  -- ✅ IMP-001 : Récupérer UNIQUEMENT full_name et role depuis user_metadata
  -- Tous les autres champs seront gérés par l'Edge Function pour la création admin
  
  -- Récupérer le rôle depuis les métadonnées utilisateur
  IF NEW.raw_user_meta_data ? 'role' THEN
    user_role := NEW.raw_user_meta_data->>'role';
  END IF;
  
  -- Récupérer le nom complet depuis les métadonnées utilisateur
  IF NEW.raw_user_meta_data ? 'full_name' THEN
    user_full_name := NEW.raw_user_meta_data->>'full_name';
  END IF;
  
  -- Valider que le rôle est autorisé
  IF user_role NOT IN ('tenant', 'owner', 'advertiser', 'admin') THEN
    user_role := 'tenant'; -- Fallback sécurisé
  END IF;
  
  -- ✅ Créer le profil minimal UNIQUEMENT pour l'inscription normale
  -- L'Edge Function create-user fera un UPSERT avec tous les champs pour la création admin
  INSERT INTO public.profiles (user_id, email, role, full_name, created_at, updated_at)
  VALUES (NEW.id, NEW.email, user_role, user_full_name, now(), now())
  ON CONFLICT (user_id) DO NOTHING; -- Si l'Edge Function a déjà créé le profil, ne rien faire
  
  RETURN NEW;
END;
$$;

-- Commentaire sur la fonction
COMMENT ON FUNCTION public.handle_new_user() IS 
  '✅ IMP-001: Trigger simplifié pour inscription normale. ' ||
  'Crée un profil minimal (full_name, role) depuis user_metadata. ' ||
  'La création admin utilise l''Edge Function pour insérer tous les champs.';

