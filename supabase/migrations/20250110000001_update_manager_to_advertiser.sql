-- Migration pour changer le rôle 'manager' en 'advertiser'
-- Update role from 'manager' to 'advertiser' in profiles table

-- Mettre à jour la contrainte CHECK pour inclure 'advertiser' au lieu de 'manager'
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Ajouter la nouvelle contrainte avec 'advertiser'
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('owner', 'tenant', 'advertiser', 'admin'));

-- Mettre à jour tous les utilisateurs existants avec le rôle 'manager' vers 'advertiser'
UPDATE public.profiles 
SET role = 'advertiser' 
WHERE role = 'manager';

-- Mettre à jour le commentaire de la colonne
COMMENT ON COLUMN public.profiles.role IS 'User role: owner (propriétaire), tenant (locataire), advertiser (annonceur), admin (administrateur)';

-- Mettre à jour les politiques RLS pour le nouveau rôle
-- Supprimer l'ancienne politique pour manager
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.profiles;

-- Recréer la politique avec le nouveau rôle
CREATE POLICY "Admins can manage user roles" ON public.profiles
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = (SELECT auth.uid()) 
        AND role = 'admin'
    )
);
