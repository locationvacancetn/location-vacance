-- Migration pour ajouter les rôles utilisateurs
-- Add role column to profiles table if it doesn't exist

DO $$ 
BEGIN
    -- Vérifier si la colonne 'role' existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        -- Ajouter la colonne role avec une valeur par défaut
        ALTER TABLE public.profiles 
        ADD COLUMN role text DEFAULT 'tenant' CHECK (role IN ('owner', 'tenant', 'manager', 'admin'));
        
        -- Ajouter un commentaire
        COMMENT ON COLUMN public.profiles.role IS 'User role: owner (propriétaire), tenant (locataire), manager (gestionnaire), admin (administrateur)';
    END IF;
END $$;

-- Mettre à jour la fonction handle_new_user pour inclure le rôle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, email, role)
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'tenant')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajouter un index sur la colonne role pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- RLS policies pour le rôle
CREATE POLICY IF NOT EXISTS "Users can read their own role" ON public.profiles
FOR SELECT USING ((SELECT auth.uid()) = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile including role" ON public.profiles
FOR UPDATE USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- Seuls les admins peuvent modifier les rôles des autres utilisateurs
CREATE POLICY IF NOT EXISTS "Admins can manage user roles" ON public.profiles
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = (SELECT auth.uid()) 
        AND role = 'admin'
    )
);

-- Permettre aux admins de voir tous les profils
CREATE POLICY IF NOT EXISTS "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = (SELECT auth.uid()) 
        AND role = 'admin'
    )
);

