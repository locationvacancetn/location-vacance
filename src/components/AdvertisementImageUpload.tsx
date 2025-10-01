/**
 * Composant d'upload d'image pour les publicités
 * Permet l'upload d'une seule image avec compression et validation
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle, 
  Loader2,
  Check,
  Lightbulb
} from "lucide-react";
import { 
  compressImage, 
  validateImageFile, 
  CompressionResult, 
  formatFileSize 
} from "@/utils/imageCompression";
import { showError, showWarning } from "@/lib/appToast";

interface AdvertisementImageUploadProps {
  onImageChange: (file: File | null, imageUrl: string | null) => void;
  initialImageUrl?: string;
  disabled?: boolean;
}

const AdvertisementImageUpload = ({ 
  onImageChange, 
  initialImageUrl = null,
  disabled = false 
}: AdvertisementImageUploadProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<number | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonction pour détecter si l'URL est une image Supabase
  const isSupabaseImage = (url: string | null): boolean => {
    if (!url) return false;
    return url.includes('supabase.co/storage/v1/object/public/advertisement-images/');
  };

  // Initialiser l'URL de prévisualisation seulement si ce n'est pas une image Supabase
  useEffect(() => {
    if (initialImageUrl && !isSupabaseImage(initialImageUrl)) {
      setPreviewUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; // Une seule image pour les publicités

    // Valider le fichier
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      showError({
        title: "Fichier invalide",
        description: validation.error || "Le fichier n'est pas valide"
      });
      return;
    }

    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      // Compresser l'image avec des paramètres optimisés pour les publicités
      const result = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.9,
        maxSizeKB: 300, // 300KB max pour les publicités
      });

      setCompressionResult(result);
      setUploadedFile(result.compressedFile);
      
      // Créer l'URL de prévisualisation
      const preview = URL.createObjectURL(result.compressedFile);
      setPreviewUrl(preview);
      
      // Notifier le composant parent
      onImageChange(result.compressedFile, preview);

      // Afficher les informations de compression
      const compressionRatio = Math.round((1 - result.compressedSize / result.originalSize) * 100);
      if (compressionRatio > 0) {
        showWarning({
          title: "Image compressée",
          description: `L'image a été compressée de ${compressionRatio}% pour optimiser l'affichage`
        });
      }

    } catch (error) {
      console.error('Erreur lors de la compression:', error);
      showError({
        title: "Erreur de compression",
        description: "Erreur lors de la compression de l'image. Le fichier original sera utilisé."
      });
      
      // En cas d'erreur, utiliser le fichier original
      setUploadedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      onImageChange(file, preview);
    } finally {
      setIsCompressing(false);
      setCompressionProgress(null);
    }
  };


  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeImage = () => {
    // Nettoyer les URLs d'objets
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(null);
    setUploadedFile(null);
    setCompressionResult(null);
    
    // Toujours passer null au parent pour indiquer qu'on veut supprimer l'image
    // Que ce soit une image uploadée ou une image Supabase
    onImageChange(null, null);
    
    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
      
      {isCompressing ? (
        <div className="space-y-3 text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Compression en cours...</p>
            {compressionProgress !== null && (
              <Progress value={compressionProgress} className="w-full max-w-xs mx-auto" />
            )}
          </div>
        </div>
      ) : (previewUrl || (initialImageUrl && isSupabaseImage(initialImageUrl))) ? (
        <div className="space-y-3">
          <div className="relative w-full">
            <img
              src={previewUrl || initialImageUrl || ''}
              alt="Aperçu de l'image"
              className="w-full h-40 object-cover rounded-lg"
            />
            {!disabled && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeImage}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={!disabled ? openFileDialog : undefined}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-muted/50">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">
                Cliquez pour sélectionner une image
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP jusqu'à 5MB
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Conseils */}
      <div className="bg-muted/50 p-3 rounded-lg">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-muted-foreground">
          <Lightbulb className="w-4 h-4" style={{color: 'rgb(234 179 8)'}} />
          Conseils pour une image efficace :
        </h4>
        <div className="text-xs space-y-1">
          <div className="flex items-start gap-2">
            <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-muted-foreground">Représentative :</span>
              <span className="text-muted-foreground"> Utilisez une image symbolisant votre travail ou service</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-muted-foreground">Sans texte :</span>
              <span className="text-muted-foreground"> Évitez le texte sur l'image, il sera ajouté automatiquement</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-muted-foreground">Haute qualité :</span>
              <span className="text-muted-foreground"> Privilégiez une image nette et professionnelle</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-muted-foreground">Optimisée :</span>
              <span className="text-muted-foreground"> L'image sera automatiquement compressée pour le web</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementImageUpload;
