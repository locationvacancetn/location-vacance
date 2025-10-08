import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  SearchIcon, 
  Eye, 
  Edit, 
  Save, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Target,
  Image as ImageIcon,
  Globe,
  Share2,
  Settings,
  Wand2,
  ChevronDown,
  ChevronRight,
  Tag,
  FileText,
  Image,
  Share,
  Settings as SettingsIcon
} from 'lucide-react';
import { PropertyService, Property } from '@/lib/propertyService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Interface pour les données SEO (optimisée)
interface SEOData {
  // Meta Tags
  titleTag: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  
  // Contenu SEO
  detailedDescription: string;
  primaryKeywords: string;
  secondaryKeywords: string;
  localKeywords: string;
  longTailKeywords: string; // Nouveau : fusion des 4 types de mots-clés
  
  // Données Structurées
  propertyType: string;
  capacity: string;
  mainEquipments: string;
  includedServices: string;
  cancellationPolicy: string;
  spokenLanguages: string;
  
  // Images
  mainImageAlt: string;
  galleryAltTexts: string[];
  imageTitles: string;
  imageDescriptions: string;
  
  // Balises Sociales
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  
  // Optimisation Technique (simplifiée)
  lastUpdateDate: string;
  
  // Champs conservés pour compatibilité (masqués dans l'UI)
  seasonalKeywords: string;
  activityKeywords: string;
  comfortKeywords: string;
  geographicKeywords: string;
  priorityIndexing: string;
  redirects: string;
}

// Fonction de calcul du score SEO
const calculateSEOScore = (seoData: SEOData): number => {
  let score = 0;
  
  // Meta Tags (25 points)
  if (seoData.titleTag && seoData.titleTag.length >= 30 && seoData.titleTag.length <= 60) score += 5;
  if (seoData.metaDescription && seoData.metaDescription.length >= 120 && seoData.metaDescription.length <= 160) score += 5;
  if (seoData.metaKeywords) score += 3;
  if (seoData.canonicalUrl) score += 2;
  
  // Contenu SEO (15 points)
  if (seoData.detailedDescription && seoData.detailedDescription.length >= 300) score += 5;
  if (seoData.primaryKeywords && seoData.primaryKeywords.length > 0) score += 5;
  if (seoData.secondaryKeywords && seoData.secondaryKeywords.length > 0) score += 3;
  if (seoData.localKeywords && seoData.localKeywords.length > 0) score += 2;
  
  // Données Structurées (20 points)
  if (seoData.propertyType) score += 3;
  if (seoData.capacity) score += 2;
  if (seoData.mainEquipments && seoData.mainEquipments.length > 0) score += 5;
  if (seoData.includedServices && seoData.includedServices.length > 0) score += 3;
  if (seoData.cancellationPolicy && seoData.cancellationPolicy.length > 0) score += 2;
  if (seoData.spokenLanguages && seoData.spokenLanguages.length > 0) score += 2;
  if (seoData.seasonalKeywords && seoData.seasonalKeywords.length > 0) score += 1;
  if (seoData.activityKeywords && seoData.activityKeywords.length > 0) score += 1;
  if (seoData.comfortKeywords && seoData.comfortKeywords.length > 0) score += 1;
  
  // Images (15 points)
  if (seoData.mainImageAlt && seoData.mainImageAlt.length > 0) score += 5;
  if (seoData.galleryAltTexts && seoData.galleryAltTexts.length > 0) score += 5;
  if (seoData.imageTitles && seoData.imageTitles.length > 0) score += 3;
  if (seoData.imageDescriptions && seoData.imageDescriptions.length > 0) score += 2;
  
  // Balises Sociales (15 points)
  if (seoData.ogTitle && seoData.ogTitle.length > 0) score += 5;
  if (seoData.ogDescription && seoData.ogDescription.length > 0) score += 5;
  if (seoData.ogImage && seoData.ogImage.length > 0) score += 3;
  if (seoData.ogType && seoData.ogType.length > 0) score += 2;
  
  // Optimisation Technique (10 points)
  if (seoData.priorityIndexing && seoData.priorityIndexing !== 'normal') score += 3;
  if (seoData.lastUpdateDate && seoData.lastUpdateDate.length > 0) score += 2;
  if (seoData.redirects && seoData.redirects.length > 0) score += 2;
  if (seoData.geographicKeywords && seoData.geographicKeywords.length > 0) score += 3;
  
  return Math.min(score, 100);
};

