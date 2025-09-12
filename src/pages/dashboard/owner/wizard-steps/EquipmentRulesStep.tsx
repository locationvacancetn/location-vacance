import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { PropertyFormData } from "../AddPropertyWizard";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wifi, 
  Car, 
  Snowflake, 
  Thermometer, 
  ChefHat, 
  Tv, 
  ShieldCheck, 
  Dog, 
  Waves, 
  TreePine, 
  ArrowUpDown,
  Cigarette,
  Baby,
  PartyPopper
} from "lucide-react";

interface EquipmentRulesStepProps {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
}

interface Equipment {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
}

// Mapping des icônes
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
};

const EquipmentRulesStep = ({ formData, updateFormData }: EquipmentRulesStepProps) => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les équipements actifs
  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('equipments')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setEquipments(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des équipements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipments();
  }, []);


  const toggleEquipment = (equipmentId: string) => {
    const isSelected = formData.equipmentIds.includes(equipmentId);
    if (isSelected) {
      updateFormData({
        equipmentIds: formData.equipmentIds.filter(id => id !== equipmentId)
      });
    } else {
      updateFormData({
        equipmentIds: [...formData.equipmentIds, equipmentId]
      });
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Wifi;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
        <div className="mb-6 scroll-target">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Équipements et règles
            </h2>
          </div>
        <p className="text-sm text-muted-foreground">
          Sélectionnez les équipements disponibles et définissez les règles de votre propriété
        </p>
      </div>

      {/* Règles de la propriété */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">Règles de la propriété
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Autorisation de fumer */}
          <div className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded">
            <div className="flex-shrink-0 text-muted-foreground">
              <Cigarette className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground">Autorisation de fumer</div>
              <div className="text-xs text-muted-foreground mt-1">Les invités peuvent-ils fumer dans la propriété ?</div>
            </div>
            <div className="flex-shrink-0">
              <Switch
                checked={formData.smokingAllowed}
                onCheckedChange={(checked) => updateFormData({ smokingAllowed: checked })}
              />
            </div>
          </div>

          {/* Animaux acceptés */}
          <div className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded">
            <div className="flex-shrink-0 text-muted-foreground">
              <Dog className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground">Animaux acceptés</div>
              <div className="text-xs text-muted-foreground mt-1">Les invités peuvent-ils amener leurs animaux ?</div>
            </div>
            <div className="flex-shrink-0">
              <Switch
                checked={formData.petsAllowed}
                onCheckedChange={(checked) => updateFormData({ petsAllowed: checked })}
              />
            </div>
          </div>

          {/* Fête autorisée */}
          <div className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded">
            <div className="flex-shrink-0 text-muted-foreground">
              <PartyPopper className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground">Fête autorisée</div>
              <div className="text-xs text-muted-foreground mt-1">Les invités peuvent-ils organiser des fêtes ?</div>
            </div>
            <div className="flex-shrink-0">
              <Switch
                checked={formData.partiesAllowed}
                onCheckedChange={(checked) => updateFormData({ partiesAllowed: checked })}
              />
            </div>
          </div>

          {/* Enfants autorisés */}
          <div className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded">
            <div className="flex-shrink-0 text-muted-foreground">
              <Baby className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground">Enfants autorisés</div>
              <div className="text-xs text-muted-foreground mt-1">La propriété est-elle adaptée aux enfants ?</div>
            </div>
            <div className="flex-shrink-0">
              <Switch
                checked={formData.childrenAllowed}
                onCheckedChange={(checked) => updateFormData({ childrenAllowed: checked })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Équipements */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-foreground">
            Équipements disponibles
          </Label>
          
          <div className="mt-3">
            {/* Liste des équipements */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des équipements...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipments.map((equipment) => {
                const isSelected = formData.equipmentIds.includes(equipment.id);
                return (
                  <div
                    key={equipment.id}
                    className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded"
                  >
                    <div className="flex-shrink-0 text-muted-foreground">
                      {getIcon(equipment.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">
                        {equipment.name}
                      </div>
                      {equipment.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {equipment.description}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleEquipment(equipment.id)}
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

export default EquipmentRulesStep;
