import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PropertyFormData } from "../AddPropertyWizard";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Map, Navigation, Loader2 } from "lucide-react";
import MapSelector from "@/components/MapSelector";
import { GeocodingService, GeocodingResult } from "@/lib/geocodingService";

interface LocationStepProps {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
  isEditMode?: boolean;
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

const LocationStep = ({ formData, updateFormData, isEditMode = false }: LocationStepProps) => {
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null);
  const [hasExistingCoordinates, setHasExistingCoordinates] = useState(false);

  // Détecter les coordonnées existantes en mode édition
  useEffect(() => {
    if (isEditMode && formData.latitude && formData.longitude) {
      setHasExistingCoordinates(true);
    }
  }, [isEditMode, formData.latitude, formData.longitude]);

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

  // Gérer la sélection d'emplacement sur la carte
  const handleMapLocationSelect = async (latitude: number, longitude: number) => {
    // Mettre à jour les coordonnées
    updateFormData({
      latitude: latitude.toString(),
      longitude: longitude.toString()
    });

    // Effectuer le géocodage inverse
    setIsGeocoding(true);
    try {
      const result = await GeocodingService.reverseGeocode(latitude, longitude);
      if (result) {
        setGeocodingResult(result);
        
        // Valider et nettoyer l'adresse avant de la sauvegarder
        const validatedAddress = GeocodingService.validateAndCleanAddress(result.address);
        if (validatedAddress) {
          updateFormData({
            address: validatedAddress
          });
        } else {
          // Si l'adresse n'est pas valide, utiliser l'adresse complète
          const fullAddressValidated = GeocodingService.validateAndCleanAddress(result.fullAddress);
          if (fullAddressValidated) {
            updateFormData({
              address: fullAddressValidated
            });
          } else {
            // En dernier recours, utiliser les coordonnées
            updateFormData({
              address: `Coordonnées: ${GeocodingService.formatCoordinates(latitude, longitude)}`
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Obtenir les coordonnées actuelles pour la carte
  const getCurrentCoordinates = (): [number, number] => {
    const lat = parseFloat(formData.latitude) || 36.8065; // Tunis par défaut
    const lng = parseFloat(formData.longitude) || 10.1815;
    return [lat, lng];
  };

  // Validation des coordonnées GPS
  const validateCoordinates = (latitude: string, longitude: string): boolean => {
    if (!latitude || !longitude || latitude.trim() === '' || longitude.trim() === '') {
      return false;
    }
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return false;
    }
    
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  // Vérifier si les coordonnées sont valides
  const areCoordinatesValid = validateCoordinates(formData.latitude, formData.longitude);

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
              <SelectTrigger className="mt-1 text-sm">
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
              <SelectTrigger className="mt-1 text-sm">
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
            placeholder="Sélectionnez un emplacement sur la carte pour récupérer l'adresse automatiquement"
            value={formData.address}
            readOnly
            className="mt-1 text-sm placeholder:text-muted-foreground/70 bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">
            L'adresse est récupérée automatiquement depuis la carte. Utilisez la carte interactive ci-dessous pour la modifier.
          </p>
        </div>

        {/* Coordonnées GPS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              Coordonnées GPS
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              {showMap ? 'Masquer la carte' : 'Afficher la carte'}
            </Button>
          </div>
          
          {/* Carte interactive */}
          {showMap && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {isEditMode && hasExistingCoordinates 
                  ? "Cliquez sur la carte pour modifier l'emplacement de votre propriété. L'adresse sera mise à jour automatiquement."
                  : "Cliquez sur la carte pour sélectionner l'emplacement exact de votre propriété. L'adresse sera récupérée automatiquement."
                }
              </div>
              <MapSelector
                latitude={parseFloat(formData.latitude) || 36.8065}
                longitude={parseFloat(formData.longitude) || 10.1815}
                onLocationSelect={handleMapLocationSelect}
                height="300px"
                className="border rounded-lg"
              />
              {isGeocoding && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Récupération de l'adresse...
                </div>
              )}
              {geocodingResult && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800 mb-1">
                    {isEditMode ? "Adresse mise à jour :" : "Adresse détectée :"}
                  </div>
                  <div className="text-sm text-green-700">
                    {geocodingResult.fullAddress}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude" className="text-sm font-medium">
                  Latitude *
                </Label>
                <Input
                  id="latitude"
                  type="text"
                  placeholder="36.8065"
                  value={formData.latitude}
                  onChange={(e) => updateFormData({ latitude: e.target.value })}
                  className="mt-1 text-sm placeholder:text-muted-foreground/70"
                />
              </div>
              
              <div>
                <Label htmlFor="longitude" className="text-sm font-medium">
                  Longitude *
                </Label>
                <Input
                  id="longitude"
                  type="text"
                  placeholder="10.1815"
                  value={formData.longitude}
                  onChange={(e) => updateFormData({ longitude: e.target.value })}
                  className="mt-1 text-sm placeholder:text-muted-foreground/70"
                />
              </div>
            </div>
            
            {!areCoordinatesValid && (formData.latitude || formData.longitude) && (
              <div className="flex justify-end mt-1">
                <p className="text-xs font-medium text-error">
                  Veuillez saisir des coordonnées GPS ou pointer sur la carte
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Vous pouvez saisir manuellement les coordonnées ou utiliser la carte interactive ci-dessus
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LocationStep;
