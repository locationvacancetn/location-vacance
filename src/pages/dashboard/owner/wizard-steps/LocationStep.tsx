import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyFormData } from "../AddPropertyWizard";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Navigation } from "lucide-react";

interface LocationStepProps {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
}

interface Region {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

interface City {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  region_id: string;
}

const LocationStep = ({ formData, updateFormData }: LocationStepProps) => {
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // Charger les villes actives
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const { data, error } = await supabase
          .from('cities')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Erreur lors du chargement des villes:', error);
          // Si la table n'existe pas, utiliser des données de test
          setCities([
            { id: '1', name: 'Tunis', slug: 'tunis', is_active: true },
            { id: '2', name: 'Sfax', slug: 'sfax', is_active: true },
            { id: '3', name: 'Sousse', slug: 'sousse', is_active: true },
            { id: '4', name: 'Monastir', slug: 'monastir', is_active: true },
            { id: '5', name: 'Hammamet', slug: 'hammamet', is_active: true },
          ]);
          return;
        }
        setCities(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des villes:', error);
        // Données de fallback
        setCities([
          { id: '1', name: 'Tunis', slug: 'tunis', is_active: true },
          { id: '2', name: 'Sfax', slug: 'sfax', is_active: true },
          { id: '3', name: 'Sousse', slug: 'sousse', is_active: true },
          { id: '4', name: 'Monastir', slug: 'monastir', is_active: true },
          { id: '5', name: 'Hammamet', slug: 'hammamet', is_active: true },
        ]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Charger les régions quand une ville est sélectionnée
  useEffect(() => {
    if (formData.cityId) {
      const fetchRegions = async () => {
        try {
          setLoadingRegions(true);
          const { data, error } = await supabase
            .from('regions')
            .select('*')
            .eq('city_id', formData.cityId)
            .eq('is_active', true)
            .order('name');

          if (error) {
            console.error('Erreur lors du chargement des régions:', error);
            // Données de fallback basées sur la ville sélectionnée
            const fallbackRegions = {
              '1': [ // Tunis
                { id: '1', name: 'Centre-ville', slug: 'centre-ville', is_active: true, city_id: '1' },
                { id: '2', name: 'Lac', slug: 'lac', is_active: true, city_id: '1' },
                { id: '3', name: 'Carthage', slug: 'carthage', is_active: true, city_id: '1' },
              ],
              '2': [ // Sfax
                { id: '4', name: 'Centre', slug: 'centre', is_active: true, city_id: '2' },
                { id: '5', name: 'Sakiet Ezzit', slug: 'sakiet-ezzit', is_active: true, city_id: '2' },
              ],
              '3': [ // Sousse
                { id: '6', name: 'Médina', slug: 'medina', is_active: true, city_id: '3' },
                { id: '7', name: 'Port El Kantaoui', slug: 'port-el-kantaoui', is_active: true, city_id: '3' },
              ],
              '4': [ // Monastir
                { id: '8', name: 'Centre', slug: 'centre', is_active: true, city_id: '4' },
                { id: '9', name: 'Skanes', slug: 'skanes', is_active: true, city_id: '4' },
              ],
              '5': [ // Hammamet
                { id: '10', name: 'Centre', slug: 'centre', is_active: true, city_id: '5' },
                { id: '11', name: 'Yasmine Hammamet', slug: 'yasmine-hammamet', is_active: true, city_id: '5' },
              ],
            };
            setRegions(fallbackRegions[formData.cityId as keyof typeof fallbackRegions] || []);
            return;
          }
          setRegions(data || []);
        } catch (error) {
          console.error('Erreur lors du chargement des régions:', error);
          // Données de fallback
          setRegions([
            { id: '1', name: 'Centre-ville', slug: 'centre-ville', is_active: true, city_id: formData.cityId },
            { id: '2', name: 'Région principale', slug: 'region-principale', is_active: true, city_id: formData.cityId },
          ]);
        } finally {
          setLoadingRegions(false);
        }
      };

      fetchRegions();
    } else {
      setRegions([]);
    }
  }, [formData.cityId]);

  const handleCityChange = (cityId: string) => {
    updateFormData({ 
      cityId,
      regionId: "" // Reset region when city changes
    });
  };

  const handleRegionChange = (regionId: string) => {
    updateFormData({ regionId });
  };

  return (
    <div className="space-y-6">
        <div className="mb-6 scroll-target">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Localisation
            </h2>
          </div>
        <p className="text-sm text-muted-foreground">
          Où se trouve votre propriété ?
        </p>
      </div>


      <div className="space-y-4">
        {/* Sélection de la ville et région sur la même ligne */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sélection de la ville */}
          <div>
            <Label htmlFor="city" className="text-sm font-medium">
              Ville *
            </Label>
            <Select
              value={formData.cityId}
              onValueChange={handleCityChange}
              disabled={loadingCities}
            >
              <SelectTrigger className="mt-1 h-12 text-sm">
                <SelectValue placeholder={loadingCities ? "Chargement..." : "Sélectionnez une ville"} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sélection de la région */}
          <div>
            <Label htmlFor="region" className="text-sm font-medium">
              Région *
            </Label>
            <Select
              value={formData.regionId}
              onValueChange={handleRegionChange}
              disabled={!formData.cityId || loadingRegions}
            >
              <SelectTrigger className="mt-1 h-12 text-sm">
                <SelectValue 
                  placeholder={
                    !formData.cityId 
                      ? "Sélectionnez d'abord une ville" 
                      : loadingRegions 
                      ? "Chargement..." 
                      : "Sélectionnez une région"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Adresse complète */}
        <div>
          <Label htmlFor="address" className="text-sm font-medium">
            Adresse complète
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="Ex: 123 Rue de la Plage, Quartier Marina"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            className="mt-1 h-12 text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            L'adresse exacte de votre propriété (optionnel)
          </p>
        </div>

        {/* Coordonnées GPS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Navigation className="h-4 w-4" />
            Coordonnées GPS
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude" className="text-sm font-medium">
                Latitude
              </Label>
              <Input
                id="latitude"
                type="text"
                placeholder="Ex: 36.8065"
                value={formData.latitude}
                onChange={(e) => updateFormData({ latitude: e.target.value })}
                className="mt-1 h-12 text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="longitude" className="text-sm font-medium">
                Longitude
              </Label>
              <Input
                id="longitude"
                type="text"
                placeholder="Ex: 10.1815"
                value={formData.longitude}
                onChange={(e) => updateFormData({ longitude: e.target.value })}
                className="mt-1 h-12 text-sm"
              />
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Vous pouvez obtenir ces coordonnées via Google Maps ou un autre service de cartographie (optionnel)
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <MapPin className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Localisation précise
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Les coordonnées GPS permettent aux voyageurs de localiser facilement votre propriété.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;
