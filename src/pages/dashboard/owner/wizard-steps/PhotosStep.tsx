import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PropertyFormData } from "../AddPropertyWizard";
import { Upload, X, Image as ImageIcon, Camera, AlertCircle, Loader2 } from "lucide-react";
import { 
  compressImages, 
  validateImageFile, 
  CompressionProgress, 
  CompressionResult 
} from "@/utils/imageCompression";
import { showError, showWarning } from "@/lib/appToast";

interface PhotosStepProps {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
  existingImageUrls?: string[];
  isEditMode?: boolean;
  onTotalImagesChange?: (count: number) => void;
  displayedImages?: string[];
  setDisplayedImages?: (images: string[]) => void;
  isExistingImage?: boolean[];
  setIsExistingImage?: (flags: boolean[]) => void;
  onFinalImagesChange?: (images: string[]) => void;
}

const PhotosStep = ({ 
  formData, 
  updateFormData, 
  existingImageUrls = [], 
  isEditMode = false, 
  onTotalImagesChange,
  displayedImages: parentDisplayedImages,
  setDisplayedImages: parentSetDisplayedImages,
  isExistingImage: parentIsExistingImage,
  setIsExistingImage: parentSetIsExistingImage,
  onFinalImagesChange
}: PhotosStepProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null);
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([]);
  
  // Utiliser les états du parent ou des états locaux
  const displayedImages = parentDisplayedImages || [];
  const setDisplayedImages = parentSetDisplayedImages || (() => {});
  const isExistingImage = parentIsExistingImage || [];
  const setIsExistingImage = parentSetIsExistingImage || (() => {});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Plus besoin d'initialisation ici, c'est géré par le parent

  // Notifier le parent du changement du nombre total d'images
  useEffect(() => {
    if (onTotalImagesChange) {
      onTotalImagesChange(displayedImages.length);
    }
  }, [displayedImages.length, onTotalImagesChange]);

  // Calculer et notifier la liste finale des images (URLs finales)
  useEffect(() => {
    if (onFinalImagesChange) {
      // En mode édition, on doit distinguer les images existantes des nouvelles
      if (isEditMode) {
        const finalImages: string[] = [];
        
        displayedImages.forEach((imageUrl, index) => {
          if (isExistingImage[index]) {
            // Image existante : utiliser l'URL originale
            finalImages.push(imageUrl);
          } else {
            // Image nouvelle : c'est un blob URL, on ne peut pas l'utiliser directement
            // Les nouvelles images seront gérées via formData.photos
          }
        });
        
        onFinalImagesChange(finalImages);
      } else {
        // Mode création : pas d'images existantes
        onFinalImagesChange([]);
      }
    }
  }, [displayedImages, isExistingImage, isEditMode, onFinalImagesChange]);

  // Calculer le nombre total d'images (existantes + nouvelles)
  const totalImages = displayedImages.length;
  const newImagesCount = formData.photos.length;

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    // Valider les fichiers
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const validation = validateImageFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    // Afficher les erreurs s'il y en a
    if (errors.length > 0) {
      showError({
        title: "Erreurs de validation",
        description: errors.join(', ')
      });
    }

    if (validFiles.length === 0) return;

    // Vérifier la limite de 20 photos
    if (totalImages + validFiles.length > 20) {
      showWarning({
        title: "Limite atteinte",
        description: "Vous ne pouvez pas ajouter plus de 20 photos"
      });
      return;
    }

    // Démarrer la compression
    setIsCompressing(true);
    setCompressionProgress(null);

    try {
      const results = await compressImages(
        validFiles,
        {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          maxSizeKB: 500,
        },
        (progress) => {
          setCompressionProgress(progress);
        }
      );

      setCompressionResults(prev => [...prev, ...results]);
      
      // Mettre à jour les photos avec les fichiers compressés
      const compressedFiles = results.map(result => result.compressedFile);
      updateFormData({
        photos: [...formData.photos, ...compressedFiles]
      });

      // Ajouter les nouvelles images à l'affichage
      const newImageUrls = compressedFiles.map(file => URL.createObjectURL(file));
      setDisplayedImages([...displayedImages, ...newImageUrls]);
      setIsExistingImage([...isExistingImage, ...new Array(compressedFiles.length).fill(false)]);

    } catch (error) {
      console.error('Erreur lors de la compression:', error);
      showError({
        title: "Erreur de compression",
        description: "Erreur lors de la compression des images. Les images originales seront utilisées."
      });
      
      // En cas d'erreur, utiliser les fichiers originaux
      updateFormData({
        photos: [...formData.photos, ...validFiles]
      });
    } finally {
      setIsCompressing(false);
      setCompressionProgress(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removePhoto = (index: number) => {
    if (isExistingImage[index]) {
      // Supprimer une image existante
      const newDisplayedImages = displayedImages.filter((_, i) => i !== index);
      const newIsExisting = isExistingImage.filter((_, i) => i !== index);
      setDisplayedImages(newDisplayedImages);
      setIsExistingImage(newIsExisting);
    } else {
      // Supprimer une nouvelle image
      const newPhotoIndex = index - existingImageUrls.length;
      const newPhotos = formData.photos.filter((_, i) => i !== newPhotoIndex);
      const newResults = compressionResults.filter((_, i) => i !== newPhotoIndex);
      updateFormData({ photos: newPhotos });
      setCompressionResults(newResults);
      
      // Mettre à jour l'affichage
      const newDisplayedImages = displayedImages.filter((_, i) => i !== index);
      const newIsExisting = isExistingImage.filter((_, i) => i !== index);
      setDisplayedImages(newDisplayedImages);
      setIsExistingImage(newIsExisting);
    }
  };

  const setMainPhoto = (index: number) => {
    if (isExistingImage[index]) {
      // Définir une image existante comme principale
      const newDisplayedImages = [...displayedImages];
      const newIsExisting = [...isExistingImage];
      const mainImage = newDisplayedImages[index];
      const mainIsExisting = newIsExisting[index];
      
      // Retirer l'image de sa position actuelle
      newDisplayedImages.splice(index, 1);
      newIsExisting.splice(index, 1);
      
      // L'ajouter en première position
      newDisplayedImages.unshift(mainImage);
      newIsExisting.unshift(mainIsExisting);
      
      setDisplayedImages(newDisplayedImages);
      setIsExistingImage(newIsExisting);
    } else {
      // Définir une nouvelle image comme principale
      const newPhotoIndex = index - existingImageUrls.length;
      const newPhotos = [...formData.photos];
      const newResults = [...compressionResults];
      const mainPhoto = newPhotos[newPhotoIndex];
      const mainResult = newResults[newPhotoIndex];
      
      // Retirer la photo de sa position actuelle
      newPhotos.splice(newPhotoIndex, 1);
      newResults.splice(newPhotoIndex, 1);
      
      // L'ajouter en première position
      newPhotos.unshift(mainPhoto);
      newResults.unshift(mainResult);
      
      updateFormData({ photos: newPhotos });
      setCompressionResults(newResults);
      
      // Mettre à jour l'affichage
      const newDisplayedImages = [...displayedImages];
      const newIsExisting = [...isExistingImage];
      const mainImage = newDisplayedImages[index];
      const mainIsExisting = newIsExisting[index];
      
      newDisplayedImages.splice(index, 1);
      newIsExisting.splice(index, 1);
      
      newDisplayedImages.unshift(mainImage);
      newIsExisting.unshift(mainIsExisting);
      
      setDisplayedImages(newDisplayedImages);
      setIsExistingImage(newIsExisting);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getImagePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className="space-y-6">
        <div className="mb-6 scroll-target">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Photos de la propriété
            </h2>
          </div>
        <p className="text-sm text-muted-foreground">
          Ajoutez des photos attractives de votre propriété (5 minimum, 20 maximum)
        </p>
      </div>

      {/* Zone de téléchargement */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-border hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="space-y-3">
          <div className="mx-auto w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <Camera className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground">
              Glissez vos photos ici
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ou cliquez pour sélectionner des fichiers
            </p>
          </div>
          
          <Button
            type="button"
            onClick={openFileDialog}
            variant="outline"
            className="h-10 px-4"
            disabled={isCompressing}
          >
            {isCompressing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isCompressing ? 'Compression...' : 'Choisir des photos'}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            PNG, JPG, JPEG jusqu'à 5MB par image (compressées automatiquement)
          </p>
          

          {/* Alerte pour le nombre de photos */}
          {totalImages < 5 && !isCompressing && (
            <div className="mt-3 p-2 rounded-md bg-red-50/50 border border-red-200/50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500/70" />
                <span className="text-sm text-red-700/80">
                  {5 - totalImages} photo{5 - totalImages > 1 ? 's' : ''} requise{5 - totalImages > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Grille des photos */}
      {totalImages > 0 && (
        <div className="space-y-4">
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {displayedImages.map((imageUrl, index) => {
              const compressionResult = isExistingImage[index] ? null : compressionResults[index - existingImageUrls.length];
              return (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imageUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Bouton de suppression */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  {/* Indicateur image principale */}
                  {index === 0 && (
                    <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded text-[10px] font-medium">
                      Principale
                    </div>
                  )}
                  
                  {/* Bouton pour définir comme image principale */}
                  {index !== 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-1 left-1 h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setMainPhoto(index)}
                    >
                      Principale
                    </Button>
                  )}
                  
                </div>
              );
            })}
          </div>
        </div>
      )}


    </div>
  );
};

export default PhotosStep;
