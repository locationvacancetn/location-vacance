import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { showSuccess } from "@/lib/appToast";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Trash2 } from "lucide-react";
import { PropertyService, Property } from "@/lib/propertyService";

// Import des étapes du wizard
import BasicInfoStep from "./wizard-steps/BasicInfoStep.tsx";
import LocationStep from "./wizard-steps/LocationStep.tsx";
import TypeCapacityStep from "./wizard-steps/TypeCapacityStep.tsx";
import PhotosStep from "./wizard-steps/PhotosStep.tsx";
import PricingRulesStep from "./wizard-steps/PricingRulesStep.tsx";
import EquipmentRulesStep from "./wizard-steps/EquipmentRulesStep.tsx";

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
  characteristicIds: string[];
  smokingAllowed: boolean;
  petsAllowed: boolean;
  partiesAllowed: boolean;
  childrenAllowed: boolean;
}

// Étapes de base (création et édition)
const BASE_STEPS = [
  { id: 1, title: "Informations de base", description: "Nom et description" },
  { id: 2, title: "Localisation", description: "Région, ville et coordonnées" },
  { id: 3, title: "Type et capacité", description: "Type de propriété et capacité" },
  { id: 4, title: "Photos", description: "Images de la propriété" },
  { id: 5, title: "Tarification", description: "Prix et règles de séjour" },
  { id: 6, title: "Équipements", description: "Équipements et règles" },
];

// Étapes pour l'édition (même que la création)
const EDIT_STEPS = [
  ...BASE_STEPS,
];

// Données initiales du formulaire
const initialFormData: PropertyFormData = {
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
  characteristicIds: [],
  smokingAllowed: true,
  petsAllowed: true,
  partiesAllowed: true,
  childrenAllowed: true,
};

const STORAGE_KEY = 'property-wizard-data';

