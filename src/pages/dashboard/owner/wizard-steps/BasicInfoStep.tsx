import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyFormData } from "../AddPropertyWizard";
import { FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useTitleValidation } from "@/hooks/useTitleValidation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface BasicInfoStepProps {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
  isEditMode?: boolean;
  onTitleValidationChange?: (isValid: boolean) => void;
}

const BasicInfoStep = ({ formData, updateFormData, isEditMode, onTitleValidationChange }: BasicInfoStepProps) => {
  const { userRole } = useUserRole();
  const [owners, setOwners] = useState<Array<{id: string, full_name: string, email: string}>>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  
  // Validation du titre en temps réel
  const titleValidation = useTitleValidation(formData.name, isEditMode ? formData.id : undefined);
  
  // Charger la liste des propriétaires pour les admins
  useEffect(() => {
    if (userRole === 'admin') {
      loadOwners();
    }
  }, [userRole]);

  const loadOwners = async () => {
    setLoadingOwners(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('role', ['owner', 'admin'])
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setOwners((data || []).map(owner => ({ id: owner.user_id, full_name: owner.full_name, email: owner.email })));
    } catch (error) {
      console.error('Erreur lors du chargement des propriétaires:', error);
    } finally {
      setLoadingOwners(false);
    }
  };
  
  // Notifier le parent du statut de validation du titre
  useEffect(() => {
    if (onTitleValidationChange) {
      const isValid = titleValidation.status === 'idle' || titleValidation.status === 'available' || titleValidation.status === 'error';
      onTitleValidationChange(isValid);
    }
  }, [titleValidation.status, onTitleValidationChange]);
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
        {/* Champ propriétaire - Visible seulement pour les admins */}
        {userRole === 'admin' && (
          <div>
            <Label htmlFor="property-owner" className="text-sm font-medium">
              Propriétaire de l'annonce *
            </Label>
            <div className="relative">
              <Select
                value={formData.ownerId || ''}
                onValueChange={(value) => updateFormData({ ownerId: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un propriétaire" />
                </SelectTrigger>
                <SelectContent>
                  {loadingOwners ? (
                    <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement des propriétaires...
                    </div>
                  ) : (
                    owners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        <div className="flex items-center justify-between text-left w-full">
                          <span className="font-medium">{owner.full_name || 'Nom non renseigné'}</span>
                          <span className="text-xs text-muted-foreground ml-2">{owner.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="property-name" className="text-sm font-medium">
            Nom de la propriété *
          </Label>
          <div className="relative">
            <Input
              id="property-name"
              type="text"
              placeholder="Villa de luxe avec piscine"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              className="mt-1 text-sm placeholder:text-muted-foreground/70 pr-10"
              required
              minLength={5}
              maxLength={200}
            />
            {/* Icône de validation */}
            {titleValidation.status === 'checking' && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {titleValidation.status === 'available' && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle className="h-4 w-4 text-green-600 font-bold" />
              </div>
            )}
            {titleValidation.status === 'conflict' && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
            )}
          </div>
          
          {/* Messages de validation */}
          {formData.name.length > 0 && formData.name.length < 5 && (
            <div className="flex justify-end mt-1">
              <p className="text-xs font-medium text-error">
                Le nom doit contenir au moins 5 caractères
              </p>
            </div>
          )}
          
          {/* Message de validation du titre */}
          {titleValidation.status !== 'idle' && titleValidation.message && (
            <div className="flex justify-end mt-1">
              <p className={`text-xs font-medium ${
                titleValidation.status === 'available' ? 'text-green-600' :
                titleValidation.status === 'conflict' ? 'text-red-600' :
                titleValidation.status === 'error' ? 'text-orange-600' :
                'text-muted-foreground'
              }`}>
                {titleValidation.message}
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
