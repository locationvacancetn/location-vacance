-- Migration de correction pour la validation des profils
-- Simplifier la validation pour éviter les erreurs 400

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS validate_profile_trigger ON public.profiles;

-- Créer une nouvelle fonction de validation simplifiée
CREATE OR REPLACE FUNCTION public.validate_profile_by_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Validation simplifiée : seulement vérifier que les champs ne sont pas des chaînes vides
  -- si ils sont fournis
  
  -- Validation du téléphone
  IF NEW.phone IS NOT NULL AND TRIM(NEW.phone) = '' THEN
    RAISE EXCEPTION 'Le numéro de téléphone ne peut pas être vide';
  END IF;
  
  -- Validation du WhatsApp
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
  
  -- Validation optionnelle : si site web est fourni, vérifier le format
  IF NEW.website_url IS NOT NULL AND NEW.website_url != '' THEN
    IF NOT NEW.website_url ~ '^https?://' THEN
      RAISE EXCEPTION 'L''URL du site web doit commencer par http:// ou https://';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER validate_profile_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_by_role();
