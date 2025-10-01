/**
 * Hook personnalisé pour la gestion des images de publicités
 * Centralise la logique de gestion d'image avec un état simplifié
 */

import { useState, useCallback } from 'react';
import { AdvertisementService } from '@/lib/advertisementService';
import { useToast } from '@/hooks/use-toast';

export interface AdvertisementImageState {
  file: File | null;
  url: string | null;
  isUploaded: boolean;
  isUploading: boolean;
}

export interface UseAdvertisementImageReturn {
  imageState: AdvertisementImageState;
  setImage: (file: File | null, url?: string | null) => void;
  uploadImage: (advertiserId: string) => Promise<string | null>;
  replaceImage: (advertisementId: string, advertiserId: string) => Promise<string | null>;
  removeImage: () => void;
  isSupabaseImage: (url: string | null) => boolean;
}

export const useAdvertisementImage = (initialImageUrl?: string | null): UseAdvertisementImageReturn => {
  const { toast } = useToast();
  
  const [imageState, setImageState] = useState<AdvertisementImageState>({
    file: null,
    url: initialImageUrl || null,
    isUploaded: !!initialImageUrl,
    isUploading: false
  });

  /**
   * Vérifier si une URL est une image Supabase
   */
  const isSupabaseImage = useCallback((url: string | null): boolean => {
    if (!url) return false;
    return url.includes('supabase.co/storage/v1/object/public/advertisement-images/');
  }, []);

  /**
   * Définir l'image (fichier et/ou URL)
   */
  const setImage = useCallback((file: File | null, url?: string | null) => {
    setImageState(prev => ({
      file,
      url: url !== undefined ? url : prev.url,
      isUploaded: !!url || !!file,
      isUploading: false
    }));
  }, []);

  /**
   * Uploader une nouvelle image (pour création)
   */
  const uploadImage = useCallback(async (advertiserId: string): Promise<string | null> => {
    if (!imageState.file) return null;

    setImageState(prev => ({ ...prev, isUploading: true }));

    try {
      const imageUrl = await AdvertisementService.uploadAdvertisementImage(advertiserId, imageState.file);
      
      setImageState(prev => ({
        ...prev,
        url: imageUrl,
        isUploaded: true,
        isUploading: false
      }));

      return imageUrl;
    } catch (error: any) {
      setImageState(prev => ({ ...prev, isUploading: false }));
      
      toast({
        title: "Erreur d'upload",
        description: error.message || "Erreur lors de l'upload de l'image",
        variant: "destructive"
      });
      
      throw error;
    }
  }, [imageState.file, toast]);

  /**
   * Remplacer l'image d'une publicité existante
   */
  const replaceImage = useCallback(async (advertisementId: string, advertiserId: string): Promise<string | null> => {
    if (!imageState.file) return null;

    setImageState(prev => ({ ...prev, isUploading: true }));

    try {
      const imageUrl = await AdvertisementService.replaceAdvertisementImage(
        advertisementId,
        imageState.file,
        advertiserId
      );
      
      setImageState(prev => ({
        ...prev,
        url: imageUrl,
        isUploaded: true,
        isUploading: false
      }));

      return imageUrl;
    } catch (error: any) {
      setImageState(prev => ({ ...prev, isUploading: false }));
      
      toast({
        title: "Erreur de remplacement",
        description: error.message || "Erreur lors du remplacement de l'image",
        variant: "destructive"
      });
      
      throw error;
    }
  }, [imageState.file, toast]);

  /**
   * Supprimer l'image
   */
  const removeImage = useCallback(() => {
    setImageState({
      file: null,
      url: null,
      isUploaded: false,
      isUploading: false
    });
  }, []);

  return {
    imageState,
    setImage,
    uploadImage,
    replaceImage,
    removeImage,
    isSupabaseImage
  };
};
