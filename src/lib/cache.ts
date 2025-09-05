/**
 * Système de cache simple pour optimiser les performances
 * Utilise localStorage pour la persistance et Map pour la mémoire
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private readonly STORAGE_PREFIX = 'app_cache_';
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    // Vérifier d'abord le cache mémoire
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data;
    }

    // Vérifier le localStorage
    try {
      const stored = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (stored) {
        const item: CacheItem<T> = JSON.parse(stored);
        if (this.isValid(item)) {
          // Remettre en cache mémoire
          this.memoryCache.set(key, item);
          return item.data;
        } else {
          // Supprimer l'item expiré
          this.remove(key);
        }
      }
    } catch (error) {
      console.warn('Failed to parse cached item:', error);
    }

    return null;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Stocker en mémoire
    this.memoryCache.set(key, item);

    // Stocker en localStorage
    try {
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to store item in localStorage:', error);
    }
  }

  /**
   * Supprime une valeur du cache
   */
  remove(key: string): void {
    this.memoryCache.delete(key);
    localStorage.removeItem(this.STORAGE_PREFIX + key);
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.memoryCache.clear();
    
    // Nettoyer localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Vérifie si un item est encore valide
   */
  private isValid(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  /**
   * Nettoie les items expirés
   */
  cleanup(): void {
    const now = Date.now();
    
    // Nettoyer le cache mémoire
    for (const [key, item] of this.memoryCache.entries()) {
      if (!this.isValid(item)) {
        this.memoryCache.delete(key);
      }
    }

    // Nettoyer localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        try {
          const item: CacheItem<any> = JSON.parse(localStorage.getItem(key) || '{}');
          if (!this.isValid(item)) {
            localStorage.removeItem(key);
          }
        } catch {
          // Supprimer les items corrompus
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Obtient les statistiques du cache
   */
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      memoryKeys: Array.from(this.memoryCache.keys()),
    };
  }
}

// Instance singleton
export const cache = new CacheManager();

// Nettoyage automatique toutes les 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

// Hook React pour utiliser le cache
export const useCache = () => {
  const get = <T>(key: string): T | null => cache.get<T>(key);
  const set = <T>(key: string, data: T, ttl?: number): void => cache.set(key, data, ttl);
  const remove = (key: string): void => cache.remove(key);
  const clear = (): void => cache.clear();

  return { get, set, remove, clear };
};
