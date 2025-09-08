-- Création de la table property_types
CREATE TABLE IF NOT EXISTS property_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Peut contenir un nom d'icône Lucide, un SVG complet, ou une URL d'image
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_property_types_slug ON property_types(slug);
CREATE INDEX IF NOT EXISTS idx_property_types_is_active ON property_types(is_active);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_property_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_types_updated_at
  BEFORE UPDATE ON property_types
  FOR EACH ROW
  EXECUTE FUNCTION update_property_types_updated_at();

-- Insertion des types de propriétés par défaut
INSERT INTO property_types (name, slug, description, icon, is_active) VALUES
  ('Villa', 'villa', 'Villa individuelle avec jardin privé', 'home', true),
  ('Appartement', 'appartement', 'Appartement en immeuble', 'building', true),
  ('Villa avec piscine', 'villa-avec-piscine', 'Villa avec piscine privée', 'waves', true),
  ('Chalet', 'chalet', 'Chalet de montagne ou de campagne', 'mountain', true),
  ('Maison d\'hôte', 'maison-hote', 'Maison d\'hôte ou gîte', 'bed', true),
  ('Château', 'chateau', 'Château historique ou manoir', 'crown', true),
  ('Maison de campagne', 'maison-campagne', 'Maison rurale ou de campagne', 'tree-pine', true)
ON CONFLICT (slug) DO NOTHING;

-- RLS (Row Level Security) - Seuls les admins peuvent gérer les types de propriétés
ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les types de propriétés" ON property_types
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre la gestion complète aux admins uniquement
CREATE POLICY "Seuls les admins peuvent gérer les types de propriétés" ON property_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
