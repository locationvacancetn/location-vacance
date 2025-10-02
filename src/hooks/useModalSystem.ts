/**
 * Hook pour le système de modals globaux
 * Gère l'affichage des modals selon les triggers et les rôles utilisateur
 */

import { useState, useEffect } from 'react';
import { modalService, type Modal } from '@/lib/modalService';

interface UseModalSystemOptions {
  trigger: 'site_entry' | 'dashboard_entry';
  userRole?: string;
}

interface UseModalSystemReturn {
  modal: Modal | null;
  isLoading: boolean;
  error: string | null;
  markAsViewed: () => void;
}

const STORAGE_KEY = 'modal_views';

/**
 * Récupérer les modals déjà vus depuis le localStorage
 */
const getViewedModals = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Erreur lors de la lecture du localStorage:', error);
    return {};
  }
};

/**
 * Enregistrer qu'un modal a été vu dans le localStorage
 */
const markModalAsViewed = (modalId: string): void => {
  try {
    const viewedModals = getViewedModals();
    viewedModals[modalId] = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(viewedModals));
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement dans le localStorage:', error);
  }
};

/**
 * Hook principal pour le système de modals
 */
export const useModalSystem = ({ trigger, userRole }: UseModalSystemOptions): UseModalSystemReturn => {
  const [modal, setModal] = useState<Modal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModal = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setModal(null); // Réinitialiser le modal à chaque changement

        // Attendre que le rôle soit déterminé (pas en cours de chargement)
        // Si on attend un rôle utilisateur mais qu'il n'est pas encore chargé, on attend
        if (userRole === undefined) {
          setIsLoading(false);
          return;
        }

        // Récupérer les modals actifs pour ce trigger
        const { data: modals, error: fetchError } = await modalService.getActiveModalsByTrigger(trigger, userRole);

        if (fetchError) {
          setError(fetchError);
          return;
        }

        if (!modals || modals.length === 0) {
          setModal(null);
          return;
        }

        // Récupérer les modals déjà vus
        const viewedModals = getViewedModals();

        // Trouver le premier modal non vu
        const unviewedModal = modals.find(m => !viewedModals[m.id]);

        if (unviewedModal) {
          setModal(unviewedModal);
        } else {
          setModal(null);
        }
      } catch (err) {
        console.error('Erreur lors du chargement du modal:', err);
        setError('Erreur lors du chargement du modal');
        setModal(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadModal();
  }, [trigger, userRole]);

  /**
   * Marquer le modal actuel comme vu
   */
  const markAsViewed = () => {
    if (modal) {
      markModalAsViewed(modal.id);
      setModal(null);
    }
  };

  return {
    modal,
    isLoading,
    error,
    markAsViewed
  };
};

export default useModalSystem;
