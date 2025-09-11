import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  MapPin, 
  Users, 
  Camera, 
  Euro, 
  Settings,
  ArrowRight,
  CheckCircle
} from "lucide-react";

// Fonction pour nettoyer le localStorage
const clearPropertyWizardData = () => {
  try {
    localStorage.removeItem('property-wizard-data');
  } catch (error) {
    console.error('Erreur lors du nettoyage du localStorage:', error);
  }
};

const PropertyWizardDemo = () => {
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      title: "Informations de base",
      description: "Nom et description de la propriété",
      icon: Home,
      color: "bg-blue-500",
      features: ["Nom de la propriété", "Description courte", "Validation des champs"]
    },
    {
      id: 2,
      title: "Localisation",
      description: "Région, ville et coordonnées GPS",
      icon: MapPin,
      color: "bg-green-500",
      features: ["Sélection région/ville", "Adresse complète", "Coordonnées GPS", "Validation géographique"]
    },
    {
      id: 3,
      title: "Type et capacité",
      description: "Type de propriété et nombre d'invités",
      icon: Users,
      color: "bg-purple-500",
      features: ["Type de propriété", "Capacité max", "Chambres", "Salles de bain"]
    },
    {
      id: 4,
      title: "Photos",
      description: "Images attractives de la propriété",
      icon: Camera,
      color: "bg-orange-500",
      features: ["Upload drag & drop", "5-20 photos", "Prévisualisation", "Validation mobile"]
    },
    {
      id: 5,
      title: "Tarification",
      description: "Prix et règles de séjour",
      icon: Euro,
      color: "bg-yellow-500",
      features: ["Prix par nuitée", "Horaires check-in/out", "Durée minimum", "Validation tarifaire"]
    },
    {
      id: 6,
      title: "Équipements",
      description: "Équipements et règles de la propriété",
      icon: Settings,
      color: "bg-red-500",
      features: ["Sélection équipements", "Règles (fumer, animaux)", "Interface tactile", "Validation finale"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Wizard d'Ajout de Propriété
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Interface mobile-friendly pour créer facilement une nouvelle propriété
          </p>
          <Button
            onClick={() => {
              clearPropertyWizardData();
              navigate('/dashboard/owner/add-property');
            }}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            Commencer le wizard
          </Button>
        </div>

        {/* Fonctionnalités principales */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">
              Fonctionnalités du Wizard
            </CardTitle>
            <CardDescription className="text-center">
              Design optimisé pour mobile avec validation en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Design mobile-first</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Validation en temps réel</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Navigation intuitive</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Upload de photos drag & drop</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Intégration base de données</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Sauvegarde progressive</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Étapes du wizard */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Les 6 Étapes du Wizard
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => (
              <Card key={step.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full ${step.color} flex items-center justify-center mb-4`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    {step.title}
                  </CardTitle>
                  <CardDescription>
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {step.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Badge variant="secondary" className="mt-4 w-full justify-center">
                    Étape {step.id}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">
              Prêt à ajouter votre première propriété ?
            </h3>
            <p className="text-blue-100 mb-6">
              Le wizard vous guide étape par étape pour créer une annonce complète et attractive
            </p>
            <Button
              onClick={() => {
                clearPropertyWizardData();
                navigate('/dashboard/owner/add-property');
              }}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Commencer maintenant
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyWizardDemo;
