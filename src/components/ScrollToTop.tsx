import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Composant pour gérer le scroll automatique vers le haut lors des changements de route
 * Solution propre et robuste pour mobile et desktop
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Utilise requestAnimationFrame pour s'assurer que le DOM est prêt
    const scrollToTop = () => {
      // Méthode moderne et propre
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    };

    // Utilise requestAnimationFrame au lieu de setTimeout
    const rafId = requestAnimationFrame(scrollToTop);
    
    // Nettoyage
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