// Fonction pour obtenir le statut du score
const getScoreStatus = (score: number) => {
  if (score >= 81) {
    return { label: 'Excellent', color: 'bg-green-500', icon: CheckCircle };
  } else if (score >= 61) {
    return { label: 'Bon', color: 'bg-blue-500', icon: TrendingUp };
  } else if (score >= 31) {
    return { label: 'Moyen', color: 'bg-yellow-500', icon: AlertCircle };
  } else {
    return { label: 'Faible', color: 'bg-red-500', icon: AlertCircle };
  }
};

// Fonction pour extraire les informations de la propriété
const extractPropertyInfo = async (property: Property) => {
  // Récupérer les équipements depuis la base de données
  const { data: equipments } = await supabase
    .from('equipments')
    .select('name')
    .in('id', property.equipment_ids || []);

  const equipmentNames = equipments?.map(eq => eq.name) || [];
  
  const mainEquipments = equipmentNames.length > 0 ? equipmentNames.join(', ') : 'Aucun équipement spécifié';
  const includedServices = equipmentNames.length > 0 ? equipmentNames.join(', ') : 'Aucun service spécifié';

  const cancellationPolicy = `Annulation gratuite jusqu'à 3 jours avant l'arrivée. Check-in: ${property.check_in_time || '14:00'}, Check-out: ${property.check_out_time || '12:00'}`;

  const spokenLanguages = 'Anglais, Français, Arabe';

  const seasonalKeywords = ['location été', 'location vacances', 'location saisonnière', 'location été ' + property.location].join(', ');
  const activityKeywords = ['plage', 'randonnée', 'culture', 'détente', 'famille'].join(', ');
  const comfortKeywords = ['confort', 'luxe', 'moderne', 'équipé', 'climatisé'].join(', ');
  const geographicKeywords = ['centre-ville', 'bord mer', 'montagne', 'campagne', property.location].join(', ');

  return {
    mainEquipments,
    includedServices,
    cancellationPolicy,
    spokenLanguages,
    seasonalKeywords,
    activityKeywords,
    comfortKeywords,
    geographicKeywords
  };
};

// Fonctions de génération automatique (améliorées)
const generatePrimaryKeywords = (property: Property): string => {
  const baseKeywords = ['location', 'vacances', property.property_type?.toLowerCase() || 'propriété'];
  const locationKeywords = property.location ? [property.location.toLowerCase()] : [];
  const featureKeywords = property.equipment_ids ? ['équipé', 'moderne'] : [];
  
  return [...baseKeywords, ...locationKeywords, ...featureKeywords].join(', ');
};

const generateSecondaryKeywords = (property: Property): string => {
  const secondary = ['villa', 'appartement', 'maison', 'piscine', 'jardin', 'terrasse'];
  const locationBased = property.location ? [`${property.location} location`, `location ${property.location}`] : [];
  
  return [...secondary, ...locationBased].join(', ');
};

const generateLocalKeywords = (property: Property): string => {
  if (!property.location) return '';
  
  const localTerms = [
    `location ${property.location}`,
    `vacances ${property.location}`,
    `location vacances ${property.location}`,
    `location saisonnière ${property.location}`
  ];
  
  return localTerms.join(', ');
};

// Nouvelle fonction : génération intelligente des mots-clés long-tail
const generateLongTailKeywords = (property: Property): string => {
  const base = property.title || 'Location de vacances';
  const location = property.location || '';
  const type = property.property_type || '';
  const capacity = property.max_guests ? `pour ${property.max_guests} personnes` : '';
  
  // Mots-clés saisonniers
  const seasonal = ['location été', 'vacances été', 'location saisonnière', 'location été ' + location];
  
  // Mots-clés d'activités
  const activities = ['plage', 'randonnée', 'culture', 'détente', 'famille', 'couple'];
  
  // Mots-clés de confort
  const comfort = ['confort', 'luxe', 'moderne', 'équipé', 'climatisé', 'piscine'];
  
  // Mots-clés géographiques
  const geographic = ['centre-ville', 'bord mer', 'montagne', 'campagne', location];
  
  // Combinaisons intelligentes
  const combinations = [
    `${base} ${location}`,
    `location ${type} ${location}`,
    `vacances ${location} ${capacity}`,
    `location ${location} avec piscine`,
    `location ${location} moderne`
  ];
  
  return [...seasonal, ...activities, ...comfort, ...geographic, ...combinations]
    .filter(term => term.trim().length > 0)
    .join(', ');
};

