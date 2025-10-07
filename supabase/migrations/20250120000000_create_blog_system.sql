-- Migration pour créer le système de blog complet
-- Date: 2025-01-20
-- Description: Création des tables pour le système de blog avec SEO optimisé

-- Extension pour les UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des catégories de blog
CREATE TABLE IF NOT EXISTS blog_categories (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des tags de blog
CREATE TABLE IF NOT EXISTS blog_tags (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table principale des blogs
CREATE TABLE IF NOT EXISTS blogs (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    extrait TEXT,
    contenu TEXT NOT NULL,
    category_id INTEGER REFERENCES blog_categories(id) ON DELETE SET NULL,
    temps_lecture INTEGER DEFAULT 5,
    auteur VARCHAR(100),
    image_principale TEXT,
    image_alt VARCHAR(255),
    image_legende TEXT,
    
    -- Métadonnées SEO
    meta_titre VARCHAR(60),
    meta_description VARCHAR(160),
    mots_cles TEXT,
    url_canonique TEXT,
    
    -- Métadonnées réseaux sociaux
    og_titre VARCHAR(100),
    og_description VARCHAR(200),
    og_image TEXT,
    twitter_titre VARCHAR(100),
    twitter_description VARCHAR(200),
    twitter_image TEXT,
    
    -- Statut et dates
    est_publie BOOLEAN DEFAULT FALSE,
    est_feature BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_mise_a_jour TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_publication TIMESTAMP WITH TIME ZONE,
    
    -- Liens internes suggérés (JSON)
    liens_internes JSONB
);

-- Table des FAQs pour les blogs
CREATE TABLE IF NOT EXISTS blog_faqs (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    reponse TEXT NOT NULL,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des images supplémentaires pour les blogs
CREATE TABLE IF NOT EXISTS blog_images (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    legende TEXT,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de relation entre blogs et tags (many-to-many)
CREATE TABLE IF NOT EXISTS blog_tags_relation (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(blog_id, tag_id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(est_publie, date_publication);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(est_feature, est_publie);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_faqs_blog_id ON blog_faqs(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_images_blog_id ON blog_images(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_tags_relation_blog_id ON blog_tags_relation(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_tags_relation_tag_id ON blog_tags_relation(tag_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_faqs_updated_at BEFORE UPDATE ON blog_faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_images_updated_at BEFORE UPDATE ON blog_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer automatiquement un slug à partir du titre
CREATE OR REPLACE FUNCTION generate_blog_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
    counter INTEGER := 0;
    base_slug TEXT;
BEGIN
    -- Nettoyer le titre pour créer un slug
    base_slug := lower(trim(title));
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(base_slug, '-');
    
    slug := base_slug;
    
    -- Vérifier l'unicité et ajouter un numéro si nécessaire
    WHILE EXISTS (SELECT 1 FROM blogs WHERE blogs.slug = slug) LOOP
        counter := counter + 1;
        slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques des blogs
CREATE OR REPLACE FUNCTION get_blog_stats()
RETURNS TABLE (
    total BIGINT,
    published BIGINT,
    featured BIGINT,
    draft BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE est_publie = true) as published,
        COUNT(*) FILTER (WHERE est_feature = true AND est_publie = true) as featured,
        COUNT(*) FILTER (WHERE est_publie = false) as draft
    FROM blogs;
END;
$$ LANGUAGE plpgsql;

-- Insérer quelques catégories par défaut
INSERT INTO blog_categories (nom, slug, description) VALUES
('Conseils Voyage', 'conseils-voyage', 'Conseils et astuces pour bien voyager'),
('Destinations', 'destinations', 'Présentation des meilleures destinations'),
('Actualités', 'actualites', 'Actualités du tourisme et des voyages'),
('Guides Pratiques', 'guides-pratiques', 'Guides détaillés pour vos voyages')
ON CONFLICT (slug) DO NOTHING;

-- Insérer quelques tags par défaut
INSERT INTO blog_tags (nom, slug) VALUES
('Tunisie', 'tunisie'),
('Plage', 'plage'),
('Vacances', 'vacances'),
('Hébergement', 'hebergement'),
('Tourisme', 'tourisme'),
('Conseils', 'conseils'),
('Guide', 'guide'),
('Actualités', 'actualites')
ON CONFLICT (slug) DO NOTHING;

-- Politiques RLS (Row Level Security)
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags_relation ENABLE ROW LEVEL SECURITY;

-- Politique pour les blogs : lecture publique pour les blogs publiés
CREATE POLICY "Blogs publics sont visibles par tous" ON blogs
    FOR SELECT USING (est_publie = true);

-- Politique pour les blogs : admins peuvent tout faire
CREATE POLICY "Admins peuvent gérer tous les blogs" ON blogs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour les catégories : lecture publique
CREATE POLICY "Catégories visibles par tous" ON blog_categories
    FOR SELECT USING (true);

-- Politique pour les catégories : admins peuvent tout faire
CREATE POLICY "Admins peuvent gérer les catégories" ON blog_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour les tags : lecture publique
CREATE POLICY "Tags visibles par tous" ON blog_tags
    FOR SELECT USING (true);

-- Politique pour les tags : admins peuvent tout faire
CREATE POLICY "Admins peuvent gérer les tags" ON blog_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour les FAQs : lecture publique si le blog est publié
CREATE POLICY "FAQs publiques visibles par tous" ON blog_faqs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM blogs 
            WHERE blogs.id = blog_faqs.blog_id 
            AND blogs.est_publie = true
        )
    );

-- Politique pour les FAQs : admins peuvent tout faire
CREATE POLICY "Admins peuvent gérer les FAQs" ON blog_faqs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour les images : lecture publique si le blog est publié
CREATE POLICY "Images publiques visibles par tous" ON blog_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM blogs 
            WHERE blogs.id = blog_images.blog_id 
            AND blogs.est_publie = true
        )
    );

-- Politique pour les images : admins peuvent tout faire
CREATE POLICY "Admins peuvent gérer les images" ON blog_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour les relations tags : lecture publique
CREATE POLICY "Relations tags visibles par tous" ON blog_tags_relation
    FOR SELECT USING (true);

-- Politique pour les relations tags : admins peuvent tout faire
CREATE POLICY "Admins peuvent gérer les relations tags" ON blog_tags_relation
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Commentaires pour la documentation
COMMENT ON TABLE blogs IS 'Table principale des articles de blog avec optimisations SEO';
COMMENT ON TABLE blog_categories IS 'Catégories pour organiser les articles de blog';
COMMENT ON TABLE blog_tags IS 'Tags pour étiqueter les articles de blog';
COMMENT ON TABLE blog_faqs IS 'Questions fréquemment posées associées aux articles';
COMMENT ON TABLE blog_images IS 'Images supplémentaires pour les articles de blog';
COMMENT ON TABLE blog_tags_relation IS 'Relation many-to-many entre blogs et tags';

COMMENT ON COLUMN blogs.meta_titre IS 'Titre optimisé pour les moteurs de recherche (max 60 caractères)';
COMMENT ON COLUMN blogs.meta_description IS 'Description optimisée pour les moteurs de recherche (max 160 caractères)';
COMMENT ON COLUMN blogs.mots_cles IS 'Mots-clés principaux séparés par des virgules';
COMMENT ON COLUMN blogs.liens_internes IS 'Liens internes suggérés au format JSON';
COMMENT ON COLUMN blogs.est_feature IS 'Article mis en avant sur la page d\'accueil du blog';
