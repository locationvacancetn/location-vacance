/**
 * Service pour la gestion des modals personnalisables
 * Gère la création, modification, suppression et affichage des modals
 */

import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

// Types pour les modals basés sur les types Supabase
export type Modal = Tables<'modals'>;
export type ModalView = Tables<'modal_views'>;
export type CreateModalData = TablesInsert<'modals'>;

// Type pour les modals retournés par la fonction get_active_modals
export interface ActiveModal {
  id: string;
  title: string;
  content: string;
  trigger_type: string;
  target_type: string;
  target_roles: string[];
  has_image: boolean;
  has_button: boolean;
  image_url: string;
  button_text: string;
  button_action: string;
  button_style: string;
  created_at: string;
}


export type UpdateModalData = { id: string } & Partial<CreateModalData>;

class ModalService {
  /**
   * Vérifier si l'utilisateur actuel est admin
   */
  private async checkAdminAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du rôle:', error);
        return false;
      }

      return data?.role === 'admin';
    } catch (error) {
      console.error('Erreur lors de la vérification admin:', error);
      return false;
    }
  }

  /**
   * Créer un nouveau modal (admin uniquement)
   */
  async createModal(modalData: CreateModalData): Promise<{ data: Modal | null; error: string | null }> {
    try {
      // Vérifier les permissions admin
      const isAdmin = await this.checkAdminAccess();
      if (!isAdmin) {
        return { data: null, error: 'Accès refusé. Seuls les administrateurs peuvent créer des modals.' };
      }

      // Validation des données
      if (!modalData.title.trim()) {
        return { data: null, error: 'Le titre est obligatoire.' };
      }

      if (!modalData.content.trim()) {
        return { data: null, error: 'Le contenu est obligatoire.' };
      }

      if (modalData.target_type === 'authenticated' && (!modalData.target_roles || modalData.target_roles.length === 0)) {
        return { data: null, error: 'Veuillez sélectionner au moins un rôle pour les utilisateurs connectés.' };
      }

      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Utilisateur non authentifié.' };
      }

      // Insérer le modal
      const { data, error } = await supabase
        .from('modals')
        .insert([{
          ...modalData,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du modal:', error);
        return { data: null, error: 'Erreur lors de la création du modal.' };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur inattendue lors de la création:', error);
      return { data: null, error: 'Erreur inattendue lors de la création du modal.' };
    }
  }

  /**
   * Mettre à jour un modal existant (admin uniquement)
   */
  async updateModal(modalData: UpdateModalData): Promise<{ data: Modal | null; error: string | null }> {
    try {
      // Vérifier les permissions admin
      const isAdmin = await this.checkAdminAccess();
      if (!isAdmin) {
        return { data: null, error: 'Accès refusé. Seuls les administrateurs peuvent modifier des modals.' };
      }

      // Validation des données
      if (modalData.title && !modalData.title.trim()) {
        return { data: null, error: 'Le titre ne peut pas être vide.' };
      }

      if (modalData.content && !modalData.content.trim()) {
        return { data: null, error: 'Le contenu ne peut pas être vide.' };
      }

      if (modalData.target_type === 'authenticated' && modalData.target_roles && modalData.target_roles.length === 0) {
        return { data: null, error: 'Veuillez sélectionner au moins un rôle pour les utilisateurs connectés.' };
      }

      const { id, ...updateData } = modalData;

      // Mettre à jour le modal
      const { data, error } = await supabase
        .from('modals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du modal:', error);
        return { data: null, error: 'Erreur lors de la mise à jour du modal.' };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur inattendue lors de la mise à jour:', error);
      return { data: null, error: 'Erreur inattendue lors de la mise à jour du modal.' };
    }
  }

  /**
   * Supprimer un modal (admin uniquement)
   */
  async deleteModal(modalId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Vérifier les permissions admin
      const isAdmin = await this.checkAdminAccess();
      if (!isAdmin) {
        return { success: false, error: 'Accès refusé. Seuls les administrateurs peuvent supprimer des modals.' };
      }

      const { error } = await supabase
        .from('modals')
        .delete()
        .eq('id', modalId);

      if (error) {
        console.error('Erreur lors de la suppression du modal:', error);
        return { success: false, error: 'Erreur lors de la suppression du modal.' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur inattendue lors de la suppression:', error);
      return { success: false, error: 'Erreur inattendue lors de la suppression du modal.' };
    }
  }

  /**
   * Récupérer tous les modals (admin uniquement pour la gestion)
   */
  async getAllModals(): Promise<{ data: Modal[] | null; error: string | null }> {
    try {
      // Vérifier les permissions admin
      const isAdmin = await this.checkAdminAccess();
      if (!isAdmin) {
        return { data: null, error: 'Accès refusé. Seuls les administrateurs peuvent voir tous les modals.' };
      }

      const { data, error } = await supabase
        .from('modals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des modals:', error);
        return { data: null, error: 'Erreur lors du chargement des modals.' };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur inattendue lors du chargement:', error);
      return { data: null, error: 'Erreur inattendue lors du chargement des modals.' };
    }
  }

  /**
   * Récupérer un modal par ID (admin uniquement)
   */
  async getModalById(modalId: string): Promise<{ data: Modal | null; error: string | null }> {
    try {
      // Vérifier les permissions admin
      const isAdmin = await this.checkAdminAccess();
      if (!isAdmin) {
        return { data: null, error: 'Accès refusé. Seuls les administrateurs peuvent voir les détails des modals.' };
      }

      const { data, error } = await supabase
        .from('modals')
        .select('*')
        .eq('id', modalId)
        .single();

      if (error) {
        console.error('Erreur lors du chargement du modal:', error);
        return { data: null, error: 'Modal non trouvé.' };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur inattendue lors du chargement:', error);
      return { data: null, error: 'Erreur inattendue lors du chargement du modal.' };
    }
  }

  /**
   * Récupérer les modals actifs pour un utilisateur spécifique
   * Cette fonction est utilisée côté frontend pour afficher les modals
   */
  async getActiveModalsForUser(
    triggerType: 'site_entry' | 'dashboard_entry',
    userRole?: string
  ): Promise<{ data: ActiveModal[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Utiliser la fonction PostgreSQL pour récupérer les modals
      const { data, error } = await supabase.rpc('get_active_modals', {
        p_trigger_type: triggerType,
        p_user_role: userRole || null,
        p_user_id: user?.id || null
      });

      if (error) {
        console.error('Erreur lors du chargement des modals actifs:', error);
        return { data: null, error: 'Erreur lors du chargement des modals.' };
      }

      return { data: data as ActiveModal[], error: null };
    } catch (error) {
      console.error('Erreur inattendue lors du chargement des modals actifs:', error);
      return { data: null, error: 'Erreur inattendue lors du chargement des modals.' };
    }
  }

  /**
   * Enregistrer qu'un utilisateur a vu un modal
   */
  async recordModalView(
    modalId: string,
    triggerContext: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Utiliser la fonction PostgreSQL pour enregistrer la vue
      const { data, error } = await supabase.rpc('record_modal_view', {
        p_modal_id: modalId,
        p_trigger_context: triggerContext,
        p_user_agent: userAgent || null,
        p_ip_address: ipAddress || null
      });

      if (error) {
        console.error('Erreur lors de l\'enregistrement de la vue:', error);
        return { success: false, error: 'Erreur lors de l\'enregistrement de la vue.' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur inattendue lors de l\'enregistrement de la vue:', error);
      return { success: false, error: 'Erreur inattendue lors de l\'enregistrement de la vue.' };
    }
  }

  /**
   * Basculer le statut actif/inactif d'un modal (admin uniquement)
   */
  async toggleModalStatus(modalId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Utiliser la fonction PostgreSQL pour basculer le statut
      const { data, error } = await supabase.rpc('toggle_modal_status', {
        p_modal_id: modalId
      });

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        
        // Vérifier le type d'erreur
        if (error.message.includes('Accès refusé')) {
          return { success: false, error: 'Accès refusé. Seuls les administrateurs peuvent modifier le statut des modals.' };
        }
        
        if (error.message.includes('Modal non trouvé')) {
          return { success: false, error: 'Modal non trouvé.' };
        }
        
        return { success: false, error: 'Erreur lors de la mise à jour du statut.' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur inattendue lors du basculement du statut:', error);
      return { success: false, error: 'Erreur inattendue lors du basculement du statut.' };
    }
  }

  /**
   * Récupérer les modals actifs par trigger et rôle utilisateur
   * Fonction principale pour le système de modals globaux
   */
  async getActiveModalsByTrigger(
    trigger: 'site_entry' | 'dashboard_entry',
    userRole?: string
  ): Promise<{ data: ActiveModal[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.rpc('get_active_modals', {
        p_trigger_type: trigger,
        p_user_role: userRole || null,
        p_user_id: user?.id || null
      });

      if (error) {
        console.error('Erreur lors du chargement des modals actifs:', error);
        return { data: null, error: 'Erreur lors du chargement des modals.' };
      }

      return { data: data as ActiveModal[], error: null };
    } catch (error) {
      console.error('Erreur inattendue lors du chargement des modals actifs:', error);
      return { data: null, error: 'Erreur inattendue lors du chargement des modals.' };
    }
  }

  /**
   * Récupérer les modals par type de cible et rôles
   */
  async getModalsByTarget(
    targetType: 'anonymous' | 'authenticated',
    userRoles?: string[]
  ): Promise<{ data: Modal[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('modals')
        .select('*')
        .eq('target_type', targetType)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur lors du chargement des modals par cible:', error);
        return { data: null, error: 'Erreur lors du chargement des modals.' };
      }

      // Filtrer par rôles si spécifiés
      let filteredData = data;
      if (targetType === 'authenticated' && userRoles && userRoles.length > 0) {
        filteredData = data.filter(modal => 
          !modal.target_roles || 
          modal.target_roles.length === 0 || 
          modal.target_roles.some(role => userRoles.includes(role))
        );
      }

      return { data: filteredData, error: null };
    } catch (error) {
      console.error('Erreur inattendue lors du chargement des modals par cible:', error);
      return { data: null, error: 'Erreur inattendue lors du chargement des modals.' };
    }
  }

  /**
   * Récupérer les statistiques des vues pour un modal (admin uniquement)
   */
  async getModalViewStats(modalId: string): Promise<{ data: any | null; error: string | null }> {
    try {
      // Vérifier les permissions admin
      const isAdmin = await this.checkAdminAccess();
      if (!isAdmin) {
        return { data: null, error: 'Accès refusé. Seuls les administrateurs peuvent voir les statistiques.' };
      }

      const { data, error } = await supabase
        .from('modal_views')
        .select('*')
        .eq('modal_id', modalId)
        .order('viewed_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        return { data: null, error: 'Erreur lors du chargement des statistiques.' };
      }

      // Calculer quelques statistiques de base
      const stats = {
        total_views: data.length,
        unique_users: new Set(data.filter(v => v.user_id).map(v => v.user_id)).size,
        anonymous_views: data.filter(v => !v.user_id).length,
        recent_views: data.slice(0, 10), // 10 vues les plus récentes
        views_by_day: {} // TODO: Grouper par jour si nécessaire
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erreur inattendue lors du chargement des statistiques:', error);
      return { data: null, error: 'Erreur inattendue lors du chargement des statistiques.' };
    }
  }
}

// Instance singleton du service
export const modalService = new ModalService();

// Export par défaut
export default modalService;
