-- Migration pour le système de slugs des propriétés
-- Format: {type-propriete}-{ville}-{titre-propriete}

-- 1. Fonction pour générer un slug à partir d'un texte
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    IF input_text IS NULL OR TRIM(input_text) = '' THEN
        RETURN '';
    END IF;
    
    -- Normalisation du texte
    slug := LOWER(TRIM(input_text));
    
    -- Suppression des accents
    slug := TRANSLATE(slug, 'àáâãäåèéêëìíîïòóôõöøùúûüýÿñç', 'aaaaaaeeeeiiiioooooouuuuyync');
    
    -- Suppression des caractères spéciaux (garde seulement alphanumériques, espaces et tirets)
    slug := REGEXP_REPLACE(slug, '[^a-z0-9\s-]', '', 'g');
    
    -- Remplacement des espaces multiples par un seul espace
    slug := REGEXP_REPLACE(slug, '\s+', ' ', 'g');
    
    -- Remplacement des espaces par des tirets
    slug := REPLACE(slug, ' ', '-');
    
    -- Suppression des tirets multiples
    slug := REGEXP_REPLACE(slug, '-+', '-', 'g');
    
    -- Suppression des tirets en début et fin
    slug := TRIM(slug, '-');
    
    -- Limitation à 100 caractères
    IF LENGTH(slug) > 100 THEN
        slug := LEFT(slug, 100);
        -- S'assurer de ne pas couper au milieu d'un mot
        IF POSITION('-' IN REVERSE(slug)) > 0 THEN
            slug := LEFT(slug, LENGTH(slug) - POSITION('-' IN REVERSE(slug)));
        END IF;
    END IF;
    
    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- 2. Fonction pour générer un slug de propriété
CREATE OR REPLACE FUNCTION generate_property_slug(
    property_type_name TEXT,
    city_name TEXT,
    property_title TEXT
)
RETURNS TEXT AS $$
DECLARE
    type_slug TEXT;
    city_slug TEXT;
    title_slug TEXT;
    final_slug TEXT;
BEGIN
    -- Générer les slugs pour chaque composant
    type_slug := generate_slug(property_type_name);
    city_slug := generate_slug(city_name);
    title_slug := generate_slug(property_title);
    
    -- Limiter la longueur de chaque composant
    type_slug := LEFT(type_slug, 30);
    city_slug := LEFT(city_slug, 30);
    title_slug := LEFT(title_slug, 40);
    
    -- Construire le slug final
    final_slug := CONCAT_WS('-', type_slug, city_slug, title_slug);
    
    -- Nettoyer le slug final
    final_slug := REGEXP_REPLACE(final_slug, '-+', '-', 'g');
    final_slug := TRIM(final_slug, '-');
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 3. Fonction pour générer un slug unique
CREATE OR REPLACE FUNCTION generate_unique_slug(
    base_slug TEXT,
    table_name TEXT DEFAULT 'properties',
    column_name TEXT DEFAULT 'slug'
)
RETURNS TEXT AS $$
DECLARE
    unique_slug TEXT;
    counter INTEGER := 1;
    max_attempts INTEGER := 10;
    sql_query TEXT;
    exists_count INTEGER;
BEGIN
    unique_slug := base_slug;
    
    -- Vérifier si le slug de base est disponible
    sql_query := FORMAT('SELECT COUNT(*) FROM %I WHERE %I = $1', table_name, column_name);
    EXECUTE sql_query INTO exists_count USING unique_slug;
    
    -- Si disponible, le retourner
    IF exists_count = 0 THEN
        RETURN unique_slug;
    END IF;
    
    -- Sinon, essayer avec un suffixe numérique
    WHILE counter <= max_attempts LOOP
        unique_slug := base_slug || '-' || counter::TEXT;
        
        EXECUTE sql_query INTO exists_count USING unique_slug;
        
        IF exists_count = 0 THEN
            RETURN unique_slug;
        END IF;
        
        counter := counter + 1;
    END LOOP;
    
    -- Si on n'a pas trouvé d'unicité, ajouter un timestamp
    unique_slug := base_slug || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER;
    
    RETURN unique_slug;
END;
$$ LANGUAGE plpgsql;

-- 4. Fonction principale pour créer une propriété avec slug automatique
CREATE OR REPLACE FUNCTION create_property(
    p_title TEXT,
    p_description TEXT,
    p_city_id UUID,
    p_region_id UUID,
    p_property_type_id UUID,
    p_address TEXT,
    p_longitude TEXT,
    p_latitude TEXT,
    p_max_guests INTEGER,
    p_bedrooms INTEGER,
    p_bathrooms INTEGER,
    p_price_per_night NUMERIC,
    p_min_nights INTEGER,
    p_check_in_time TEXT,
    p_check_out_time TEXT,
    p_images TEXT[],
    p_equipment_ids UUID[],
    p_characteristic_ids UUID[],
    p_smoking_allowed BOOLEAN,
    p_pets_allowed BOOLEAN,
    p_parties_allowed BOOLEAN,
    p_children_allowed BOOLEAN,
    p_owner_id UUID
)
RETURNS UUID AS $$
DECLARE
    property_id UUID;
    property_slug TEXT;
    property_type_name TEXT;
    city_name TEXT;
    base_slug TEXT;
