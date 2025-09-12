import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyFormData } from "../AddPropertyWizard";
import { supabase } from "@/integrations/supabase/client";
import { Home, Bed, ShowerHead, Users } from "lucide-react";

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

const TypeCapacityStep = ({ formData, updateFormData }: TypeCapacityStepProps) => {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les types de propriétés actifs
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('property_types')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setPropertyTypes(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des types de propriétés:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyTypes();
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
          Quel type de propriété et combien de personnes peut-elle accueillir ?
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
      </div>

    </div>
  );
};

export default TypeCapacityStep;
