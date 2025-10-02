/**
 * Composant d'affichage des modals globaux
 * Affiche un modal unique avec design identique à l'aperçu admin
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { type Modal } from "@/lib/modalService";

interface ModalDisplayProps {
  modal: Modal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ModalDisplay = ({ modal, isOpen, onClose }: ModalDisplayProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!modal) return null;

  /**
   * Gérer l'action du bouton personnalisé
   */
  const handleButtonAction = () => {
    if (modal.button_action) {
      // Si c'est une URL, l'ouvrir dans un nouvel onglet
      if (modal.button_action.startsWith('http://') || modal.button_action.startsWith('https://')) {
        window.open(modal.button_action, '_blank');
      } 
      // Si c'est un chemin interne, naviguer
      else if (modal.button_action.startsWith('/')) {
        navigate(modal.button_action);
        onClose();
      }
      // Sinon, afficher un toast avec l'action
      else {
        toast({
          title: "Action du bouton",
          description: `Action configurée: ${modal.button_action}`,
        });
      }
    } else {
      toast({
        title: "Aucune action",
        description: "Ce bouton n'a pas d'action configurée",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        <div className="relative">
          {/* Image si présente */}
          {modal.has_image && modal.image_url && (
            <div className="w-full">
              <img 
                src={modal.image_url} 
                alt={modal.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            </div>
          )}
          
          {/* Contenu du modal */}
          <div className="p-6 text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {modal.title}
            </h2>
            
            <p className="text-gray-600 leading-relaxed">
              {modal.content}
            </p>
            
            {/* Boutons */}
            <div className="flex flex-col gap-3 pt-4">
              {modal.has_button && modal.button_text ? (
                // Si il y a un bouton personnalisé, on l'affiche uniquement
                <Button 
                  variant={modal.button_style === 'secondary' ? 'outline' : 'default'}
                  className="w-full"
                  onClick={handleButtonAction}
                >
                  {modal.button_text}
                </Button>
              ) : (
                // Si il n'y a pas de bouton personnalisé, on affiche le bouton "Fermer"
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="w-full hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]"
                >
                  Fermer
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDisplay;
