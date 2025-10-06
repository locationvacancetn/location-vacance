import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNotFound } from "@/hooks/useNotFound";

/**
 * Page 404 moderne avec design system et tracking analytics
 * Utilise le hook useNotFound pour une gestion centralisée
 */
const NotFound = () => {
  const navigate = useNavigate();

  // Utilisation du hook personnalisé pour la gestion 404
  const { currentPath } = useNotFound({
    title: 'Page non trouvée - 404',
    description: 'Page non trouvée. La page que vous recherchez n\'existe pas ou a été déplacée.',
    enableAnalytics: true
  });

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4" role="main" aria-labelledby="error-title">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Titre principal */}
        <div className="space-y-4">
          <h1 id="error-title" className="text-6xl md:text-8xl font-bold text-gray-800">
            Oups !
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">
            Nous ne trouvons pas la page que vous recherchez.
          </p>
        </div>

        {/* Code d'erreur */}
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Code d'erreur : 404
          </p>
        </div>

        {/* Bouton unique */}
        <div className="space-y-6">
          <Button 
            onClick={handleGoHome} 
            variant="outline"
            aria-label="Retourner à la page d'accueil"
          >
            <Home className="w-5 h-5 mr-3" aria-hidden="true" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
