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
            <Select
              value={formData.propertyTypeId}
              onValueChange={(value) => updateFormData({ propertyTypeId: value })}
              disabled={loading}
            >
              <SelectTrigger className="mt-1 h-12 text-sm">
                <SelectValue placeholder={loading ? "Chargement..." : "Sélectionnez un type"} />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{type.name}</div>
                        {type.description && (
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                placeholder="Ex: 8"
                value={formData.maxGuests || ""}
                onChange={(e) => {
                  const numValue = parseInt(e.target.value) || 0;
                  if (numValue >= 0) {
                    updateFormData({ maxGuests: numValue });
                  }
                }}
                className="pl-10 h-12 text-sm"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combien de personnes peuvent dormir dans votre propriété ?
            </p>
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
                placeholder="Ex: 3"
                value={formData.bedrooms || ""}
                onChange={(e) => handleNumberChange('bedrooms', e.target.value)}
                className="pl-10 h-12 text-sm"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Chambres avec lit (salon convertible non inclus)
            </p>
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
                max="10"
                placeholder="Ex: 2"
                value={formData.bathrooms || ""}
                onChange={(e) => handleNumberChange('bathrooms', e.target.value)}
                className="pl-10 h-12 text-sm"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Salles de bain complètes avec douche/bain
            </p>
          </div>
        </div>
      </div>

      {/* Conseils */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Bed className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-900">
              Conseils pour la capacité
            </h3>
            <ul className="text-sm text-green-800 mt-1 space-y-1">
              <li>• Soyez précis sur le nombre de lits disponibles</li>
              <li>• Incluez les canapés-lits si approprié</li>
              <li>• Vérifiez les réglementations locales sur l'occupation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeCapacityStep;