const generateMainImageAltText = (property: Property): string => {
  const baseDescription = property.property_type || 'Propriété';
  const location = property.location || '';
  const features = property.equipment_ids ? ' avec équipements modernes' : '';
  
  return `${baseDescription} ${location}${features} - Vue extérieure`;
};

const generateGalleryAltTexts = (property: Property): string[] => {
  if (!property.images || property.images.length <= 1) return [];
  
  return property.images.slice(1).map((_, index) => {
    const roomTypes = ['salon', 'cuisine', 'chambre', 'salle de bain', 'terrasse', 'jardin', 'piscine'];
    const roomType = roomTypes[index % roomTypes.length];
    return `${property.title} - ${roomType}`;
  });
};

const generateOpenGraphTitle = (property: Property): string => {
  const baseTitle = property.title || 'Location de vacances';
  const location = property.location ? ` à ${property.location}` : '';
  const type = property.property_type ? ` - ${property.property_type}` : '';
  
  return `${baseTitle}${location}${type}`;
};

const generateOpenGraphDescription = (property: Property): string => {
  const baseDescription = property.description || 'Propriété de vacances';
  const location = property.location ? ` située à ${property.location}` : '';
  const capacity = property.max_guests ? ` pour ${property.max_guests} personnes` : '';
  
  return `${baseDescription}${location}${capacity}. Réservez dès maintenant !`;
};

const getOptimalOpenGraphType = (property: Property): string => {
  return 'website';
};

