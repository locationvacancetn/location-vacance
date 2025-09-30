/**
 * Service professionnel pour la génération et gestion des slugs
 * Suit les meilleures pratiques SEO et de normalisation
 */

export interface SlugGenerationOptions {
  maxLength?: number;
  preserveCase?: boolean;
  separator?: string;
  removeStopWords?: boolean;
}

export interface SlugValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Service pour la génération et validation des slugs
 */
export class SlugService {
  // Mots vides à supprimer (optionnel)
  private static readonly STOP_WORDS = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd', 'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
  ]);

  // Caractères spéciaux et leurs équivalents
  private static readonly CHAR_MAP: Record<string, string> = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
    'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
    'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'œ': 'oe',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
    'ý': 'y', 'ÿ': 'y',
    'ñ': 'n', 'ç': 'c',
    'ß': 'ss', 'ð': 'd', 'þ': 'th'
  };

  /**
   * Normalise un texte pour la génération de slug
   */
  private static normalizeText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .trim()
      .toLowerCase()
      .normalize('NFD') // Décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
      .replace(/[^\w\s-]/g, '') // Garde seulement alphanumériques, espaces et tirets
      .replace(/\s+/g, ' ') // Normalise les espaces multiples
      .trim();
  }

  /**
   * Supprime les mots vides d'un texte
   */
  private static removeStopWords(text: string, stopWords: Set<string>): string {
    return text
      .split(' ')
      .filter(word => word.length > 0 && !stopWords.has(word))
      .join(' ');
  }

  /**
   * Génère un slug à partir d'un texte
   */
  static generateSlug(
    text: string, 
    options: SlugGenerationOptions = {}
  ): string {
    const {
      maxLength = 100,
      preserveCase = false,
      separator = '-',
      removeStopWords = false
    } = options;

    if (!text || typeof text !== 'string') {
      return '';
    }

    let slug = text;

    // Normalisation
    slug = this.normalizeText(slug);

    // Suppression des mots vides si demandé
    if (removeStopWords) {
      slug = this.removeStopWords(slug, this.STOP_WORDS);
    }

    // Remplacement des espaces par le séparateur
    slug = slug.replace(/\s+/g, separator);

    // Suppression des séparateurs multiples
    slug = slug.replace(new RegExp(`\\${separator}+`, 'g'), separator);

    // Suppression des séparateurs en début et fin
    slug = slug.replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '');

    // Limitation de la longueur
    if (slug.length > maxLength) {
      slug = slug.substring(0, maxLength);
      // S'assurer de ne pas couper au milieu d'un mot
      const lastSeparatorIndex = slug.lastIndexOf(separator);
      if (lastSeparatorIndex > 0) {
        slug = slug.substring(0, lastSeparatorIndex);
      }
    }

    // Suppression du séparateur final si présent
    slug = slug.replace(new RegExp(`\\${separator}+$`, 'g'), '');

    return preserveCase ? slug : slug.toLowerCase();
  }

  /**
   * Génère un slug pour une propriété avec le format: 
   * - {type}-{région}-{ville}-{titre} si région n'est pas "autre" ou null
   * - {type}-{ville}-{titre} si région est "autre" ou null
   */
  static generatePropertySlug(
    propertyType: string,
    city: string,
    title: string,
    region?: string | null,
    options: SlugGenerationOptions = {}
  ): string {
    const typeSlug = this.generateSlug(propertyType, { ...options, maxLength: 30 });
    const citySlug = this.generateSlug(city, { ...options, maxLength: 30 });
    const titleSlug = this.generateSlug(title, { ...options, maxLength: 40 });

    // Vérifier si la région doit être incluse
    const shouldIncludeRegion = region && 
      region.toLowerCase() !== 'autre' && 
      region.toLowerCase() !== 'other' && 
      region.trim() !== '';

    let parts: string[];
    
    if (shouldIncludeRegion) {
      const regionSlug = this.generateSlug(region, { ...options, maxLength: 30 });
      parts = [typeSlug, regionSlug, citySlug, titleSlug].filter(part => part.length > 0);
    } else {
      parts = [typeSlug, citySlug, titleSlug].filter(part => part.length > 0);
    }
    
    if (parts.length === 0) {
      throw new Error('Impossible de générer un slug: tous les composants sont vides');
    }

    return parts.join('-');
  }

  /**
   * Valide un slug selon les bonnes pratiques
   */
  static validateSlug(slug: string): SlugValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!slug || typeof slug !== 'string') {
      errors.push('Le slug ne peut pas être vide');
      return { isValid: false, errors, warnings };
    }

    // Vérification de la longueur
    if (slug.length < 3) {
      errors.push('Le slug doit contenir au moins 3 caractères');
    }

    if (slug.length > 100) {
      errors.push('Le slug ne peut pas dépasser 100 caractères');
    }

    // Vérification du format (seulement alphanumériques et tirets)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push('Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets');
    }

    // Vérification des tirets multiples
    if (/-{2,}/.test(slug)) {
      warnings.push('Le slug contient des tirets multiples consécutifs');
    }

    // Vérification des tirets en début/fin
    if (slug.startsWith('-') || slug.endsWith('-')) {
      warnings.push('Le slug ne devrait pas commencer ou finir par un tiret');
    }

    // Vérification des mots vides
    const words = slug.split('-');
    const stopWordsFound = words.filter(word => this.STOP_WORDS.has(word));
    if (stopWordsFound.length > 0) {
      warnings.push(`Le slug contient des mots vides: ${stopWordsFound.join(', ')}`);
    }

    // Vérification de la lisibilité
    if (words.length < 2) {
      warnings.push('Le slug devrait contenir au moins 2 mots pour une meilleure lisibilité');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Génère un slug unique en ajoutant un suffixe numérique si nécessaire
   */
  static async generateUniqueSlug(
    baseSlug: string,
    checkUniqueness: (slug: string) => Promise<boolean>,
    maxAttempts: number = 10
  ): Promise<string> {
    let slug = baseSlug;
    let attempt = 1;

    while (attempt <= maxAttempts) {
      const isUnique = await checkUniqueness(slug);
      
      if (isUnique) {
        return slug;
      }

      // Ajouter un suffixe numérique
      slug = `${baseSlug}-${attempt}`;
      attempt++;
    }

    // Si on n'a pas trouvé d'unicité, ajouter un timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `${baseSlug}-${timestamp}`;
  }

  /**
   * Nettoie et optimise un slug existant
   */
  static optimizeSlug(slug: string): string {
    if (!slug) return '';

    return slug
      .toLowerCase()
      .replace(/-{2,}/g, '-') // Supprime les tirets multiples
      .replace(/^-+|-+$/g, '') // Supprime les tirets en début/fin
      .trim();
  }

  /**
   * Extrait les mots-clés d'un slug pour le SEO
   */
  static extractKeywords(slug: string): string[] {
    if (!slug) return [];

    return slug
      .split('-')
      .filter(word => word.length > 2) // Ignore les mots trop courts
      .filter(word => !this.STOP_WORDS.has(word)); // Ignore les mots vides
  }

  /**
   * Génère des suggestions de slugs alternatifs
   */
  static generateSlugSuggestions(
    propertyType: string,
    city: string,
    title: string,
    region?: string | null,
    count: number = 3
  ): string[] {
    const suggestions: string[] = [];
    
    // Suggestion 1: Format complet
    suggestions.push(this.generatePropertySlug(propertyType, city, title, region));
    
    // Suggestion 2: Sans mots vides
    suggestions.push(this.generatePropertySlug(propertyType, city, title, region, { removeStopWords: true }));
    
    // Suggestion 3: Titre raccourci
    const shortTitle = title.length > 20 ? title.substring(0, 20) + '...' : title;
    suggestions.push(this.generatePropertySlug(propertyType, city, shortTitle, region));
    
    // Suggestion 4: Format alternatif (ville-titre-type)
    suggestions.push(this.generateSlug(`${city} ${title} ${propertyType}`));
    
    // Retourner les suggestions uniques
    return [...new Set(suggestions)].slice(0, count);
  }
}

/**
 * Utilitaires pour les slugs
 */
export const SlugUtils = {
  /**
   * Vérifie si un slug est valide selon les standards
   */
  isValid: (slug: string): boolean => SlugService.validateSlug(slug).isValid,

  /**
   * Génère un slug simple à partir d'un texte
   */
  simple: (text: string): string => SlugService.generateSlug(text),

  /**
   * Génère un slug pour une propriété
   */
  property: (type: string, city: string, title: string, region?: string | null): string => 
    SlugService.generatePropertySlug(type, city, title, region),

  /**
   * Nettoie un slug existant
   */
  clean: (slug: string): string => SlugService.optimizeSlug(slug),

  /**
   * Extrait les mots-clés d'un slug
   */
  keywords: (slug: string): string[] => SlugService.extractKeywords(slug)
};
