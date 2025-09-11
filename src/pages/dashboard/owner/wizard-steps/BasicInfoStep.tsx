import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PropertyFormData } from "../AddPropertyWizard";
import { FileText } from "lucide-react";

interface BasicInfoStepProps {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
}

const BasicInfoStep = ({ formData, updateFormData }: BasicInfoStepProps) => {
  return (
    <div className="space-y-6">
        <div className="mb-6 scroll-target">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Informations de base
            </h2>
          </div>
        <p className="text-sm text-muted-foreground">
          Commençons par les informations essentielles de votre propriété
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="property-name" className="text-sm font-medium">
            Nom de la propriété *
          </Label>
          <Input
            id="property-name"
            type="text"
            placeholder="Villa de luxe avec piscine"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className="mt-1 text-sm placeholder:text-muted-foreground/70"
            required
            minLength={5}
            maxLength={200}
          />
          {formData.name.length > 0 && formData.name.length < 5 && (
            <div className="flex justify-end mt-1">
              <p className="text-xs font-medium text-error">
                Le nom doit contenir au moins 5 caractères
              </p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="property-description" className="text-sm font-medium">
            Description *
          </Label>
          <Textarea
            id="property-description"
            placeholder="Décrivez votre propriété, ses points forts et ce qui la rend unique (minimum 20 caractères)..."
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            className="mt-1 min-h-[200px] text-sm resize-none placeholder:text-muted-foreground/70"
            rows={6}
            required
            minLength={20}
            maxLength={2000}
          />
          {formData.description.length > 0 && formData.description.length < 20 && (
            <div className="flex justify-end mt-1">
              <p className="text-xs font-medium text-error">
                La description doit contenir au moins 20 caractères
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default BasicInfoStep;
