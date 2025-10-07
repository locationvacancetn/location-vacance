-- Migration pour corriger les longueurs des champs de blog
-- Date: 2025-01-20
-- Description: Augmentation des limites de caractères pour les champs SEO et métadonnées

-- Augmenter la limite du meta_titre de 60 à 120 caractères
-- (60 caractères est trop restrictif pour un titre SEO efficace)
ALTER TABLE blogs ALTER COLUMN meta_titre TYPE VARCHAR(120);

-- Augmenter la limite de l'og_titre de 100 à 120 caractères
-- (pour être cohérent avec meta_titre)
ALTER TABLE blogs ALTER COLUMN og_titre TYPE VARCHAR(120);

-- Augmenter la limite du twitter_titre de 100 à 120 caractères
-- (pour être cohérent avec meta_titre)
ALTER TABLE blogs ALTER COLUMN twitter_titre TYPE VARCHAR(120);

-- Augmenter la limite de l'image_alt de 255 à 500 caractères
-- (pour permettre des descriptions d'images plus détaillées)
ALTER TABLE blogs ALTER COLUMN image_alt TYPE VARCHAR(500);

-- Augmenter la limite de l'image_legende de TEXT à VARCHAR(1000)
-- (pour permettre des légendes plus longues mais avec une limite raisonnable)
ALTER TABLE blogs ALTER COLUMN image_legende TYPE VARCHAR(1000);

-- Augmenter la limite de l'auteur de 100 à 200 caractères
-- (pour permettre des noms d'auteur plus longs ou des descriptions)
ALTER TABLE blogs ALTER COLUMN auteur TYPE VARCHAR(200);

-- Augmenter la limite du titre principal de 255 à 500 caractères
-- (pour permettre des titres d'articles plus longs)
ALTER TABLE blogs ALTER COLUMN titre TYPE VARCHAR(500);

-- Augmenter la limite du slug de 255 à 500 caractères
-- (pour être cohérent avec le titre)
ALTER TABLE blogs ALTER COLUMN slug TYPE VARCHAR(500);

-- Commentaires pour la documentation
COMMENT ON COLUMN blogs.meta_titre IS 'Titre optimisé pour les moteurs de recherche (max 120 caractères)';
COMMENT ON COLUMN blogs.og_titre IS 'Titre pour Open Graph (max 120 caractères)';
COMMENT ON COLUMN blogs.twitter_titre IS 'Titre pour Twitter Card (max 120 caractères)';
COMMENT ON COLUMN blogs.image_alt IS 'Texte alternatif pour l\'image principale (max 500 caractères)';
COMMENT ON COLUMN blogs.image_legende IS 'Légende de l\'image principale (max 1000 caractères)';
COMMENT ON COLUMN blogs.auteur IS 'Nom de l\'auteur ou description (max 200 caractères)';
COMMENT ON COLUMN blogs.titre IS 'Titre principal de l\'article (max 500 caractères)';
COMMENT ON COLUMN blogs.slug IS 'Slug URL de l\'article (max 500 caractères)';