BEGIN
    -- Récupérer les noms du type de propriété et de la ville
    SELECT name INTO property_type_name 
    FROM property_types 
    WHERE id = p_property_type_id;
    
    SELECT name INTO city_name 
    FROM cities 
    WHERE id = p_city_id;
    
    -- Générer le slug de base
    base_slug := generate_property_slug(property_type_name, city_name, p_title);
    
    -- Générer un slug unique
    property_slug := generate_unique_slug(base_slug);
    
    -- Insérer la propriété
    INSERT INTO properties (
        title,
        description,
        slug,
        city_id,
        region_id,
        property_type_id,
        location,
        longitude,
        latitude,
        max_guests,
        bedrooms,
        bathrooms,
        price_per_night,
        min_nights,
        check_in_time,
        check_out_time,
        images,
        equipment_ids,
        characteristic_ids,
        smoking_allowed,
        pets_allowed,
        parties_allowed,
        children_allowed,
        owner_id,
        status,
        is_active,
        is_public
    ) VALUES (
        p_title,
        p_description,
        property_slug,
        p_city_id,
        p_region_id,
        p_property_type_id,
        p_address,
        p_longitude,
        p_latitude,
        p_max_guests,
        p_bedrooms,
        p_bathrooms,
        p_price_per_night,
        p_min_nights,
        p_check_in_time,
        p_check_out_time,
        p_images,
        p_equipment_ids,
        p_characteristic_ids,
        p_smoking_allowed,
        p_pets_allowed,
        p_parties_allowed,
        p_children_allowed,
        p_owner_id,
        'pending_payment',
        true,
        false
    ) RETURNING id INTO property_id;
    
    RETURN property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Fonction pour mettre à jour le slug d'une propriété
CREATE OR REPLACE FUNCTION update_property_slug(
    p_property_id UUID,
    p_new_slug TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    slug_exists INTEGER;
BEGIN
    -- Vérifier que le nouveau slug n'existe pas déjà
    SELECT COUNT(*) INTO slug_exists
    FROM properties
    WHERE slug = p_new_slug AND id != p_property_id;
    
    IF slug_exists > 0 THEN
        RAISE EXCEPTION 'Le slug "%" existe déjà', p_new_slug;
    END IF;
    
    -- Mettre à jour le slug
    UPDATE properties
    SET slug = p_new_slug, updated_at = NOW()
    WHERE id = p_property_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction pour régénérer le slug d'une propriété
CREATE OR REPLACE FUNCTION regenerate_property_slug(p_property_id UUID)
RETURNS TEXT AS $$
DECLARE
    property_record RECORD;
    new_slug TEXT;
    base_slug TEXT;
BEGIN
    -- Récupérer les informations de la propriété
    SELECT p.*, pt.name as property_type_name, c.name as city_name
    INTO property_record
    FROM properties p
    JOIN property_types pt ON p.property_type_id = pt.id
    JOIN cities c ON p.city_id = c.id
    WHERE p.id = p_property_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Propriété non trouvée';
    END IF;
    
    -- Générer le nouveau slug
    base_slug := generate_property_slug(
        property_record.property_type_name,
        property_record.city_name,
        property_record.title
    );
    
    new_slug := generate_unique_slug(base_slug);
    
    -- Mettre à jour le slug
    UPDATE properties
    SET slug = new_slug, updated_at = NOW()
    WHERE id = p_property_id;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Index pour optimiser les recherches par slug
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_slug_active ON properties(slug) WHERE is_active = true;

-- 8. Commentaires pour la documentation
COMMENT ON FUNCTION generate_slug(TEXT) IS 'Génère un slug URL-friendly à partir d''un texte';
COMMENT ON FUNCTION generate_property_slug(TEXT, TEXT, TEXT) IS 'Génère un slug pour une propriété au format type-ville-titre';
COMMENT ON FUNCTION generate_unique_slug(TEXT, TEXT, TEXT) IS 'Génère un slug unique en ajoutant un suffixe si nécessaire';
COMMENT ON FUNCTION create_property IS 'Crée une propriété avec génération automatique de slug';
COMMENT ON FUNCTION update_property_slug(UUID, TEXT) IS 'Met à jour le slug d''une propriété en vérifiant l''unicité';
COMMENT ON FUNCTION regenerate_property_slug(UUID) IS 'Régénère le slug d''une propriété existante';
