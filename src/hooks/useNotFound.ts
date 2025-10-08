import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageTitle } from './usePageTitle';

interface UseNotFoundOptions {
  /** Titre personnalisé pour la page 404 */
  title?: string;
  /** Description personnalisée pour le SEO */
  description?: string;
  /** Section du dashboard (pour le contexte) */
  section?: string;
  /** Chemin tenté (pour le debugging) */
  attemptedPath?: string;
  /** Activer le tracking analytics */
  enableAnalytics?: boolean;
}

/**
 * Hook personnalisé pour la gestion des pages 404
 * Gère automatiquement les métadonnées, le SEO et le tracking
 */
export const useNotFound = ({
  title = 'Page non trouvée - 404',
  description = 'La page que vous recherchez n\'existe pas ou a été déplacée.',
  section,
  attemptedPath,
  enableAnalytics = true
}: UseNotFoundOptions = {}) => {
  const location = useLocation();

  // Gestion du titre de la page
  usePageTitle(title);

  useEffect(() => {
    // Log de l'erreur pour le debugging
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      section ? `(Section: ${section})` : '',
      attemptedPath ? `(Attempted: ${attemptedPath})` : ''
    );

    // Tracking analytics pour les erreurs 404
    if (enableAnalytics) {
      try {
        const analyticsData = {
          action: section ? 'dashboard_page_not_found' : 'page_not_found',
          category: 'error',
          label: `${section || 'main'}:${location.pathname}`,
          value: 1
        };

      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
    }

    // Mise à jour des métadonnées pour le SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Ajout d'une balise meta robots pour éviter l'indexation
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    // Ajout d'une balise meta pour le code de statut HTTP (pour les crawlers)
    let statusMeta = document.querySelector('meta[name="http-status"]');
    if (!statusMeta) {
      statusMeta = document.createElement('meta');
      statusMeta.setAttribute('name', 'http-status');
      document.head.appendChild(statusMeta);
    }
    statusMeta.setAttribute('content', '404');

  }, [location.pathname, title, description, section, attemptedPath, enableAnalytics]);

  return {
    currentPath: location.pathname,
    section,
    attemptedPath
  };
};
