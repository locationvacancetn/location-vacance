import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyFormData } from "../AddPropertyWizard";
import { CreditCard } from "lucide-react";

interface PricingRulesStepProps {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
}

const PricingRulesStep = ({ formData, updateFormData }: PricingRulesStepProps) => {
  const handleNumberChange = (field: keyof PropertyFormData, value: string) => {
    const numValue = parseInt(value) || 0;
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
              Prix par nuitée *
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md whitespace-nowrap min-w-[80px]">
                À partir
              </span>
              <Input
                id="base-price"
                type="number"
                min="10"
                step="1"
                value={formData.basePrice > 0 ? formData.basePrice : ""}
                onChange={(e) => handleNumberChange('basePrice', e.target.value)}
                placeholder="Prix"
                className="rounded-l-none"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ce prix est à titre indicatif. Le prix final sera communiqué par vous après contact du voyageur.
            </p>
            {formData.basePrice > 0 && formData.basePrice <= 10 && (
              <div className="flex justify-end mt-1">
                <p className="text-xs font-medium text-error">
                  Le prix doit être supérieur à 10 DT
                </p>
              </div>
            )}
          </div>

          {/* Nombre minimum de nuits */}
          <div>
            <Label htmlFor="min-nights" className="text-sm font-medium text-foreground">
              Nombre minimum de nuitée *
            </Label>
            <Input
              id="min-nights"
              type="number"
              min="1"
              max="365"
              value={formData.minNights > 0 ? formData.minNights : ""}
              onChange={(e) => handleMinNightsChange(e.target.value)}
              className="mt-1 text-sm placeholder:text-muted-foreground/70"
              required
            />
            {formData.minNights > 0 && (formData.minNights < 1 || formData.minNights > 365) && (
              <div className="flex justify-end mt-1">
                <p className="text-xs font-medium text-error">
                  Le nombre de nuits doit être entre 1 et 365
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Règles de check-in/check-out */}
        <div className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="check-in" className="text-sm font-medium text-foreground">
                Heure d'arrivée *
              </Label>
              <Select
                value={formData.checkInTime}
                onValueChange={(value) => updateFormData({ checkInTime: value })}
              >
                <SelectTrigger className="mt-1 text-sm">
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
                <SelectTrigger className="mt-1 text-sm">
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

    </div>
  );
};

export default PricingRulesStep;
