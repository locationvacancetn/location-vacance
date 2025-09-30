-- Migration pour régénérer les slugs existants avec le nouveau format incluant les régions
-- Format: {type-propriété}-{région}-{ville}-{titre-propriété} ou {type-propriété}-{ville}-{titre-propriété}

-- 1. Régénérer les slugs pour toutes les propriétés existantes
UPDATE properties 
SET slug = generate_unique_slug(
    generate_property_slug(
        (SELECT pt.name FROM property_types pt WHERE pt.id = properties.property_type_id),
        (SELECT c.name FROM cities c WHERE c.id = properties.city_id),
        properties.title,
        (SELECT r.name FROM regions r WHERE r.id = properties.region_id)
    )
)
WHERE slug IS NOT NULL AND slug != '';

-- 2. Nettoyer les slugs existants qui pourraient être malformés
UPDATE properties 
SET slug = generate_slug(slug)
WHERE slug IS NOT NULL 
  AND slug != ''
  AND slug !~ '^[a-z0-9-]+$';

-- 3. Régénérer les slugs pour les propriétés qui ont des doublons après la mise à jour
WITH duplicate_slugs AS (
    SELECT slug, COUNT(*) as count
    FROM properties 
    WHERE slug IS NOT NULL AND slug != ''
    GROUP BY slug 
    HAVING COUNT(*) > 1
),
properties_to_update AS (
    SELECT p.id, p.slug, ROW_NUMBER() OVER (PARTITION BY p.slug ORDER BY p.created_at) as rn
    FROM properties p
    INNER JOIN duplicate_slugs ds ON p.slug = ds.slug
)
UPDATE properties 
SET slug = generate_unique_slug(
    generate_property_slug(
        (SELECT pt.name FROM property_types pt WHERE pt.id = properties.property_type_id),
        (SELECT c.name FROM cities c WHERE c.id = properties.city_id),
        properties.title,
        (SELECT r.name FROM regions r WHERE r.id = properties.region_id)
    )
)
FROM properties_to_update ptu
WHERE properties.id = ptu.id 
  AND ptu.rn > 1;

-- 4. Vérification finale - s'assurer qu'il n'y a plus de doublons
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT slug, COUNT(*) as count
        FROM properties 
        WHERE slug IS NOT NULL AND slug != ''
        GROUP BY slug 
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'ATTENTION: % slugs en doublon détectés après la migration', duplicate_count;
    ELSE
        RAISE NOTICE 'Migration terminée avec succès: aucun slug en doublon détecté';
    END IF;
END $$;

-- 5. Afficher un résumé des changements
DO $$
DECLARE
    total_properties INTEGER;
    properties_with_region INTEGER;
    properties_without_region INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_properties FROM properties WHERE slug IS NOT NULL AND slug != '';
    
    SELECT COUNT(*) INTO properties_with_region 
    FROM properties p
    JOIN regions r ON p.region_id = r.id
    WHERE p.slug IS NOT NULL AND p.slug != '' 
    AND LOWER(r.name) NOT IN ('autre', 'other') 
    AND TRIM(r.name) != '';
    
    properties_without_region := total_properties - properties_with_region;
    
    RAISE NOTICE 'Résumé de la migration des slugs:';
    RAISE NOTICE '- Total des propriétés: %', total_properties;
    RAISE NOTICE '- Propriétés avec région dans le slug: %', properties_with_region;
    RAISE NOTICE '- Propriétés sans région dans le slug: %', properties_without_region;
END $$;
