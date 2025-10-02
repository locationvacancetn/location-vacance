-- Migration pour créer le système de modals
-- Créé le : 2025-01-02
-- Description : Tables pour la gestion des modals personnalisables par les admins

-- Table principale des modals
CREATE TABLE IF NOT EXISTS modals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('site_entry', 'after_login', 'dashboard_entry')),
    target_type TEXT NOT NULL CHECK (target_type IN ('anonymous', 'authenticated')),
    target_roles TEXT[] DEFAULT NULL, -- Array des rôles ciblés (tenant, owner, advertiser)
    has_image BOOLEAN DEFAULT FALSE,
    image_url TEXT DEFAULT NULL,
    has_button BOOLEAN DEFAULT FALSE,
    button_text TEXT DEFAULT NULL,
    button_action TEXT DEFAULT NULL, -- URL ou action
    button_style TEXT DEFAULT 'primary' CHECK (button_style IN ('primary', 'secondary')),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Table pour tracker les vues des modals
CREATE TABLE IF NOT EXISTS modal_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    modal_id UUID REFERENCES modals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL pour les utilisateurs anonymes
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    trigger_context TEXT NOT NULL, -- Contexte du déclenchement
    user_agent TEXT DEFAULT NULL, -- Optionnel pour analytics
    ip_address INET DEFAULT NULL -- Optionnel pour analytics
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_modals_active_trigger ON modals(is_active, trigger_type, expires_at);
CREATE INDEX IF NOT EXISTS idx_modals_target ON modals(target_type, target_roles);
CREATE INDEX IF NOT EXISTS idx_modal_views_modal_user ON modal_views(modal_id, user_id);
CREATE INDEX IF NOT EXISTS idx_modal_views_viewed_at ON modal_views(viewed_at);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_modals_updated_at 
    BEFORE UPDATE ON modals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politiques RLS (Row Level Security)

-- Activer RLS sur les tables
ALTER TABLE modals ENABLE ROW LEVEL SECURITY;
ALTER TABLE modal_views ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table modals
-- Lecture : Tous les utilisateurs authentifiés peuvent lire les modals actifs
CREATE POLICY "Tous peuvent lire les modals actifs" ON modals
    FOR SELECT
    USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Insertion : Seuls les admins peuvent créer des modals
CREATE POLICY "Seuls les admins peuvent créer des modals" ON modals
    FOR INSERT
    WITH CHECK (is_admin());

-- Mise à jour : Seuls les admins peuvent modifier des modals
CREATE POLICY "Seuls les admins peuvent modifier des modals" ON modals
    FOR UPDATE
    USING (is_admin());

-- Suppression : Seuls les admins peuvent supprimer des modals
CREATE POLICY "Seuls les admins peuvent supprimer des modals" ON modals
    FOR DELETE
    USING (is_admin());

-- Politiques pour la table modal_views
-- Lecture : Les admins peuvent tout lire, les utilisateurs peuvent lire leurs propres vues
CREATE POLICY "Lecture des vues de modals" ON modal_views
    FOR SELECT
    USING (
        is_admin() OR 
        user_id = auth.uid()
    );

-- Insertion : Tous les utilisateurs authentifiés peuvent enregistrer leurs vues
CREATE POLICY "Enregistrement des vues de modals" ON modal_views
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() OR 
        user_id IS NULL -- Pour les utilisateurs anonymes
    );

-- Suppression : Seuls les admins peuvent supprimer des vues
CREATE POLICY "Seuls les admins peuvent supprimer des vues" ON modal_views
    FOR DELETE
    USING (is_admin());

-- Fonction utilitaire pour obtenir les modals actifs selon les critères
CREATE OR REPLACE FUNCTION get_active_modals(
    p_trigger_type TEXT,
    p_user_role TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    trigger_type TEXT,
    target_type TEXT,
    target_roles TEXT[],
    has_image BOOLEAN,
    image_url TEXT,
    has_button BOOLEAN,
    button_text TEXT,
    button_action TEXT,
    button_style TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.title,
        m.content,
        m.trigger_type,
        m.target_type,
        m.target_roles,
        m.has_image,
        m.image_url,
        m.has_button,
        m.button_text,
        m.button_action,
        m.button_style,
        m.created_at
    FROM modals m
    WHERE 
        m.is_active = true
        AND m.trigger_type = p_trigger_type
        AND (m.expires_at IS NULL OR m.expires_at > NOW())
        AND (
            -- Pour les utilisateurs anonymes
            (p_user_role IS NULL AND m.target_type = 'anonymous')
            OR
            -- Pour les utilisateurs authentifiés
            (p_user_role IS NOT NULL AND m.target_type = 'authenticated' AND (
                m.target_roles IS NULL OR 
                p_user_role = ANY(m.target_roles)
            ))
        )
        -- Exclure les modals déjà vus par cet utilisateur
        AND (
            p_user_id IS NULL OR
            NOT EXISTS (
                SELECT 1 FROM modal_views mv 
                WHERE mv.modal_id = m.id AND mv.user_id = p_user_id
            )
        )
    ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour enregistrer une vue de modal
CREATE OR REPLACE FUNCTION record_modal_view(
    p_modal_id UUID,
    p_trigger_context TEXT,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    view_id UUID;
BEGIN
    INSERT INTO modal_views (
        modal_id,
        user_id,
        trigger_context,
        user_agent,
        ip_address
    ) VALUES (
        p_modal_id,
        auth.uid(), -- Sera NULL pour les utilisateurs anonymes
        p_trigger_context,
        p_user_agent,
        p_ip_address
    ) RETURNING id INTO view_id;
    
    RETURN view_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires pour la documentation
COMMENT ON TABLE modals IS 'Table principale pour stocker les modals personnalisables créés par les admins';
COMMENT ON TABLE modal_views IS 'Table pour tracker les vues des modals par les utilisateurs';
COMMENT ON FUNCTION get_active_modals IS 'Fonction pour récupérer les modals actifs selon les critères utilisateur';
COMMENT ON FUNCTION record_modal_view IS 'Fonction pour enregistrer qu''un utilisateur a vu un modal';
COMMENT ON FUNCTION is_admin IS 'Fonction utilitaire pour vérifier si un utilisateur est admin';
