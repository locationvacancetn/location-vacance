import { useState, useCallback, useEffect } from 'react';
import { PropertyService } from '@/lib/propertyService';
import { SlugService } from '@/lib/slugService';

export type SlugValidationStatus = 'idle' | 'checking' | 'available' | 'conflict' | 'error' | 'invalid';

export interface SlugValidationResult {
  status: SlugValidationStatus;
  message: string;
  isValid: boolean;
  suggestions?: string[];
}

/**
 * Hook pour la validation des slugs en temps réel
 */
export const useSlugValidation = (
  slug: string, 
  excludeId?: string, 
  debounceMs: number = 500
) => {
  const [result, setResult] = useState<SlugValidationResult>({
    status: 'idle',
    message: '',
    isValid: true
  });

  const validateSlug = useCallback(async (slugToValidate: string) => {
    if (!slugToValidate || slugToValidate.trim().length < 3) {
      setResult({
        status: 'idle',
        message: '',
        isValid: true
      });
      return;
    }

    // Validation locale d'abord
    const localValidation = SlugService.validateSlug(slugToValidate);
    if (!localValidation.isValid) {
      setResult({
        status: 'invalid',
        message: localValidation.errors.join(', '),
        isValid: false
      });
      return;
    }

    setResult({
      status: 'checking',
      message: 'Vérification...',
      isValid: true
    });

    try {
      const isAvailable = await PropertyService.checkSlugAvailability(slugToValidate, excludeId);
      
      if (isAvailable) {
        setResult({
          status: 'available',
          message: 'Slug disponible',
          isValid: true
        });
      } else {
        setResult({
          status: 'conflict',
          message: 'Ce slug existe déjà',
          isValid: false
        });
      }
    } catch (error) {
      console.error('Erreur lors de la validation du slug:', error);
      setResult({
        status: 'error',
        message: 'Erreur de vérification',
        isValid: true // On considère comme valide pour ne pas bloquer l'utilisateur
      });
    }
  }, [excludeId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateSlug(slug);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [slug, validateSlug, debounceMs]);

  return result;
};

/**
 * Hook pour la génération de slugs avec suggestions
 */
export const useSlugGeneration = (
  propertyType: string,
  city: string,
  title: string,
  region?: string | null
) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = useCallback(async () => {
    if (!propertyType || !city || !title) {
      setSuggestions([]);
      return;
    }

    setIsGenerating(true);
    try {
      const generatedSuggestions = await PropertyService.generateSlugSuggestions(
        propertyType,
        city,
        title,
        region,
        5
      );
      setSuggestions(generatedSuggestions);
    } catch (error) {
      console.error('Erreur lors de la génération des suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsGenerating(false);
    }
  }, [propertyType, city, title, region]);

  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  return {
    suggestions,
    isGenerating,
    regenerate: generateSuggestions
  };
};

/**
 * Hook pour la gestion complète des slugs de propriétés
 */
export const usePropertySlug = (
  propertyType: string,
  city: string,
  title: string,
  excludeId?: string
) => {
  const [currentSlug, setCurrentSlug] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Générer le slug automatiquement quand les données changent
  useEffect(() => {
    if (propertyType && city && title) {
      setIsGenerating(true);
      PropertyService.generateUniquePropertySlug(propertyType, city, title, region, excludeId)
        .then(setCurrentSlug)
        .catch(error => {
          console.error('Erreur lors de la génération du slug:', error);
          // Fallback: générer un slug simple
          setCurrentSlug(SlugService.generatePropertySlug(propertyType, city, title, region));
        })
        .finally(() => setIsGenerating(false));
    }
  }, [propertyType, city, title, region, excludeId]);

  const validation = useSlugValidation(currentSlug, excludeId);
  const { suggestions, isGenerating: isGeneratingSuggestions } = useSlugGeneration(
    propertyType,
    city,
    title,
    region
  );

  const updateSlug = useCallback((newSlug: string) => {
    setCurrentSlug(newSlug);
  }, []);

  const regenerateSlug = useCallback(async () => {
    if (!propertyType || !city || !title) return;
    
    setIsGenerating(true);
    try {
      const newSlug = await PropertyService.generateUniquePropertySlug(
        propertyType,
        city,
        title,
        region,
        excludeId
      );
      setCurrentSlug(newSlug);
    } catch (error) {
      console.error('Erreur lors de la régénération du slug:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [propertyType, city, title, excludeId]);

  return {
    slug: currentSlug,
    validation,
    suggestions,
    isGenerating: isGenerating || isGeneratingSuggestions,
    updateSlug,
    regenerateSlug
  };
};
