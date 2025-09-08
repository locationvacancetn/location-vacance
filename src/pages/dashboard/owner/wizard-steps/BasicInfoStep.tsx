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
            placeholder="Ex: Villa de luxe avec piscine"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className="mt-1 h-12 text-sm"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Choisissez un nom attractif qui décrit bien votre propriété
          </p>
        </div>

        <div>
          <Label htmlFor="property-description" className="text-sm font-medium">
            Description courte
          </Label>
          <Textarea
            id="property-description"
            placeholder="Décrivez brièvement votre propriété, ses points forts et ce qui la rend unique..."
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            className="mt-1 min-h-[100px] text-sm resize-none"
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Cette description apparaîtra dans les résultats de recherche
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Conseil
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Un nom accrocheur et une description claire augmentent les chances de réservation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
