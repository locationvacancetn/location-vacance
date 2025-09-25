import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PropertyFormData } from "../AddPropertyWizard";
import { supabase } from "@/integrations/supabase/client";
import { Home, Bed, ShowerHead, Users, Star, Wifi, Car, Snowflake, Thermometer, ChefHat, Tv, ShieldCheck, Dog, Waves, TreePine, ArrowUpDown, Cigarette } from "lucide-react";

interface TypeCapacityStepProps {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
}

interface PropertyType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
}

interface Characteristic {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
}

// Mapping des icônes pour les caractéristiques
const iconMap: { [key: string]: any } = {
  'wifi': Wifi,
  'swimming-pool': Waves,
  'car': Car,
  'snowflake': Snowflake,
  'thermometer': Thermometer,
  'chef-hat': ChefHat,
  'washing-machine': Car,
  'dishwasher': Car,
  'tv': Tv,
  'balcony': TreePine,
  'tree-pine': TreePine,
  'elevator': ArrowUpDown,
  'shield-check': ShieldCheck,
  'dog': Dog,
  'no-smoking': Cigarette,
  'star': Star,
};

const TypeCapacityStep = ({ formData, updateFormData }: TypeCapacityStepProps) => {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les types de propriétés et caractéristiques actifs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les types de propriétés
        const { data: propertyTypesData, error: propertyTypesError } = await supabase
          .from('property_types')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (propertyTypesError) throw propertyTypesError;
        setPropertyTypes(propertyTypesData || []);

        // Charger les caractéristiques
        const { data: characteristicsData, error: characteristicsError } = await supabase
          .from('property_characteristics')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (characteristicsError) throw characteristicsError;
        setCharacteristics(characteristicsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNumberChange = (field: keyof PropertyFormData, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0) {
      updateFormData({ [field]: numValue });
    }
  };

  const getFieldLimits = (field: string) => {
    switch (field) {
      case 'maxGuests':
        return { min: 1, max: 50, label: 'invités' };
      case 'bedrooms':
        return { min: 1, max: 20, label: 'chambres' };
      case 'bathrooms':
        return { min: 1, max: 20, label: 'salles de bain' };
      default:
        return { min: 1, max: 100, label: '' };
    }
  };

  const toggleCharacteristic = (characteristicId: string) => {
    const currentIds = formData.characteristicIds || [];
    const isSelected = currentIds.includes(characteristicId);
    if (isSelected) {
      updateFormData({
        characteristicIds: currentIds.filter(id => id !== characteristicId)
      });
    } else {
      updateFormData({
        characteristicIds: [...currentIds, characteristicId]
      });
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Star;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
        <div className="mb-6 scroll-target">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Type et capacité
            </h2>
          </div>
        <p className="text-sm text-muted-foreground">
          Quel type de propriété, combien de personnes peut-elle accueillir et quelles sont ses caractéristiques ?
        </p>
      </div>

      <div className="space-y-6">
        {/* Type de propriété et Capacité d'accueil sur la même ligne */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type de propriété */}
          <div>
            <Label htmlFor="property-type" className="text-sm font-medium text-foreground">
              Type de propriété *
            </Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Home className="h-4 w-4 text-muted-foreground" />
              </div>
              <Select
                value={formData.propertyTypeId}
                onValueChange={(value) => updateFormData({ propertyTypeId: value })}
                disabled={loading}
              >
                <SelectTrigger className="pl-10 text-sm">
                  <SelectValue placeholder={loading ? "Chargement..." : ""} />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nombre maximum d'invités */}
          <div>
            <Label htmlFor="max-guests" className="text-sm font-medium text-foreground">
              Nombre maximum d'invités *
            </Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="max-guests"
                type="number"
                min="1"
                max="50"
                value={formData.maxGuests > 0 ? formData.maxGuests : ""}
                onChange={(e) => {
                  const numValue = parseInt(e.target.value) || 0;
                  if (numValue >= 0) {
                    updateFormData({ maxGuests: numValue });
                  }
                }}
                className="pl-10 text-sm"
                required
              />
            </div>
            {formData.maxGuests > 0 && (formData.maxGuests < 1 || formData.maxGuests > 50) && (
              <div className="flex justify-end mt-1">
                <p className="text-xs font-medium text-error">
                  Le nombre d'invités doit être entre 1 et 50
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chambres et salles de bain sur la même ligne */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre de chambres */}
          <div>
            <Label htmlFor="bedrooms" className="text-sm font-medium text-foreground">
              Nombre de chambres *
            </Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Bed className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="bedrooms"
                type="number"
                min="1"
                max="20"
                value={formData.bedrooms > 0 ? formData.bedrooms : ""}
                onChange={(e) => handleNumberChange('bedrooms', e.target.value)}
                className="pl-10 text-sm"
                required
              />
            </div>
            {formData.bedrooms > 0 && (formData.bedrooms < 1 || formData.bedrooms > 20) && (
              <div className="flex justify-end mt-1">
                <p className="text-xs font-medium text-error">
                  Le nombre de chambres doit être entre 1 et 20
                </p>
              </div>
            )}
          </div>

          {/* Nombre de salles de bain */}
          <div>
            <Label htmlFor="bathrooms" className="text-sm font-medium text-foreground">
              Nombre de salles de bain *
            </Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShowerHead className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="bathrooms"
                type="number"
                min="1"
                max="20"
                value={formData.bathrooms > 0 ? formData.bathrooms : ""}
                onChange={(e) => handleNumberChange('bathrooms', e.target.value)}
                className="pl-10 text-sm"
                required
              />
            </div>
            {formData.bathrooms > 0 && (formData.bathrooms < 1 || formData.bathrooms > 20) && (
              <div className="flex justify-end mt-1">
                <p className="text-xs font-medium text-error">
                  Le nombre de salles de bain doit être entre 1 et 20
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Caractéristiques de la propriété */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-foreground">
              Caractéristiques de la propriété
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Sélectionnez les caractéristiques qui décrivent votre propriété
            </p>
          </div>
          
          <div className="mt-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement des caractéristiques...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {characteristics.map((characteristic) => {
                  const isSelected = formData.characteristicIds?.includes(characteristic.id) || false;
                  return (
                    <div
                      key={characteristic.id}
                      className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded border border-border/50 cursor-pointer transition-colors"
                      onClick={() => toggleCharacteristic(characteristic.id)}
                    >
                      <div className={`flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {getIcon(characteristic.icon || 'star')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          {characteristic.name}
                        </div>
                        {characteristic.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {characteristic.description}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleCharacteristic(characteristic.id)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default TypeCapacityStep;
