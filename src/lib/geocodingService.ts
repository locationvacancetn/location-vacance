// Service de géocodage inverse pour récupérer les adresses à partir des coordonnées GPS

export interface GeocodingResult {
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
  fullAddress: string;
}

export class GeocodingService {
  private static readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse';
  
  /**
   * Récupère l'adresse à partir des coordonnées GPS
   * @param latitude Latitude GPS
   * @param longitude Longitude GPS
   * @returns Promise<GeocodingResult | null>
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    try {
      const params = new URLSearchParams({
        format: 'json',
        lat: latitude.toString(),
        lon: longitude.toString(),
        addressdetails: '1',
        'accept-language': 'fr,en'
      });

      const response = await fetch(`${this.NOMINATIM_BASE_URL}?${params}`, {
        headers: {
          'User-Agent': 'LocationVacance/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || data.error) {
        console.warn('Aucune adresse trouvée pour ces coordonnées');
        return null;
      }

      return this.parseNominatimResponse(data);
    } catch (error) {
      console.error('Erreur lors du géocodage inverse:', error);
      return null;
    }
  }

  /**
   * Parse la réponse de Nominatim pour extraire les informations d'adresse
   */
  private static parseNominatimResponse(data: any): GeocodingResult {
    const address = data.address || {};
    
    // Construction de l'adresse complète
    const addressParts = [];
    
    // Gérer les numéros de maison et routes (peuvent être en arabe ou avec des symboles)
    if (address.house_number && address.road) {
      const houseNumber = this.sanitizeAddressComponent(address.house_number);
      const road = this.sanitizeAddressComponent(address.road);
      addressParts.push(`${houseNumber} ${road}`);
    } else if (address.road) {
      addressParts.push(this.sanitizeAddressComponent(address.road));
    }
    
    // Code postal (peut contenir des chiffres et lettres)
    if (address.postcode) {
      addressParts.push(this.sanitizeAddressComponent(address.postcode));
    }
    
    // Ville (peut être en arabe)
    if (address.city || address.town || address.village) {
      addressParts.push(this.sanitizeAddressComponent(address.city || address.town || address.village));
    }
    
    // État/Région (peut être en arabe)
    if (address.state) {
      addressParts.push(this.sanitizeAddressComponent(address.state));
    }
    
    // Pays (peut être en arabe)
    if (address.country) {
      addressParts.push(this.sanitizeAddressComponent(address.country));
    }

    const fullAddress = addressParts.join(', ');
    const shortAddress = address.road ? 
      `${address.house_number ? this.sanitizeAddressComponent(address.house_number) + ' ' : ''}${this.sanitizeAddressComponent(address.road)}` : 
      fullAddress;

    return {
      address: shortAddress,
      city: this.sanitizeAddressComponent(address.city || address.town || address.village || ''),
      region: this.sanitizeAddressComponent(address.state || ''),
      country: this.sanitizeAddressComponent(address.country || ''),
      postalCode: address.postcode ? this.sanitizeAddressComponent(address.postcode) : undefined,
      fullAddress
    };
  }

  /**
   * Nettoie et valide un composant d'adresse
   * Gère les caractères arabes, chiffres, symboles et caractères spéciaux
   */
  private static sanitizeAddressComponent(component: string): string {
    if (!component) return '';
    
    // Nettoyer les espaces multiples et les caractères de contrôle
    let cleaned = component
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .replace(/[\x00-\x1F\x7F]/g, '') // Supprimer les caractères de contrôle
      .trim();
    
    // Vérifier que le composant n'est pas vide après nettoyage
    if (!cleaned) return '';
    
    // Limiter la longueur pour éviter les adresses trop longues
    if (cleaned.length > 200) {
      cleaned = cleaned.substring(0, 200) + '...';
    }
    
    return cleaned;
  }

  /**
   * Valide si des coordonnées GPS sont valides
   */
  static isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180 &&
      !isNaN(latitude) && !isNaN(longitude)
    );
  }

  /**
   * Valide si une adresse est valide pour la base de données
   * Vérifie que l'adresse n'est pas vide et respecte les contraintes
   */
  static isValidAddress(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false;
    }
    
    const cleaned = this.sanitizeAddressComponent(address);
    
    // L'adresse doit avoir au moins 3 caractères après nettoyage
    if (cleaned.length < 3) {
      return false;
    }
    
    // L'adresse ne doit pas être trop longue (limite de la base de données)
    if (cleaned.length > 500) {
      return false;
    }
    
    return true;
  }

  /**
   * Valide et nettoie une adresse pour la sauvegarde
   * Retourne l'adresse nettoyée ou null si invalide
   */
  static validateAndCleanAddress(address: string): string | null {
    if (!this.isValidAddress(address)) {
      return null;
    }
    
    return this.sanitizeAddressComponent(address);
  }

  /**
   * Formate les coordonnées pour l'affichage
   */
  static formatCoordinates(latitude: number, longitude: number): string {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
}
