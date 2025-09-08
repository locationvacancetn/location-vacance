-- Migration pour ajouter les champs de contact social et professionnel
-- Ces champs seront optionnels et utilisés selon le rôle de l'utilisateur

-- Champs de contact social (principalement pour les owners)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20) NULL,
ADD COLUMN IF NOT EXISTS website_url TEXT NULL,
ADD COLUMN IF NOT EXISTS facebook_url TEXT NULL,
ADD COLUMN IF NOT EXISTS instagram_url TEXT NULL,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT NULL,
ADD COLUMN IF NOT EXISTS messenger_url TEXT NULL;

-- Champs professionnels (principalement pour les advertisers)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS company_website TEXT NULL,
ADD COLUMN IF NOT EXISTS business_phone VARCHAR(20) NULL,
ADD COLUMN IF NOT EXISTS business_email VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT NULL,
ADD COLUMN IF NOT EXISTS twitter_url TEXT NULL;

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN public.profiles.whatsapp_number IS 'Numéro WhatsApp (obligatoire pour les propriétaires)';
COMMENT ON COLUMN public.profiles.website_url IS 'URL du site web personnel ou professionnel';
COMMENT ON COLUMN public.profiles.facebook_url IS 'URL de la page Facebook';
COMMENT ON COLUMN public.profiles.instagram_url IS 'URL de la page Instagram';
COMMENT ON COLUMN public.profiles.tiktok_url IS 'URL de la page TikTok';
COMMENT ON COLUMN public.profiles.messenger_url IS 'Lien Messenger';
COMMENT ON COLUMN public.profiles.company_name IS 'Nom de l\'entreprise (obligatoire pour les annonceurs)';
COMMENT ON COLUMN public.profiles.company_website IS 'Site web de l\'entreprise';
COMMENT ON COLUMN public.profiles.business_phone IS 'Téléphone professionnel';
COMMENT ON COLUMN public.profiles.business_email IS 'Email professionnel';
COMMENT ON COLUMN public.profiles.linkedin_url IS 'URL LinkedIn';
COMMENT ON COLUMN public.profiles.twitter_url IS 'URL Twitter';

-- Fonction de validation conditionnelle selon le rôle
CREATE OR REPLACE FUNCTION public.validate_profile_by_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Validation pour les propriétaires (owners)
  IF NEW.role = 'owner' THEN
    -- Validation du téléphone (peut être vide pour les autres rôles)
    IF NEW.phone IS NOT NULL AND TRIM(NEW.phone) = '' THEN
      RAISE EXCEPTION 'Le numéro de téléphone ne peut pas être vide';
    END IF;
    
    -- Validation du WhatsApp (obligatoire pour les propriétaires)
    IF NEW.whatsapp_number IS NOT NULL AND TRIM(NEW.whatsapp_number) = '' THEN
      RAISE EXCEPTION 'Le numéro WhatsApp ne peut pas être vide';
    END IF;
    
    -- Validation optionnelle : si Facebook est fourni, vérifier le format
    IF NEW.facebook_url IS NOT NULL AND NEW.facebook_url != '' THEN
      IF NOT NEW.facebook_url ~ '^https?://(www\.)?facebook\.com/' THEN
        RAISE EXCEPTION 'L''URL Facebook doit commencer par https://facebook.com/ ou https://www.facebook.com/';
      END IF;
    END IF;
    
    -- Validation optionnelle : si Instagram est fourni, vérifier le format
    IF NEW.instagram_url IS NOT NULL AND NEW.instagram_url != '' THEN
      IF NOT NEW.instagram_url ~ '^https?://(www\.)?instagram\.com/' THEN
        RAISE EXCEPTION 'L''URL Instagram doit commencer par https://instagram.com/ ou https://www.instagram.com/';
      END IF;
    END IF;
  END IF;
  
  -- Validation pour les annonceurs (advertisers)
  IF NEW.role = 'advertiser' THEN
    IF NEW.company_name IS NULL OR TRIM(NEW.company_name) = '' THEN
      RAISE EXCEPTION 'Le nom de l''entreprise est obligatoire pour les annonceurs';
    END IF;
    
    -- Validation optionnelle : si site web est fourni, vérifier le format
    IF NEW.company_website IS NOT NULL AND NEW.company_website != '' THEN
      IF NOT NEW.company_website ~ '^https?://' THEN
        RAISE EXCEPTION 'L''URL du site web doit commencer par http:// ou https://';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger de validation
DROP TRIGGER IF EXISTS validate_profile_trigger ON public.profiles;
CREATE TRIGGER validate_profile_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_by_role();

-- Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON public.profiles(whatsapp_number) WHERE whatsapp_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_name) WHERE company_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role_whatsapp ON public.profiles(role, whatsapp_number) WHERE role = 'owner';
CREATE INDEX IF NOT EXISTS idx_profiles_role_company ON public.profiles(role, company_name) WHERE role = 'advertiser';
