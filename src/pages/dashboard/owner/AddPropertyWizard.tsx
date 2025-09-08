import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

// Import des étapes du wizard
import BasicInfoStep from "./wizard-steps/BasicInfoStep";
import LocationStep from "./wizard-steps/LocationStep";
import TypeCapacityStep from "./wizard-steps/TypeCapacityStep";
import PhotosStep from "./wizard-steps/PhotosStep";
import PricingRulesStep from "./wizard-steps/PricingRulesStep";
import EquipmentRulesStep from "./wizard-steps/EquipmentRulesStep";

// Types pour les données du formulaire
export interface PropertyFormData {
  // Étape 1: Informations de base
  name: string;
  description: string;
  
  // Étape 2: Localisation
  regionId: string;
  cityId: string;
  address: string;
  longitude: string;
  latitude: string;
  
  // Étape 3: Type et capacité
  propertyTypeId: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  
  // Étape 4: Photos
  photos: File[];
  
  // Étape 5: Tarification et règles
  basePrice: number;
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  
  // Étape 6: Équipements et règles
  equipmentIds: string[];
  smokingAllowed: boolean;
  petsAllowed: boolean;
  partiesAllowed: boolean;
  childrenAllowed: boolean;
}

const STEPS = [
  { id: 1, title: "Informations de base", description: "Nom et description" },
  { id: 2, title: "Localisation", description: "Région, ville et coordonnées" },
  { id: 3, title: "Type et capacité", description: "Type de propriété et capacité" },
  { id: 4, title: "Photos", description: "Images de la propriété" },
  { id: 5, title: "Tarification", description: "Prix et règles de séjour" },
  { id: 6, title: "Équipements", description: "Équipements et règles" },
];

const AddPropertyWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>({
    name: "",
    description: "",
    regionId: "",
    cityId: "",
    address: "",
    longitude: "",
    latitude: "",
    propertyTypeId: "",
    maxGuests: 0,
    bedrooms: 0,
    bathrooms: 0,
    photos: [],
    basePrice: 0,
    checkInTime: "",
    checkOutTime: "",
    minNights: 0,
    equipmentIds: [],
    smokingAllowed: false,
    petsAllowed: false,
    partiesAllowed: false,
    childrenAllowed: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const progress = (currentStep / STEPS.length) * 100;

  const updateFormData = (updates: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const scrollToTop = () => {
    // Méthode spéciale pour mobile
    const scrollToTopMobile = () => {
      // Essayer plusieurs méthodes pour mobile
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Forcer le scroll sur l'élément principal
      const mainElement = document.querySelector('main') || document.querySelector('.dashboard-content') || document.body;
      if (mainElement) {
        mainElement.scrollTop = 0;
        mainElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
      
      // Essayer de scroller vers le dashboard header
      const headerElement = document.querySelector('[data-testid="dashboard-header"]') || document.querySelector('header');
      if (headerElement) {
        headerElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    };

    // Utiliser requestAnimationFrame pour mobile
    requestAnimationFrame(() => {
      scrollToTopMobile();
    });
    
    // Fallback avec setTimeout
    setTimeout(() => {
      scrollToTopMobile();
    }, 50);
    
    setTimeout(() => {
      scrollToTopMobile();
    }, 150);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      scrollToTop();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      scrollToTop();
    }
  };

  // Scroll automatique vers le haut à chaque changement d'étape
  useEffect(() => {
    // Méthode spéciale pour mobile
    const scrollToTopMobile = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Forcer le scroll sur l'élément principal
      const mainElement = document.querySelector('main') || document.querySelector('.dashboard-content') || document.body;
      if (mainElement) {
        mainElement.scrollTop = 0;
        mainElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
      
      // Essayer de scroller vers le dashboard header
      const headerElement = document.querySelector('[data-testid="dashboard-header"]') || document.querySelector('header');
      if (headerElement) {
        headerElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    };

    // Utiliser requestAnimationFrame pour mobile
    requestAnimationFrame(() => {
      scrollToTopMobile();
    });
    
    // Fallback avec setTimeout
    const timer1 = setTimeout(() => {
      scrollToTopMobile();
    }, 100);
    
    const timer2 = setTimeout(() => {
      scrollToTopMobile();
    }, 250);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [currentStep]);

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== "";
      case 2:
        return formData.cityId !== "" && formData.regionId !== "";
      case 3:
        return formData.propertyTypeId !== "" && formData.maxGuests > 0 && formData.bedrooms > 0 && formData.bathrooms > 0;
      case 4:
        return formData.photos.length >= 5;
      case 5:
        return formData.basePrice > 0 && formData.minNights > 0;
      case 6:
        return true; // Les équipements et règles sont optionnels
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implémenter la sauvegarde en base de données
      console.log("Données du formulaire:", formData);
      
      toast({
        title: "Succès",
        description: "Propriété créée avec succès !",
      });
      
      // Redirection vers le dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la propriété",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <LocationStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <TypeCapacityStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <PhotosStep formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <PricingRulesStep formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <EquipmentRulesStep formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec progression */}
      <div className="md:hidden space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Étape {currentStep} sur {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Header avec progression - Desktop */}
      <Card className="hidden md:block">
        <CardHeader className="pb-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Étape {currentStep} sur {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Contenu de l'étape actuelle */}
      <div className="md:hidden">
        {renderCurrentStep()}
      </div>
      
      {/* Contenu de l'étape actuelle - Desktop */}
      <Card className="hidden md:block">
        <CardContent className="p-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>

            {/* Navigation - Mobile */}
            <div className="md:hidden flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => {
                  prevStep();
                  // Scroll immédiat pour mobile
                  setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }, 10);
                }}
                disabled={currentStep === 1}
                className="h-12 w-12 p-0 bg-black text-white hover:bg-gray-800 border-black"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              {currentStep === STEPS.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateCurrentStep() || isSubmitting}
                  className="h-12 w-12 p-0 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    nextStep();
                    // Scroll immédiat pour mobile
                    setTimeout(() => {
                      window.scrollTo(0, 0);
                      document.documentElement.scrollTop = 0;
                      document.body.scrollTop = 0;
                    }, 10);
                  }}
                  disabled={!validateCurrentStep()}
                  className="h-12 w-12 p-0"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}
            </div>

      {/* Navigation - Desktop */}
      <Card className="hidden md:block">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 min-w-[120px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>

            <div className="flex gap-2">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full ${
                    step.id <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {currentStep === STEPS.length ? (
              <Button
                onClick={handleSubmit}
                disabled={!validateCurrentStep() || isSubmitting}
                className="flex items-center gap-2 min-w-[120px] bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  "Création..."
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Créer
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!validateCurrentStep()}
                className="flex items-center gap-2 min-w-[120px]"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPropertyWizard;
