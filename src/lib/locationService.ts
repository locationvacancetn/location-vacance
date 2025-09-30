import { supabase } from '@/integrations/supabase/client';

export interface City {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocationResult {
  id: string;
  name: string;
  type: 'city' | 'region';
  city_name?: string;
  display_name: string;
  slug: string;
}

/**
 * Service pour récupérer les villes et régions depuis la base de données Supabase
 */
export class LocationService {
  static supabase = supabase;
  /**
   * Recherche les villes et régions par nom
   * @param query - Terme de recherche
   * @param limit - Nombre maximum de résultats (défaut: 8)
   * @returns Liste des résultats de recherche
   */
  static async searchLocations(query: string, limit: number = 8): Promise<LocationResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const searchTerm = `%${query.toLowerCase()}%`;

      // Recherche dans les villes
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name, slug, is_active')
        .ilike('name', searchTerm)
        .eq('is_active', true)
        .limit(limit);

      if (citiesError) {
        console.error('Erreur lors de la recherche des villes:', citiesError);
        throw citiesError;
      }

      // Recherche dans les régions
      const { data: regions, error: regionsError } = await supabase
        .from('regions')
        .select(`
          id,
          name,
          slug,
          is_active,
          city_id,
          cities!inner(name)
        `)
        .ilike('name', searchTerm)
        .eq('is_active', true)
        .limit(limit);

      if (regionsError) {
        console.error('Erreur lors de la recherche des régions:', regionsError);
        throw regionsError;
      }

      // Formater les résultats
      const results: LocationResult[] = [];

      // Ajouter les villes
      if (cities) {
        cities.forEach(city => {
          results.push({
            id: city.id,
            name: city.name,
            type: 'city',
            display_name: city.name,
            slug: city.slug
          });
        });
      }

      // Ajouter les régions
      if (regions) {
        regions.forEach(region => {
          const cityName = (region.cities as any)?.name || '';
          results.push({
            id: region.id,
            name: region.name,
            type: 'region',
            city_name: cityName,
            display_name: `${cityName}, ${region.name}`,
            slug: region.slug
          });
        });
      }

      // Limiter le nombre total de résultats
      return results.slice(0, limit);

    } catch (error) {
      console.error('Erreur lors de la recherche de localisation:', error);
      return [];
    }
  }

  /**
   * Récupère toutes les villes actives
   * @returns Liste des villes
   */
  static async getAllCities(): Promise<City[]> {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des villes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des villes:', error);
      return [];
    }
  }

  /**
   * Récupère toutes les régions actives d'une ville
   * @param cityId - ID de la ville
   * @returns Liste des régions
   */
  static async getRegionsByCity(cityId: string): Promise<Region[]> {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('city_id', cityId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des régions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des régions:', error);
      return [];
    }
  }

  /**
   * Récupère une ville par son ID
   * @param cityId - ID de la ville
   * @returns Ville ou null
   */
  static async getCityById(cityId: string): Promise<City | null> {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('id', cityId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la ville:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la ville:', error);
      return null;
    }
  }

  /**
   * Récupère une région par son ID
   * @param regionId - ID de la région
   * @returns Région ou null
   */
  static async getRegionById(regionId: string): Promise<Region | null> {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('id', regionId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la région:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la région:', error);
      return null;
    }
  }
}
