import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PropertyFormData } from "../AddPropertyWizard";
import { Upload, X, Image as ImageIcon, Camera, AlertCircle } from "lucide-react";

interface PhotosStepProps {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
}

const PhotosStep = ({ formData, updateFormData }: PhotosStepProps) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter(file => {
      return file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024; // 10MB max
    });

    if (formData.photos.length + newFiles.length > 20) {
      alert('Vous ne pouvez pas ajouter plus de 20 photos');
      return;
    }

    updateFormData({
      photos: [...formData.photos, ...newFiles]
    });
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
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData({ photos: newPhotos });
  };

  const setMainPhoto = (index: number) => {
    const newPhotos = [...formData.photos];
    const mainPhoto = newPhotos[index];
    newPhotos.splice(index, 1);
    newPhotos.unshift(mainPhoto);
    updateFormData({ photos: newPhotos });
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
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Camera className="h-6 w-6 text-muted-foreground" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-foreground">
              Glissez vos photos ici
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ou cliquez pour sélectionner des fichiers
            </p>
          </div>
          
          <Button
            type="button"
            onClick={openFileDialog}
            variant="outline"
            className="h-12 px-6"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choisir des photos
          </Button>
          
          <p className="text-xs text-muted-foreground">
            PNG, JPG, JPEG jusqu'à 10MB par image
          </p>
        </div>
      </div>

      {/* Compteur de photos */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {formData.photos.length} photo{formData.photos.length > 1 ? 's' : ''} sélectionnée{formData.photos.length > 1 ? 's' : ''}
        </span>
        <span className={`font-medium ${
          formData.photos.length >= 5 ? 'text-green-600' : 'text-orange-600'
        }`}>
          {formData.photos.length >= 5 ? '✓ Minimum atteint' : `${5 - formData.photos.length} photo${5 - formData.photos.length > 1 ? 's' : ''} requise${5 - formData.photos.length > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Grille des photos */}
      {formData.photos.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground">
            Aperçu des photos
          </Label>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={getImagePreview(photo)}
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
            ))}
          </div>
        </div>
      )}

      {/* Conseils pour les photos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ImageIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">
              Conseils pour de belles photos
            </h3>
            <ul className="text-sm text-blue-800 mt-1 space-y-1">
              <li>• Prenez des photos en pleine lumière</li>
              <li>• Montrez les espaces principaux (salon, chambres, cuisine)</li>
              <li>• Incluez des vues extérieures si possible</li>
              <li>• Évitez les photos floues ou mal éclairées</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PhotosStep;
