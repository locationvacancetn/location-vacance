-- Migration pour mettre à jour le système de slugs avec support des régions
-- Format: {type-propriété}-{région}-{ville}-{titre-propriété} ou {type-propriété}-{ville}-{titre-propriété}

-- 1. Mettre à jour la fonction pour générer un slug de propriété avec région
CREATE OR REPLACE FUNCTION generate_property_slug(
    property_type_name TEXT,
    city_name TEXT,
    property_title TEXT,
    region_name TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    type_slug TEXT;
    city_slug TEXT;
    title_slug TEXT;
    region_slug TEXT;
    final_slug TEXT;
    should_include_region BOOLEAN;
BEGIN
    -- Générer les slugs pour chaque composant
    type_slug := generate_slug(property_type_name);
    city_slug := generate_slug(city_name);
    title_slug := generate_slug(property_title);
    
    -- Limiter la longueur de chaque composant
    type_slug := LEFT(type_slug, 30);
    city_slug := LEFT(city_slug, 30);
    title_slug := LEFT(title_slug, 40);
    
    -- Vérifier si la région doit être incluse
    should_include_region := region_name IS NOT NULL 
        AND LOWER(TRIM(region_name)) != 'autre' 
        AND LOWER(TRIM(region_name)) != 'other' 
        AND TRIM(region_name) != '';
    
    -- Construire le slug final selon le format
    IF should_include_region THEN
        region_slug := generate_slug(region_name);
        region_slug := LEFT(region_slug, 30);
        final_slug := CONCAT_WS('-', type_slug, region_slug, city_slug, title_slug);
    ELSE
        final_slug := CONCAT_WS('-', type_slug, city_slug, title_slug);
    END IF;
    
    -- Nettoyer le slug final
    final_slug := REGEXP_REPLACE(final_slug, '-+', '-', 'g');
    final_slug := TRIM(final_slug, '-');
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 2. Mettre à jour la fonction pour créer une propriété avec slug automatique
CREATE OR REPLACE FUNCTION create_property_with_slug(
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
    region_name TEXT;
    base_slug TEXT;
BEGIN
    -- Récupérer les noms du type de propriété, de la ville et de la région
    SELECT name INTO property_type_name 
    FROM property_types 
    WHERE id = p_property_type_id;
    
    SELECT name INTO city_name 
    FROM cities 
    WHERE id = p_city_id;
    
    -- Récupérer le nom de la région si elle existe
    IF p_region_id IS NOT NULL THEN
        SELECT name INTO region_name 
        FROM regions 
        WHERE id = p_region_id;
    ELSE
        region_name := NULL;
    END IF;
    
    -- Générer le slug de base avec la région
    base_slug := generate_property_slug(property_type_name, city_name, p_title, region_name);
    
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

-- 3. Mettre à jour la fonction pour régénérer le slug d'une propriété
CREATE OR REPLACE FUNCTION regenerate_property_slug(p_property_id UUID)
RETURNS TEXT AS $$
DECLARE
    property_record RECORD;
    new_slug TEXT;
    base_slug TEXT;
BEGIN
    -- Récupérer les informations de la propriété
    SELECT p.*, pt.name as property_type_name, c.name as city_name, r.name as region_name
    INTO property_record
    FROM properties p
    JOIN property_types pt ON p.property_type_id = pt.id
    JOIN cities c ON p.city_id = c.id
    LEFT JOIN regions r ON p.region_id = r.id
    WHERE p.id = p_property_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Propriété non trouvée';
    END IF;
    
    -- Générer le nouveau slug avec la région
    base_slug := generate_property_slug(
        property_record.property_type_name,
        property_record.city_name,
        property_record.title,
        property_record.region_name
    );
    
    new_slug := generate_unique_slug(base_slug);
    
    -- Mettre à jour le slug
    UPDATE properties
    SET slug = new_slug, updated_at = NOW()
    WHERE id = p_property_id;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Commentaires pour la documentation
COMMENT ON FUNCTION generate_property_slug(TEXT, TEXT, TEXT, TEXT) IS 
'Génère un slug pour une propriété avec le format {type}-{région}-{ville}-{titre} ou {type}-{ville}-{titre} selon la région';

COMMENT ON FUNCTION create_property_with_slug IS 
'Crée une propriété avec génération automatique de slug incluant la région';

COMMENT ON FUNCTION regenerate_property_slug(UUID) IS 
'Régénère le slug d''une propriété en incluant la région si elle n''est pas "autre"';
