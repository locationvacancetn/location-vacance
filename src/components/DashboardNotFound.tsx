import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNotFound } from "@/hooks/useNotFound";

interface DashboardNotFoundProps {
  /** Section du dashboard où l'erreur s'est produite */
  section?: 'admin' | 'owner' | 'tenant' | 'advertiser';
  /** Message personnalisé pour l'erreur */
  customMessage?: string;
  /** URL tentée pour le debugging */
  attemptedPath?: string;
}

/**
 * Composant 404 réutilisable pour les pages du dashboard
 * Respecte le design system et inclut le tracking analytics
 */
export const DashboardNotFound = ({ 
  section, 
  customMessage, 
  attemptedPath 
}: DashboardNotFoundProps) => {
  const navigate = useNavigate();

  // Utilisation du hook personnalisé pour la gestion 404
  const { currentPath } = useNotFound({
    title: `Page non trouvée - Dashboard ${section ? section.charAt(0).toUpperCase() + section.slice(1) : ''}`,
    description: `Page non trouvée dans le dashboard ${section || ''}. Cette page n'existe pas ou a été déplacée.`,
    section,
    attemptedPath,
    enableAnalytics: true
  });

  const handleGoDashboard = () => {
    navigate('/dashboard');
  };

  const getSectionTitle = () => {
    switch (section) {
      case 'admin':
        return 'Administration';
      case 'owner':
        return 'Propriétaire';
      case 'tenant':
        return 'Locataire';
      case 'advertiser':
        return 'Annonceur';
      default:
        return 'Dashboard';
    }
  };

  const getDefaultMessage = () => {
    if (customMessage) return customMessage;
    
    switch (section) {
      case 'admin':
        return 'Cette page d\'administration n\'existe pas.';
      case 'owner':
        return 'Cette page propriétaire n\'existe pas.';
      case 'tenant':
        return 'Cette page locataire n\'existe pas.';
      case 'advertiser':
        return 'Cette page annonceur n\'existe pas.';
      default:
        return 'Cette page du dashboard n\'existe pas.';
    }
  };

  return (
    <div className="min-h-[60vh] bg-white flex items-center justify-center p-4" role="main" aria-labelledby="dashboard-error-title">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Titre principal */}
        <div className="space-y-4">
          <h1 id="dashboard-error-title" className="text-6xl md:text-8xl font-bold text-gray-800">
            Oups !
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">
            {getDefaultMessage()}
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
            onClick={handleGoDashboard} 
            variant="outline"
            aria-label="Retourner au tableau de bord"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" aria-hidden="true" />
            Retour au dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