const AddPropertyWizard = () => {
  const navigate = useNavigate();
  const { id: propertyId } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [totalDisplayedImages, setTotalDisplayedImages] = useState(0);
  const [displayedImages, setDisplayedImages] = useState<string[]>([]);
  const [isExistingImage, setIsExistingImage] = useState<boolean[]>([]);
  const [finalImageUrls, setFinalImageUrls] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  // Déterminer les étapes selon le mode
  const steps = isEditMode ? EDIT_STEPS : BASE_STEPS;
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;


  // Détecter l'état de la sidebar
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebar = document.querySelector('[data-collapsed]');
      if (sidebar) {
        const isCollapsed = sidebar.getAttribute('data-collapsed') === 'true';
        setSidebarCollapsed(isCollapsed);
      }
    };

    // Vérifier au chargement
    checkSidebarState();

    // Observer les changements
    const observer = new MutationObserver(checkSidebarState);
    const sidebar = document.querySelector('[data-collapsed]');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['data-collapsed'] });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Sauvegarder les données dans localStorage
  const saveToLocalStorage = (data: PropertyFormData) => {
    try {
      // Convertir les File objects en objets sérialisables
      const serializableData = {
        ...data,
        photos: data.photos.map(photo => ({
          name: photo.name,
          size: photo.size,
          type: photo.type,
          lastModified: photo.lastModified,
          // Note: Les données binaires ne peuvent pas être sérialisées
          // On garde seulement les métadonnées
        }))
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Récupérer les données depuis localStorage
  const loadFromLocalStorage = (): PropertyFormData | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restaurer les données, mais les photos seront perdues (normal)
        return {
          ...parsed,
          photos: [] // Les photos ne peuvent pas être restaurées depuis localStorage
        };
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
    return null;
  };

  // Nettoyer le localStorage
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  };

  // Fonction pour effacer manuellement les données
  const handleClearData = () => {
    clearLocalStorage();
    setFormData(initialFormData);
    setCurrentStep(1);
    
    // Remettre à zéro tous les états liés aux images
    setExistingImageUrls([]);
    setTotalDisplayedImages(0);
    setDisplayedImages([]);
    setIsExistingImage([]);
    setFinalImageUrls([]);
    
    toast({
      title: "Données effacées",
      description: "Toutes les données sauvegardées ont été supprimées.",
    });
  };

  const updateFormData = (updates: Partial<PropertyFormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      // Sauvegarder automatiquement à chaque changement
      saveToLocalStorage(newData);
      return newData;
    });
  };

  // Fonction de validation des coordonnées GPS
  const validateCoordinates = (latitude: string, longitude: string): boolean => {
    // Vérifier que les coordonnées ne sont pas vides
    if (!latitude || !longitude || latitude.trim() === '' || longitude.trim() === '') {
      return false;
    }
    
    // Convertir en nombres
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    // Vérifier que ce sont des nombres valides
    if (isNaN(lat) || isNaN(lng)) {
      return false;
    }
    
    // Vérifier les plages de coordonnées
    if (lat < -90 || lat > 90) {
      return false;
    }
    
    if (lng < -180 || lng > 180) {
      return false;
    }
    
    return true;
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
    if (currentStep < steps.length) {
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

  // Charger les données au démarrage
  useEffect(() => {
    if (propertyId) {
      // Mode édition : charger les données de la propriété
      setIsEditMode(true);
      loadPropertyData(propertyId);
    } else {
      // Mode création : charger les données sauvegardées
      const savedData = loadFromLocalStorage();
      if (savedData) {
        setFormData(savedData);
      }
    }
  }, [propertyId]);

  // Charger les données d'une propriété existante
  const loadPropertyData = async (id: string) => {
    try {
      setIsLoading(true);
      const property = await PropertyService.getPropertyById(id);
      
      // Convertir les données de la propriété en format PropertyFormData
      const propertyFormData: PropertyFormData = {
        name: property.title || "",
        description: property.description || "",
        regionId: property.region_id || "",
        cityId: property.city_id || "",
        address: property.location || "",
        longitude: property.longitude || "",
        latitude: property.latitude || "",
        propertyTypeId: property.property_type_id || "",
        maxGuests: property.max_guests || 1,
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        photos: [], // Les photos existantes seront gérées dans PhotosStep
        basePrice: property.price_per_night || 10,
        checkInTime: property.check_in_time || "",
        checkOutTime: property.check_out_time || "",
        minNights: property.min_nights || 1,
        equipmentIds: property.amenities || [],
        characteristicIds: property.characteristic_ids || [],
        smokingAllowed: property.smoking_allowed ?? true,
        petsAllowed: property.pets_allowed ?? true,
        partiesAllowed: property.parties_allowed ?? true,
        childrenAllowed: property.children_allowed ?? true,
      };
      
      setFormData(propertyFormData);
      
      console.log('Données de la propriété chargées:', {
        characteristicIds: property.characteristic_ids,
        equipmentIds: property.amenities
      });
      
      // Stocker les URLs des images existantes pour PhotosStep
      if (property.images && property.images.length > 0) {
        // On va passer les URLs existantes à PhotosStep via un état séparé
        setExistingImageUrls(property.images);
        setDisplayedImages(property.images);
        setIsExistingImage(new Array(property.images.length).fill(true));
        setTotalDisplayedImages(property.images.length);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la propriété:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la propriété",
        variant: "destructive",
      });
      navigate('/dashboard/properties');
    } finally {
      setIsLoading(false);
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
        return formData.name.trim().length >= 5 && formData.description.trim().length >= 20;
      case 2:
        // Validation des champs obligatoires de localisation
        const hasCityAndRegion = formData.cityId !== "" && formData.regionId !== "";
        
        // Validation des coordonnées GPS
        const hasValidCoordinates = validateCoordinates(formData.latitude, formData.longitude);
        
        return hasCityAndRegion && hasValidCoordinates;
      case 3:
        return formData.propertyTypeId !== "" && 
               formData.maxGuests >= 1 && formData.maxGuests <= 50 && 
               formData.bedrooms >= 1 && formData.bedrooms <= 20 && 
               formData.bathrooms >= 1 && formData.bathrooms <= 20;
      case 4:
        // En mode édition, on utilise le nombre total d'images affichées
        if (isEditMode) {
          return totalDisplayedImages >= 5;
        }
        return formData.photos.length >= 5;
      case 5:
        return formData.basePrice > 10 && formData.minNights >= 1 && formData.minNights <= 365;
      case 6:
        return true; // Les équipements et règles sont optionnels
      case 7:
        return true; // La disponibilité est optionnelle
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
      if (isEditMode && propertyId) {
        // Mode édition
        console.log("Modification de la propriété avec les données:", formData);
        
        const updatedProperty = await PropertyService.updateProperty(propertyId, formData, finalImageUrls);
        
        console.log("Propriété modifiée avec succès:", updatedProperty);
        
        showSuccess({
          title: "Succès",
          description: `Propriété "${updatedProperty.title}" modifiée avec succès !`,
        });
        
        // Redirection vers la gestion des propriétés
        navigate('/dashboard/owner/properties');
      } else {
        // Mode création
        console.log("Création de la propriété avec les données:", formData);
        
        const createdProperty = await PropertyService.createProperty(formData);
        
        console.log("Propriété créée avec succès:", createdProperty);
        
        // ✅ Nettoyer le localStorage après succès
        clearLocalStorage();
        
        showSuccess({
          title: "Succès",
          description: `Propriété "${createdProperty.title}" créée avec succès !`,
        });
        
        // Redirection vers la gestion des propriétés
        navigate('/dashboard/properties');
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      
      // Gestion d'erreurs plus détaillée
      let errorMessage = isEditMode 
        ? "Impossible de modifier la propriété." 
        : "Impossible de créer la propriété. Vos données sont sauvegardées.";
      
      if (error instanceof Error) {
        if (error.message.includes('Ville invalide')) {
          errorMessage = "La ville sélectionnée n'est pas valide. Veuillez vérifier votre sélection.";
        } else if (error.message.includes('Région invalide')) {
          errorMessage = "La région sélectionnée n'est pas valide ou n'appartient pas à la ville choisie.";
        } else if (error.message.includes('Type de propriété invalide')) {
          errorMessage = "Le type de propriété sélectionné n'est pas valide.";
        } else if (error.message.includes('Minimum 5 images')) {
          errorMessage = "Vous devez ajouter au minimum 5 images à votre propriété.";
        } else if (error.message.includes('Maximum 20 images')) {
          errorMessage = "Vous ne pouvez pas ajouter plus de 20 images.";
        } else if (error.message.includes('Utilisateur non authentifié')) {
          errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        } else if (error.message.includes('Format de longitude invalide')) {
          errorMessage = "Format de longitude invalide. Utilisez le format: -180.123456";
        } else if (error.message.includes('Format de latitude invalide')) {
          errorMessage = "Format de latitude invalide. Utilisez le format: 36.123456";
        } else if (error.message.includes('check_coordinates_format')) {
          errorMessage = "Format des coordonnées GPS invalide. Vérifiez la longitude et latitude.";
        } else {
          errorMessage = `Erreur: ${error.message}`;
        }
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      
      // En cas d'erreur, on garde les données dans localStorage (mode création seulement)
      if (!isEditMode) {
        // Mode création : garder les données
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <LocationStep formData={formData} updateFormData={updateFormData} isEditMode={isEditMode} />;
      case 3:
        return <TypeCapacityStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <PhotosStep 
          formData={formData} 
          updateFormData={updateFormData} 
          existingImageUrls={existingImageUrls}
          isEditMode={isEditMode}
          onTotalImagesChange={setTotalDisplayedImages}
          displayedImages={displayedImages}
          setDisplayedImages={setDisplayedImages}
          isExistingImage={isExistingImage}
          setIsExistingImage={setIsExistingImage}
          onFinalImagesChange={setFinalImageUrls}
        />;
      case 5:
        return <PricingRulesStep formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <EquipmentRulesStep formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  // Affichage de chargement pour le mode édition
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des données de la propriété...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec progression */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            <span><strong>Étape</strong> {currentStep} sur {steps.length}</span>
          </div>
          
          {/* Bouton Effacer - Discret avec Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground border-muted-foreground/30 hover:text-white hover:bg-gray-800 hover:border-gray-600"
                title="Effacer toutes les données sauvegardées"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Effacer les données</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir effacer toutes les données sauvegardées ?              
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearData}
                  className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                >
                  Effacer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Timeline avec points numérotés */}
        <div className="flex items-center justify-between" style={{ marginBottom: '40px' }}>
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step.id === currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : step.id < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-muted mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

       {/* Contenu de l'étape actuelle */}
       <div className="pb-20 md:pb-24">
         {renderCurrentStep()}
       </div>

            {/* Navigation - Mobile */}
            <div className="md:hidden flex justify-between items-center">
              <Button
                type="button"
                onClick={() => {
                  prevStep();
                  // Scroll immédiat pour mobile
                  setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }, 10);
                }}
                disabled={currentStep === 1 || isSubmitting}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:!text-white px-4 py-2 bg-[#32323a] text-white hover:bg-[#3a3a42] h-10 w-10 p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              {currentStep === steps.length ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!validateCurrentStep() || isSubmitting}
                  className="h-10 w-10 p-0 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
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
                  className="h-10 w-10 p-0"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}
            </div>

       {/* Navigation - Desktop - Position fixe en bas */}
       <div 
         className="hidden md:flex fixed bottom-0 z-50 bg-white px-6 py-4 justify-between items-center transition-all duration-300 left-0 right-0"
         style={{ marginLeft: sidebarCollapsed ? '64px' : '224px' }}
       >
         <Button
           type="button"
           onClick={prevStep}
           disabled={currentStep === 1 || isSubmitting}
           className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:!text-white px-4 py-2 bg-[#32323a] text-white hover:bg-[#3a3a42] min-w-[120px]"
         >
           <ArrowLeft className="h-4 w-4" />
           Précédent
         </Button>

         {currentStep === steps.length ? (
           <Button
             type="button"
             onClick={handleSubmit}
             disabled={!validateCurrentStep() || isSubmitting}
             className="flex items-center gap-2 min-w-[120px] bg-green-600 hover:bg-green-700"
           >
             {isSubmitting ? (
               isEditMode ? "Modification..." : "Création..."
             ) : (
               <>
                 <Check className="h-4 w-4" />
                 {isEditMode ? "Modifier" : "Créer"}
               </>
             )}
           </Button>
         ) : (
           <Button
             type="button"
             onClick={nextStep}
             disabled={!validateCurrentStep()}
             className="flex items-center gap-2 min-w-[120px]"
           >
             Suivant
             <ArrowRight className="h-4 w-4" />
           </Button>
         )}
       </div>
    </div>
  );
};

export default AddPropertyWizard;
