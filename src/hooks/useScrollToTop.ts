import { useCallback } from 'react';

/**
 * Hook personnalisé pour gérer le scroll vers le haut
 * Solution propre et réutilisable
 */
export const useScrollToTop = () => {
  const scrollToTop = useCallback(() => {
    // Utilise requestAnimationFrame pour s'assurer que le DOM est prêt
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    });
  }, []);

  return scrollToTop;
};
