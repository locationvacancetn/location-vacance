import { useState, useEffect, useCallback } from 'react';
import { PropertyService } from '@/lib/propertyService';

export type TitleValidationStatus = 'idle' | 'checking' | 'available' | 'conflict' | 'error';

export interface TitleValidationResult {
  status: TitleValidationStatus;
  message: string;
  isValid: boolean;
}

export const useTitleValidation = (title: string, excludeId?: string, debounceMs: number = 500) => {
  const [result, setResult] = useState<TitleValidationResult>({
    status: 'idle',
    message: '',
    isValid: true
  });

  const validateTitle = useCallback(async (titleToValidate: string) => {
    if (!titleToValidate || titleToValidate.trim().length < 3) {
      setResult({
        status: 'idle',
        message: '',
        isValid: true
      });
      return;
    }

    setResult({
      status: 'checking',
      message: 'Vérification...',
      isValid: true
    });

    try {
      const isAvailable = await PropertyService.checkTitleAvailability(titleToValidate, excludeId);
      
      if (isAvailable) {
        setResult({
          status: 'available',
          message: 'Nom disponible',
          isValid: true
        });
      } else {
        setResult({
          status: 'conflict',
          message: 'Ce nom existe déjà',
          isValid: false
        });
      }
    } catch (error) {
      console.error('Erreur lors de la validation du titre:', error);
      setResult({
        status: 'error',
        message: 'Erreur de vérification',
        isValid: true // On considère comme valide pour ne pas bloquer l'utilisateur
      });
    }
  }, [excludeId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateTitle(title);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [title, validateTitle, debounceMs]);

  return result;
};
