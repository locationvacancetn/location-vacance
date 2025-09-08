import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyFormData } from "../AddPropertyWizard";
import { Euro, Clock, Calendar, CreditCard } from "lucide-react";

interface PricingRulesStepProps {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
}

const PricingRulesStep = ({ formData, updateFormData }: PricingRulesStepProps) => {
  const handleNumberChange = (field: keyof PropertyFormData, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 0) {
      updateFormData({ [field]: numValue });
    }
  };

  const handleMinNightsChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    if (numValue >= 1) {
      updateFormData({ minNights: numValue });
    }
  };

  // Options d'heures pour check-in/check-out
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: `${hour}:00`, label: `${hour}:00` };
  });

  return (
    <div className="space-y-6">
        <div className="mb-6 scroll-target">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Tarification et règles
            </h2>
          </div>
        <p className="text-sm text-muted-foreground">
          Définissez vos tarifs et les règles de séjour
        </p>
      </div>

      <div className="space-y-6">
        {/* Prix de base et Nombre minimum de nuits sur la même ligne */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prix de base */}
          <div>
            <Label htmlFor="base-price" className="text-sm font-medium text-foreground">
              Prix de base par nuitée (€) *
            </Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Euro className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="base-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 120"
                value={formData.basePrice || ""}
                onChange={(e) => handleNumberChange('basePrice', e.target.value)}
                className="pl-10 h-12 text-sm"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Prix de base pour une nuitée (hors frais supplémentaires)
            </p>
          </div>

          {/* Nombre minimum de nuits */}
          <div>
            <Label htmlFor="min-nights" className="text-sm font-medium text-foreground">
              Nombre minimum de nuits *
            </Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="min-nights"
                type="number"
                min="1"
                placeholder="Ex: 2"
                value={formData.minNights || ""}
                onChange={(e) => handleMinNightsChange(e.target.value)}
                className="pl-10 h-12 text-sm"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Durée minimum de séjour requise
            </p>
          </div>
        </div>

        {/* Règles de check-in/check-out */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="h-4 w-4" />
            Horaires d'arrivée et de départ
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="check-in" className="text-sm font-medium text-foreground">
                Heure d'arrivée *
              </Label>
              <Select
                value={formData.checkInTime}
                onValueChange={(value) => updateFormData({ checkInTime: value })}
              >
                <SelectTrigger className="mt-1 h-12 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Heure à partir de laquelle les invités peuvent arriver
              </p>
            </div>

            <div>
              <Label htmlFor="check-out" className="text-sm font-medium text-foreground">
                Heure de départ *
              </Label>
              <Select
                value={formData.checkOutTime}
                onValueChange={(value) => updateFormData({ checkOutTime: value })}
              >
                <SelectTrigger className="mt-1 h-12 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Heure limite pour le départ des invités
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Conseils de tarification */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Euro className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-900">
              Conseils de tarification
            </h3>
            <ul className="text-sm text-green-800 mt-1 space-y-1">
              <li>• Recherchez les prix des propriétés similaires dans votre région</li>
              <li>• Tenez compte de la saisonnalité et des événements locaux</li>
              <li>• Vous pourrez ajuster vos tarifs plus tard</li>
              <li>• Des prix compétitifs augmentent vos chances de réservation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Informations sur les règles */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">
              Règles de séjour
            </h3>
            <p className="text-sm text-blue-800 mt-1">
              Les horaires et durées minimum que vous définissez ici seront visibles par les voyageurs 
              et les aideront à planifier leur séjour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingRulesStep;
