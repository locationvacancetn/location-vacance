/**
 * Utilitaire de compression d'images côté client
 * Compresse les images avec les paramètres optimaux pour le wizard de propriété
 */

export interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxSizeKB: number;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

export interface CompressionProgress {
  current: number;
  total: number;
  currentFileName: string;
  isComplete: boolean;
}

// Configuration par défaut
const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85, // 85% de qualité
  maxSizeKB: 500, // 500KB maximum
};

/**
 * Compresse une image selon les paramètres définis
 */
export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<CompressionResult> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Impossible de créer le contexte canvas'));
      return;
    }
    
    img.onload = () => {
      try {
        // Calculer les nouvelles dimensions en gardant le ratio
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          config.maxWidth,
          config.maxHeight
        );
        
        // Configurer le canvas
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Compresser avec la qualité spécifiée
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Échec de la compression'));
              return;
            }
            
            // Vérifier si la taille est acceptable
            if (blob.size <= config.maxSizeKB * 1024) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              resolve({
                compressedFile,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: Math.round((1 - blob.size / file.size) * 100),
                width: newWidth,
                height: newHeight,
              });
            } else {
              // Si trop lourd, réduire la qualité progressivement
              compressWithReducedQuality(canvas, file, config, resolve, reject);
            }
          },
          'image/jpeg',
          config.quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Impossible de charger l\'image'));
    };
    
    // Charger l'image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compresse avec une qualité réduite si nécessaire
 */
function compressWithReducedQuality(
  canvas: HTMLCanvasElement,
  file: File,
  config: CompressionOptions,
  resolve: (result: CompressionResult) => void,
  reject: (error: Error) => void
) {
  const qualities = [0.8, 0.75, 0.7, 0.65, 0.6];
  let currentQualityIndex = 0;
  
  const tryCompress = () => {
    if (currentQualityIndex >= qualities.length) {
      reject(new Error('Impossible de compresser l\'image suffisamment'));
      return;
    }
    
    const quality = qualities[currentQualityIndex];
    
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Échec de la compression'));
          return;
        }
        
        if (blob.size <= config.maxSizeKB * 1024) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          resolve({
            compressedFile,
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio: Math.round((1 - blob.size / file.size) * 100),
            width: canvas.width,
            height: canvas.height,
          });
        } else {
          currentQualityIndex++;
          tryCompress();
        }
      },
      'image/jpeg',
      quality
    );
  };
  
  tryCompress();
}

/**
 * Calcule les nouvelles dimensions en gardant le ratio d'aspect
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  
  // Si l'image est déjà plus petite, ne pas l'agrandir
  if (ratio >= 1) {
    return { width: originalWidth, height: originalHeight };
  }
  
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}

/**
 * Compresse plusieurs images en séquence avec feedback de progression
 */
export async function compressImages(
  files: File[],
  options: Partial<CompressionOptions> = {},
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  const total = files.length;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Notifier le progrès
    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        currentFileName: file.name,
        isComplete: false,
      });
    }
    
    try {
      const result = await compressImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Erreur lors de la compression de ${file.name}:`, error);
      // En cas d'erreur, garder le fichier original
      results.push({
        compressedFile: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        width: 0,
        height: 0,
      });
    }
  }
  
  // Notifier la fin
  if (onProgress) {
    onProgress({
      current: total,
      total,
      currentFileName: '',
      isComplete: true,
    });
  }
  
  return results;
}

/**
 * Valide qu'un fichier est une image valide
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Vérifier le type MIME
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Le fichier doit être une image' };
  }
  
  // Vérifier la taille (10MB max avant compression)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'L\'image ne doit pas dépasser 10MB' };
  }
  
  // Vérifier les formats supportés
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return { isValid: false, error: 'Format non supporté. Utilisez JPEG, PNG ou WebP' };
  }
  
  return { isValid: true };
}

/**
 * Formate la taille d'un fichier en unités lisibles
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