const SEOManagement: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [seoData, setSeoData] = useState<SEOData>({
    titleTag: '',
    metaDescription: '',
    metaKeywords: '',
    canonicalUrl: '',
    detailedDescription: '',
    primaryKeywords: '',
    secondaryKeywords: '',
    localKeywords: '',
    longTailKeywords: '', // Nouveau champ
    propertyType: '',
    capacity: '',
    mainEquipments: '',
    includedServices: '',
    cancellationPolicy: '',
    spokenLanguages: '',
    mainImageAlt: '',
    galleryAltTexts: [],
    imageTitles: '',
    imageDescriptions: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogType: '',
    lastUpdateDate: '',
    // Champs conservés pour compatibilité
    seasonalKeywords: '',
    activityKeywords: '',
    comfortKeywords: '',
    geographicKeywords: '',
    priorityIndexing: 'normal',
    redirects: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openPanels, setOpenPanels] = useState({
    meta: true,
    content: false,
    images: false,
    optimization: false // Fusionné : social + technical simplifié
  });
  const { toast } = useToast();

  // Charger les propriétés au montage du composant
  useEffect(() => {
    const loadProperties = async () => {
        setIsLoading(true);
      try {
        const data = await PropertyService.getPublicProperties();
        setProperties(data);
      } catch (error) {
        console.error('Erreur lors du chargement des propriétés:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les propriétés",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [toast]);

  // Charger les données SEO d'une propriété
  const loadSEOData = async (property: Property) => {
    try {
      const { data: seoData, error } = await supabase
        .from('property_seo_data' as any)
        .select('*')
        .eq('property_id', property.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (seoData) {
        // Charger les données existantes
        const seoDataTyped = seoData as any;
        setSeoData({
          titleTag: seoDataTyped.title_tag || '',
          metaDescription: seoDataTyped.meta_description || '',
          metaKeywords: seoDataTyped.meta_keywords || '',
          canonicalUrl: seoDataTyped.canonical_url || '',
          detailedDescription: seoDataTyped.detailed_description || '',
          primaryKeywords: seoDataTyped.primary_keywords || '',
          secondaryKeywords: seoDataTyped.secondary_keywords || '',
          localKeywords: seoDataTyped.local_keywords || '',
          longTailKeywords: seoDataTyped.long_tail_keywords || '', // Nouveau champ
          propertyType: seoDataTyped.property_type || '',
          capacity: seoDataTyped.capacity || '',
          mainEquipments: seoDataTyped.main_equipments || '',
          includedServices: seoDataTyped.included_services || '',
          cancellationPolicy: seoDataTyped.cancellation_policy || '',
          spokenLanguages: seoDataTyped.spoken_languages || '',
          mainImageAlt: seoDataTyped.main_image_alt || '',
          galleryAltTexts: seoDataTyped.gallery_alt_texts || [],
          imageTitles: (seoDataTyped.image_titles || []).join(', '),
          imageDescriptions: (seoDataTyped.image_descriptions || []).join(', '),
          ogTitle: seoDataTyped.og_title || '',
          ogDescription: seoDataTyped.og_description || '',
          ogImage: seoDataTyped.og_image || '',
          ogType: seoDataTyped.og_type || '',
          lastUpdateDate: seoDataTyped.last_update_date || '',
          // Champs conservés pour compatibilité
          seasonalKeywords: seoDataTyped.seasonal_keywords || '',
          activityKeywords: seoDataTyped.activity_keywords || '',
          comfortKeywords: seoDataTyped.comfort_keywords || '',
          geographicKeywords: seoDataTyped.geographic_keywords || '',
          priorityIndexing: seoDataTyped.priority_indexing || 'normal',
          redirects: seoDataTyped.redirects || ''
        });
      } else {
        // Générer automatiquement les données SEO pour une nouvelle propriété
        await generateNewSEOData(property);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données SEO:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données SEO",
        variant: "destructive",
      });
    }
  };

  // Générer de nouvelles données SEO
  const generateNewSEOData = async (property: Property) => {
    const propertyInfo = await extractPropertyInfo(property);
    const images = property.images || [];
    const galleryAltTexts = generateGalleryAltTexts(property);
    const imageTitles = images.map((_, index) => `Image ${index + 1} - ${property.title}`);
    const imageDescriptions = images.map((_, index) => `Description de l'image ${index + 1} de ${property.title}`);
    const mainImageAlt = generateMainImageAltText(property);
    
    setSeoData({
      titleTag: property.title || '',
      metaDescription: property.description || '',
      metaKeywords: generatePrimaryKeywords(property),
      canonicalUrl: `https://votre-site.com/property/${property.id}`,
      detailedDescription: property.description || '',
      primaryKeywords: generatePrimaryKeywords(property),
      secondaryKeywords: generateSecondaryKeywords(property),
      localKeywords: generateLocalKeywords(property),
      longTailKeywords: generateLongTailKeywords(property), // Nouveau champ
      propertyType: property.property_type || '',
      capacity: property.max_guests?.toString() || '',
      mainImageAlt: mainImageAlt,
      galleryAltTexts: galleryAltTexts,
      imageTitles: imageTitles.join(', '),
      imageDescriptions: imageDescriptions.join(', '),
      ogTitle: generateOpenGraphTitle(property),
      ogDescription: generateOpenGraphDescription(property),
      ogImage: images.length > 0 ? images[0] : '',
      ogType: getOptimalOpenGraphType(property),
      mainEquipments: propertyInfo.mainEquipments,
      includedServices: propertyInfo.includedServices,
      cancellationPolicy: propertyInfo.cancellationPolicy,
      spokenLanguages: propertyInfo.spokenLanguages,
      lastUpdateDate: new Date().toISOString().split('T')[0],
      // Champs conservés pour compatibilité
      seasonalKeywords: propertyInfo.seasonalKeywords,
      activityKeywords: propertyInfo.activityKeywords,
      comfortKeywords: propertyInfo.comfortKeywords,
      geographicKeywords: propertyInfo.geographicKeywords,
      priorityIndexing: 'normal',
      redirects: ''
    });
  };

  // Gérer la sélection d'une propriété
  const handlePropertySelect = async (property: Property) => {
    setSelectedProperty(property);
    await loadSEOData(property);
  };

  // Générer automatiquement tous les mots-clés
  const generateAllKeywords = () => {
    if (!selectedProperty) return;

    const primaryKeywords = generatePrimaryKeywords(selectedProperty);
    const secondaryKeywords = generateSecondaryKeywords(selectedProperty);
    const localKeywords = generateLocalKeywords(selectedProperty);
    const longTailKeywords = generateLongTailKeywords(selectedProperty);

    setSeoData(prev => ({
      ...prev,
      primaryKeywords,
      secondaryKeywords,
      localKeywords,
      longTailKeywords
    }));

    toast({
      title: "Mots-clés générés",
      description: "Tous les mots-clés ont été générés automatiquement",
    });
  };

  // Générer automatiquement les alt texts d'images
  const generateAllImageAltTexts = () => {
    if (!selectedProperty) return;

    const mainImageAlt = generateMainImageAltText(selectedProperty);
    const galleryAltTexts = generateGalleryAltTexts(selectedProperty);
    const imageTitles = (selectedProperty.images || []).map((_, index) => `Image ${index + 1} - ${selectedProperty.title}`).join(', ');
    const imageDescriptions = (selectedProperty.images || []).map((_, index) => `Description de l'image ${index + 1} de ${selectedProperty.title}`).join(', ');

    setSeoData(prev => ({
      ...prev,
      mainImageAlt,
      galleryAltTexts,
      imageTitles,
      imageDescriptions
    }));

    toast({
      title: "Alt texts générés",
      description: "Tous les alt texts d'images ont été générés automatiquement",
    });
  };

  // Générer automatiquement les balises Open Graph
  const generateOpenGraphTags = () => {
    if (!selectedProperty) return;
    
    const ogTitle = generateOpenGraphTitle(selectedProperty);
    const ogDescription = generateOpenGraphDescription(selectedProperty);
    const ogType = getOptimalOpenGraphType(selectedProperty);

    setSeoData(prev => ({
      ...prev,
      ogTitle,
      ogDescription,
      ogType
    }));
    
    toast({
      title: "Balises Open Graph générées",
      description: "Les balises Open Graph ont été générées automatiquement",
    });
  };

  // Générer automatiquement les équipements et services
  const generateAutoEquipmentsAndServices = async () => {
    if (!selectedProperty) return;
    
    const propertyInfo = await extractPropertyInfo(selectedProperty);
    
    setSeoData(prev => ({
      ...prev,
      mainEquipments: propertyInfo.mainEquipments,
      includedServices: propertyInfo.includedServices,
      cancellationPolicy: propertyInfo.cancellationPolicy,
      spokenLanguages: propertyInfo.spokenLanguages,
      seasonalKeywords: propertyInfo.seasonalKeywords,
      activityKeywords: propertyInfo.activityKeywords,
      comfortKeywords: propertyInfo.comfortKeywords,
      geographicKeywords: propertyInfo.geographicKeywords,
    }));
    
    toast({
      title: "Équipements et services générés",
      description: "Les équipements et services ont été générés automatiquement",
    });
  };

  // Calculer le score SEO
  const seoScore = calculateSEOScore(seoData);
  const scoreStatus = getScoreStatus(seoScore);

  // Gérer l'ouverture/fermeture des panneaux
  const togglePanel = (panel: keyof typeof openPanels) => {
    setOpenPanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  // Sauvegarder les données SEO
  const handleSaveSEO = async () => {
    if (!selectedProperty) return;

    setIsSaving(true);
    try {
      // Préparer les données pour la sauvegarde
      const seoDataToSave = {
        property_id: selectedProperty.id,
        title_tag: seoData.titleTag,
        meta_description: seoData.metaDescription,
        meta_keywords: seoData.metaKeywords,
        canonical_url: seoData.canonicalUrl,
        detailed_description: seoData.detailedDescription,
        primary_keywords: seoData.primaryKeywords,
        secondary_keywords: seoData.secondaryKeywords,
        local_keywords: seoData.localKeywords,
        long_tail_keywords: seoData.longTailKeywords, // Nouveau champ
        property_type: seoData.propertyType,
        capacity: seoData.capacity,
        main_equipments: seoData.mainEquipments,
        included_services: seoData.includedServices,
        cancellation_policy: seoData.cancellationPolicy,
        spoken_languages: seoData.spokenLanguages,
        main_image_alt: seoData.mainImageAlt,
        gallery_alt_texts: seoData.galleryAltTexts,
        image_titles: seoData.imageTitles ? seoData.imageTitles.split(', ') : [],
        image_descriptions: seoData.imageDescriptions ? seoData.imageDescriptions.split(', ') : [],
        og_title: seoData.ogTitle,
        og_description: seoData.ogDescription,
        og_image: seoData.ogImage,
        og_type: seoData.ogType,
        last_update_date: new Date().toISOString().split('T')[0],
        // Champs conservés pour compatibilité
        seasonal_keywords: seoData.seasonalKeywords,
        activity_keywords: seoData.activityKeywords,
        comfort_keywords: seoData.comfortKeywords,
        geographic_keywords: seoData.geographicKeywords,
        priority_indexing: seoData.priorityIndexing,
        redirects: seoData.redirects,
        updated_at: new Date().toISOString()
      };

      // Vérifier si des données SEO existent déjà
      const { data: existingData } = await supabase
        .from('property_seo_data' as any)
        .select('id')
        .eq('property_id', selectedProperty.id)
        .single();

      let error;
      if (existingData) {
        // Mettre à jour les données existantes
        const { error: updateError } = await supabase
          .from('property_seo_data' as any)
          .update(seoDataToSave)
          .eq('property_id', selectedProperty.id);
        error = updateError;
      } else {
        // Créer de nouvelles données SEO
        const { error: insertError } = await supabase
          .from('property_seo_data' as any)
          .insert(seoDataToSave);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sauvegarde réussie",
        description: "Les données SEO ont été sauvegardées avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les données SEO",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Boutons d'action */}
      <div className="flex justify-end mb-6">
        {selectedProperty && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                // Réinitialiser les données SEO en générant de nouvelles données
                if (selectedProperty) {
                  setIsLoading(true);
                  try {
                    await generateNewSEOData(selectedProperty);
                    toast({
                      title: "Données réinitialisées",
                      description: "Les données SEO ont été réinitialisées avec de nouvelles valeurs générées automatiquement",
                    });
                  } catch (error) {
                    console.error('Erreur lors de la réinitialisation:', error);
                    toast({
                      title: "Erreur",
                      description: "Impossible de réinitialiser les données SEO",
                      variant: "destructive",
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Réinitialisation...' : 'Réinitialiser'}
            </Button>
            <Button 
              size="sm"
              onClick={handleSaveSEO}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        )}
      </div>

      {/* Sélection de propriété */}
          <Card>
            <CardHeader>
          <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
            <span>Sélectionner une propriété</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
          <Select onValueChange={(value) => {
            const property = properties.find(p => p.id === value);
            if (property) handlePropertySelect(property);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choisissez une propriété à optimiser" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.title} - {property.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            </CardContent>
          </Card>

      {selectedProperty && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score SEO et Optimisation SEO - Panneaux collapsibles */}
        <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Score SEO */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-4 w-4" />
                    Score SEO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Score global</span>
                      <div className="flex items-center gap-2">
                        <Badge className={`${scoreStatus.color} text-white`}>
                          {scoreStatus.label}
                        </Badge>
                        <span className="text-xl font-bold">{seoScore}/100</span>
                      </div>
                    </div>
                    <Progress value={seoScore} className="h-2" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <scoreStatus.icon className="h-4 w-4" />
                      <span>
                        {seoScore >= 81 
                          ? "Excellent ! Votre annonce est bien optimisée"
                          : seoScore >= 61
                          ? "Bon score, quelques améliorations possibles"
                          : seoScore >= 31
                          ? "Score moyen, plusieurs optimisations nécessaires"
                          : "Score faible, optimisations urgentes requises"
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formulaire SEO - Panneaux collapsibles */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-primaryText">
                    Optimisation SEO - {selectedProperty.title}
                </h2>

                    {/* Meta Tags */}
                <Collapsible open={openPanels.meta} onOpenChange={() => togglePanel('meta')}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="flex items-center justify-between text-base">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Meta Tags
                          </div>
                          {openPanels.meta ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="titleTag">Title Tag *</Label>
                          <Input
                            id="titleTag"
                            value={seoData.titleTag}
                              onChange={(e) => setSeoData(prev => ({ ...prev, titleTag: e.target.value }))}
                              placeholder="Titre de la page (30-60 caractères)"
                          />
                          <p className="text-xs text-muted-foreground">
                            {seoData.titleTag.length}/60 caractères
                          </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="canonicalUrl">URL Canonique</Label>
                            <Input
                              id="canonicalUrl"
                              value={seoData.canonicalUrl}
                              onChange={(e) => setSeoData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                              placeholder="https://votre-site.com/property/slug"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="metaDescription">Meta Description *</Label>
                          <Textarea
                            id="metaDescription"
                            value={seoData.metaDescription}
                            onChange={(e) => setSeoData(prev => ({ ...prev, metaDescription: e.target.value }))}
                            placeholder="Description de la page (120-160 caractères)"
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            {seoData.metaDescription.length}/160 caractères
                          </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="metaKeywords">Meta Keywords</Label>
                          <Input
                            id="metaKeywords"
                            value={seoData.metaKeywords}
                            onChange={(e) => setSeoData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                            placeholder="mots-clés, séparés, par, des, virgules"
                          />
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                    {/* Contenu SEO */}
                <Collapsible open={openPanels.content} onOpenChange={() => togglePanel('content')}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="flex items-center justify-between text-base">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Contenu SEO
                          </div>
                          {openPanels.content ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="detailedDescription">Description Détaillée *</Label>
                          <Textarea
                            id="detailedDescription"
                            value={seoData.detailedDescription}
                            onChange={(e) => setSeoData(prev => ({ ...prev, detailedDescription: e.target.value }))}
                            placeholder="Description complète de la propriété (minimum 300 caractères)"
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground">
                            {seoData.detailedDescription.length}/300 caractères minimum
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="primaryKeywords">Mots-clés Principaux *</Label>
                            <Textarea
                              id="primaryKeywords"
                              value={seoData.primaryKeywords}
                              onChange={(e) => setSeoData(prev => ({ ...prev, primaryKeywords: e.target.value }))}
                              placeholder="location villa, location vacances..."
                              rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                              Mots-clés principaux pour le référencement
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryKeywords">Mots-clés Secondaires</Label>
                            <Textarea
                              id="secondaryKeywords"
                              value={seoData.secondaryKeywords}
                              onChange={(e) => setSeoData(prev => ({ ...prev, secondaryKeywords: e.target.value }))}
                              placeholder="villa avec piscine, bord mer..."
                              rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                              Mots-clés complémentaires
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="localKeywords">Mots-clés Locaux</Label>
                            <Textarea
                              id="localKeywords"
                              value={seoData.localKeywords}
                              onChange={(e) => setSeoData(prev => ({ ...prev, localKeywords: e.target.value }))}
                              placeholder="location Sousse, location Tunis..."
                              rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                              Mots-clés géographiques pour le SEO local
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="longTailKeywords">Mots-clés Long-Tail *</Label>
                            <Textarea
                              id="longTailKeywords"
                              value={seoData.longTailKeywords}
                              onChange={(e) => setSeoData(prev => ({ ...prev, longTailKeywords: e.target.value }))}
                              placeholder="location villa avec piscine à Sousse, vacances été famille..."
                              rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                              Mots-clés spécifiques et combinés (générés automatiquement)
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <Button onClick={generateAllKeywords} className="flex items-center space-x-2">
                              <Wand2 className="h-4 w-4" />
                            <span>Générer Automatiquement</span>
                            </Button>
                          </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Images */}
                <Collapsible open={openPanels.images} onOpenChange={() => togglePanel('images')}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="flex items-center justify-between text-base">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Images
                          </div>
                          {openPanels.images ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="mainImageAlt">Alt Text Image Principale *</Label>
                          <Input
                            id="mainImageAlt"
                            value={seoData.mainImageAlt}
                            onChange={(e) => setSeoData(prev => ({ ...prev, mainImageAlt: e.target.value }))}
                            placeholder="Description de l'image principale"
                          />
                        </div>

                        {selectedProperty.images && selectedProperty.images.length > 1 && (
                        <div className="space-y-2">
                            <Label>Alt Texts Galerie</Label>
                            {selectedProperty.images.slice(1).map((image, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <img 
                                  src={image} 
                                  alt="" 
                                  className="w-16 h-12 object-cover rounded"
                                />
                                    <Input
                                      value={seoData.galleryAltTexts[index] || ''}
                                      onChange={(e) => {
                                    const newAltTexts = [...seoData.galleryAltTexts];
                                    newAltTexts[index] = e.target.value;
                                    setSeoData(prev => ({ ...prev, galleryAltTexts: newAltTexts }));
                                  }}
                                  placeholder={`Description image ${index + 2}`}
                                />
                                  </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Optimisation des Images</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="imageTitles">Titres des Images</Label>
                              <Textarea
                                id="imageTitles"
                                value={seoData.imageTitles}
                                onChange={(e) => setSeoData(prev => ({ ...prev, imageTitles: e.target.value }))}
                                placeholder="Titres séparés par des virgules"
                                rows={3}
                              />
                          </div>
                            <div className="space-y-2">
                              <Label htmlFor="imageDescriptions">Descriptions des Images</Label>
                              <Textarea
                                id="imageDescriptions"
                                value={seoData.imageDescriptions}
                                onChange={(e) => setSeoData(prev => ({ ...prev, imageDescriptions: e.target.value }))}
                                placeholder="Descriptions séparées par des virgules"
                                rows={3}
                              />
                        </div>
                      </div>
                        </div>

                        <div className="flex justify-center">
                          <Button onClick={generateAllImageAltTexts} className="flex items-center space-x-2">
                            <Wand2 className="h-4 w-4" />
                            <span>Générer Automatiquement</span>
                          </Button>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                    {/* Optimisation (Fusionné : Social + Technique) */}
                <Collapsible open={openPanels.optimization} onOpenChange={() => togglePanel('optimization')}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="flex items-center justify-between text-base">
                          <div className="flex items-center gap-2">
                            <SettingsIcon className="h-4 w-4" />
                            Optimisation
                          </div>
                          {openPanels.optimization ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-6">
                        {/* Section Open Graph */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-muted-foreground">Balises Sociales (Open Graph)</h4>
                          <div className="flex justify-center mb-4">
                            <Button onClick={generateOpenGraphTags} className="flex items-center space-x-2">
                              <Wand2 className="h-4 w-4" />
                              <span>Générer les Balises Open Graph</span>
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="ogTitle">Open Graph Title</Label>
                              <Input
                                id="ogTitle"
                                value={seoData.ogTitle}
                                onChange={(e) => setSeoData(prev => ({ ...prev, ogTitle: e.target.value }))}
                                placeholder="Titre pour les réseaux sociaux"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ogType">Open Graph Type</Label>
                              <Input
                                id="ogType"
                                value={seoData.ogType}
                                onChange={(e) => setSeoData(prev => ({ ...prev, ogType: e.target.value }))}
                                placeholder="website, article, etc."
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ogDescription">Open Graph Description</Label>
                            <Textarea
                              id="ogDescription"
                              value={seoData.ogDescription}
                              onChange={(e) => setSeoData(prev => ({ ...prev, ogDescription: e.target.value }))}
                              placeholder="Description pour les réseaux sociaux"
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ogImage">Open Graph Image URL</Label>
                            <Input
                              id="ogImage"
                              value={seoData.ogImage}
                              onChange={(e) => setSeoData(prev => ({ ...prev, ogImage: e.target.value }))}
                              placeholder="URL de l'image pour les réseaux sociaux"
                            />
                          </div>
                        </div>

                        {/* Section Données Structurées */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-muted-foreground">Données Structurées</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="propertyType">Type de Propriété</Label>
                              <Input
                                id="propertyType"
                                value={seoData.propertyType}
                                onChange={(e) => setSeoData(prev => ({ ...prev, propertyType: e.target.value }))}
                                placeholder="Villa, Appartement, Riad..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="capacity">Capacité</Label>
                              <Input
                                id="capacity"
                                value={seoData.capacity}
                                onChange={(e) => setSeoData(prev => ({ ...prev, capacity: e.target.value }))}
                                placeholder="Nombre de personnes"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="mainEquipments">Équipements Principaux</Label>
                            <Textarea
                              id="mainEquipments"
                              value={seoData.mainEquipments}
                              onChange={(e) => setSeoData(prev => ({ ...prev, mainEquipments: e.target.value }))}
                              placeholder="Piscine, Jardin, Terrasse..."
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="includedServices">Services Inclus</Label>
                            <Textarea
                              id="includedServices"
                              value={seoData.includedServices}
                              onChange={(e) => setSeoData(prev => ({ ...prev, includedServices: e.target.value }))}
                              placeholder="WiFi, Parking, Climatisation..."
                              rows={2}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="cancellationPolicy">Politique d'Annulation</Label>
                            <Textarea
                              id="cancellationPolicy"
                              value={seoData.cancellationPolicy}
                              onChange={(e) => setSeoData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                              placeholder="Conditions d'annulation..."
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="spokenLanguages">Langues Parlées</Label>
                            <Input
                              id="spokenLanguages"
                              value={seoData.spokenLanguages}
                              onChange={(e) => setSeoData(prev => ({ ...prev, spokenLanguages: e.target.value }))}
                              placeholder="Français, Anglais, Arabe..."
                            />
                          </div>
                        </div>

                        {/* Section Optimisation Technique */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-muted-foreground">Optimisation Technique</h4>
                          <div className="space-y-2">
                            <Label htmlFor="lastUpdateDate">Dernière Mise à Jour</Label>
                            <Input
                              id="lastUpdateDate"
                              type="date"
                              value={seoData.lastUpdateDate}
                              onChange={(e) => setSeoData(prev => ({ ...prev, lastUpdateDate: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">
                              Date de la dernière mise à jour du contenu (important pour Google)
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <Button onClick={generateAutoEquipmentsAndServices} className="flex items-center space-x-2">
                            <Wand2 className="h-4 w-4" />
                            <span>Générer Automatiquement</span>
                          </Button>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
                            </div>
                        </div>
                      </div>

          {/* Liste des propriétés - Droite */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SearchIcon className="h-5 w-5" />
                  <span>Propriétés</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedProperty?.id === property.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handlePropertySelect(property)}
                    >
                      <div className="flex items-center space-x-3">
                        {property.images && property.images.length > 0 && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{property.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">{property.location}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {property.property_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {property.max_guests} personnes
                            </span>
                  </div>
            </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
      )}
    </div>
  );
};

export default SEOManagement;
