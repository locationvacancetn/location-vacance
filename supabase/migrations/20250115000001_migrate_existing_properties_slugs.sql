-- Migration pour générer les slugs des propriétés existantes
-- Cette migration doit être exécutée après la création du système de slugs

-- 1. Générer les slugs pour toutes les propriétés existantes qui n'en ont pas
UPDATE properties 
SET slug = generate_unique_slug(
    generate_property_slug(
        (SELECT pt.name FROM property_types pt WHERE pt.id = properties.property_type_id),
        (SELECT c.name FROM cities c WHERE c.id = properties.city_id),
        properties.title
    )
)
WHERE slug IS NULL OR slug = '';

-- 2. Nettoyer les slugs existants qui pourraient être malformés
UPDATE properties 
SET slug = generate_slug(slug)
WHERE slug IS NOT NULL 
  AND slug != ''
  AND slug !~ '^[a-z0-9-]+$';

-- 3. Régénérer les slugs pour les propriétés qui ont des doublons
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
        properties.title
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
        RAISE WARNING 'Il reste % slugs en doublon après la migration', duplicate_count;
    ELSE
        RAISE NOTICE 'Migration des slugs terminée avec succès - aucun doublon détecté';
    END IF;
END $$;

-- 5. Statistiques de la migration
DO $$
DECLARE
    total_properties INTEGER;
    properties_with_slugs INTEGER;
    properties_without_slugs INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_properties FROM properties;
    SELECT COUNT(*) INTO properties_with_slugs FROM properties WHERE slug IS NOT NULL AND slug != '';
    properties_without_slugs := total_properties - properties_with_slugs;
    
    RAISE NOTICE 'Statistiques de la migration des slugs:';
    RAISE NOTICE '- Total des propriétés: %', total_properties;
    RAISE NOTICE '- Propriétés avec slugs: %', properties_with_slugs;
    RAISE NOTICE '- Propriétés sans slugs: %', properties_without_slugs;
END $$;
