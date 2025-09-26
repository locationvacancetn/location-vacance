import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Navbar from "@/components/Navbar";
import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format, isAfter, isBefore, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PropertyService, Property } from "@/lib/propertyService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Configuration des icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import {
  MapPin,
  Star,
  Heart,
  Share2,
  Printer,
  Calendar as CalendarIcon,
  Users,
  Bed,
  ShowerHead,
  House,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Eye,
  Wifi,
  Car,
  Coffee,
  Waves,
  Mountain,
  TreePine,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // États pour les données de la propriété
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [characteristics, setCharacteristics] = useState<Array<{id: string, name: string, icon: string | null}>>([]);
  const [equipments, setEquipments] = useState<Array<{id: string, name: string, icon: string | null}>>([]);
  
  // États pour la disponibilité des propriétés
  const [propertyAvailability, setPropertyAvailability] = useState<Array<{
    id: string;
    date: string;
    is_available: boolean;
    reason: string | null;
  }>>([]);
  
  // États pour la galerie d'images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // États pour le calendrier de réservation
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [isSelectingCheckOut, setIsSelectingCheckOut] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
    pets: 0
  });

  // États pour les services supplémentaires
  const [additionalServices, setAdditionalServices] = useState({
    gardening: false,
    housekeeping: false
  });

  // Images de la propriété selon l'ordre des images fournies
  const propertyImages = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop", // Piscine principale
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop", // Cuisine moderne
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop", // Terrasse extérieure
    "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop", // Salon avec billard
    "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&h=600&fit=crop", // Extérieur villa
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop", // Chambre moderne
    "https://images.unsplash.com/photo-1556912167-f556f1a2bb2e?w=800&h=600&fit=crop", // Salle de bain luxueuse
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop", // Vue de nuit
    "https://images.unsplash.com/photo-1560448204-e1a8505bfd21?w=800&h=600&fit=crop", // Autre chambre
    "https://images.unsplash.com/photo-1565623833408-d77e39b88af6?w=800&h=600&fit=crop", // Jardin
    "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&h=600&fit=crop", // Vue terrasse
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop"  // Détail intérieur
  ];

  // État pour la galerie complète
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // État pour le modal de réservation mobile
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // État pour l'affichage des points forts
  const [showAllCharacteristics, setShowAllCharacteristics] = useState(false);

  // État pour l'affichage des équipements
  const [showAllEquipments, setShowAllEquipments] = useState(false);

  // Charger les données de la propriété et les réservations
  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        toast({
          title: "Erreur",
          description: "ID de propriété manquant",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const propertyData = await PropertyService.getPropertyById(id);
        setProperty(propertyData);
        
        // Charger la disponibilité pour cette propriété
        await loadPropertyAvailability(id);
        
        // Charger les caractéristiques de la propriété
        await loadPropertyCharacteristics(propertyData);
        
        // Charger les équipements de la propriété
        await loadPropertyEquipments(propertyData);
      } catch (error) {
        console.error("Erreur lors du chargement de la propriété:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de la propriété",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [id, toast]);

  // Fonction pour charger la disponibilité depuis la base de données
  const loadPropertyAvailability = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('property_availability')
        .select('*')
        .eq('property_id', propertyId)
        .order('date', { ascending: true });

      if (error) {
        console.error("Erreur lors du chargement de la disponibilité:", error);
        throw error;
      }

      setPropertyAvailability(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement de la disponibilité:", error);
    }
  };

  // Fonction pour charger les caractéristiques de la propriété
  const loadPropertyCharacteristics = async (propertyData: Property) => {
    try {
      if (propertyData.characteristic_ids && propertyData.characteristic_ids.length > 0) {
        const { data, error } = await supabase
          .from('property_characteristics')
          .select('id, name, icon')
          .in('id', propertyData.characteristic_ids)
          .eq('is_active', true);

        if (error) {
          console.error("Erreur lors du chargement des caractéristiques:", error);
          throw error;
        }

        setCharacteristics(data || []);
      } else {
        setCharacteristics([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des caractéristiques:", error);
      setCharacteristics([]);
    }
  };

  // Fonction pour charger les équipements de la propriété
  const loadPropertyEquipments = async (propertyData: Property) => {
    try {
      // Utiliser le champ amenities qui contient les IDs des équipements
      if (propertyData.amenities && propertyData.amenities.length > 0) {
        const { data, error } = await supabase
          .from('equipments')
          .select('id, name, icon')
          .in('id', propertyData.amenities)
          .eq('is_active', true);

        if (error) {
          console.error("Erreur lors du chargement des équipements:", error);
          throw error;
        }

        setEquipments(data || []);
      } else {
        setEquipments([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des équipements:", error);
      setEquipments([]);
    }
  };

  // Navigation de la galerie
  const nextImage = () => {
    const images = property?.images || propertyImages;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = property?.images || propertyImages;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Logique de sélection des dates
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) return;

    const today = startOfDay(new Date());
    const selectedDate = startOfDay(date);

    if (isBefore(selectedDate, today)) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(selectedDate);
      setCheckOut(undefined);
      setIsSelectingCheckOut(true);
    } else if (checkIn && !checkOut) {
      if (isAfter(selectedDate, checkIn) || selectedDate.getTime() === checkIn.getTime()) {
        setCheckOut(selectedDate);
        setIsSelectingCheckOut(false);
        setIsCalendarOpen(false);
      } else {
        setCheckIn(selectedDate);
        setCheckOut(undefined);
        setIsSelectingCheckOut(true);
      }
    }
  }, [checkIn, checkOut]);

  const handleClearDates = useCallback(() => {
    setCheckIn(undefined);
    setCheckOut(undefined);
    setIsSelectingCheckOut(false);
  }, []);

  // Navigation du calendrier
  const goToPreviousMonth = () => {
    const today = new Date();
    const currentMonthStart = startOfMonth(currentMonth);
    const todayMonthStart = startOfMonth(today);
    
    // Ne pas permettre de revenir en arrière si on est déjà au mois actuel
    if (currentMonthStart > todayMonthStart) {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfDay(monthStart);
    
    // Ajuster le début pour commencer le lundi
    const startCalendar = new Date(startDate);
    const dayOfWeek = getDay(startDate);
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startCalendar.setDate(startDate.getDate() - daysToSubtract);
    
    // Calculer la fin du calendrier pour s'arrêter à la fin du mois
    const endCalendar = new Date(monthEnd);
    const endDayOfWeek = getDay(monthEnd);
    const daysToAdd = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
    endCalendar.setDate(monthEnd.getDate() + daysToAdd);
    
    // Générer les jours nécessaires (pas forcément 42)
    const days = [];
    const currentDate = new Date(startCalendar);
    while (currentDate <= endCalendar) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Vérifier l'état d'une date basé sur la disponibilité réelle
  const getDateStatus = (date: Date) => {
    const today = startOfDay(new Date());
    const checkDate = startOfDay(date);
    
    // Si la date est dans le passé, elle n'est pas disponible
    if (isBefore(checkDate, today)) {
      return 'past';
    }
    
    // Vérifier si la date a une entrée dans property_availability
    const availabilityEntry = propertyAvailability.find(entry => 
      isSameDay(new Date(entry.date), checkDate)
    );
    
    if (availabilityEntry) {
      // Si la date est marquée comme non disponible, elle est réservée
      return availabilityEntry.is_available ? 'available' : 'reserved';
    }
    
    // Par défaut, la date est disponible
    return 'available';
  };

  // Gérer le clic sur une date
  const handleDateClick = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return;
    
    const status = getDateStatus(date);
    if (status === 'reserved') return;
    
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(undefined);
      setIsSelectingCheckOut(true);
    } else if (checkIn && !checkOut) {
      if (isAfter(date, checkIn) || isSameDay(date, checkIn)) {
        setCheckOut(date);
        setIsSelectingCheckOut(false);
      } else {
        setCheckIn(date);
        setCheckOut(undefined);
        setIsSelectingCheckOut(true);
      }
    }
  };

  // Afficher le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de la propriété...</p>
          </div>
        </div>
      </div>
    );
  }

  // Afficher l'erreur si pas de propriété
  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Propriété non trouvée</h1>
            <p className="text-muted-foreground mb-4">Cette propriété n'existe pas ou a été supprimée.</p>
            <Button onClick={() => window.history.back()}>
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Utiliser les images de la propriété ou les images par défaut
  const displayImages = property.images && property.images.length > 0 ? property.images : propertyImages;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-1 pb-20 md:pb-8">
        {/* Galerie d'images selon le design des images fournies */}
        <div className="w-full mb-2">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Layout desktop: 1 grande photo à gauche, 4 petites à droite */}
            <div className="hidden md:grid md:grid-cols-2 gap-2 h-[500px]">
              {/* Image principale statique (plus grande, à gauche) */}
              <div className="relative group overflow-hidden rounded-lg">
                <img
                  src={displayImages[0]}
                  alt={`${property.title} - Image principale`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(0);
                    setIsGalleryOpen(true);
                  }}
                />
              </div>
              
              {/* Grille d'images secondaires (2x2, à droite) */}
              <div className="grid grid-cols-2 gap-2 h-full">
                {displayImages.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative group cursor-pointer overflow-hidden rounded-lg h-[248px]">
                    <img
                      src={image}
                      alt={`${property.title} ${index + 2}`}
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setCurrentImageIndex(index + 1);
                        setIsGalleryOpen(true);
                      }}
                    />
                    {index === 3 && displayImages.length > 5 && (
                      <div 
                        className="absolute bottom-2 right-2"
                      >
                        <Button 
                          size="sm"
                          className="bg-white/90 hover:bg-white text-black text-xs font-medium px-3 py-1 h-7 rounded-md shadow-sm backdrop-blur-sm border border-white/20"
                          onClick={() => {
                            setCurrentImageIndex(0);
                            setIsGalleryOpen(true);
                          }}
                        >
                          Plus de Photos
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Layout mobile: 1 grande photo en haut, 4 petites en dessous */}
            <div className="md:hidden space-y-2">
              {/* Image principale mobile statique */}
              <div className="relative group overflow-hidden rounded-lg">
                <img
                  src={displayImages[0]}
                  alt={property.title}
                  className="w-full h-64 object-cover cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(0);
                    setIsGalleryOpen(true);
                  }}
                />
              </div>
              
              {/* Grille mobile 2x2 */}
              <div className="grid grid-cols-2 gap-2">
                {displayImages.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative group cursor-pointer overflow-hidden rounded-lg h-32">
                    <img
                      src={image}
                      alt={`${property.title} ${index + 2}`}
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setCurrentImageIndex(index + 1);
                        setIsGalleryOpen(true);
                      }}
                    />
                    {index === 3 && displayImages.length > 5 && (
                      <div 
                        className="absolute bottom-1 right-1"
                      >
                        <Button 
                          size="sm"
                          className="bg-white/90 hover:bg-white text-black text-xs font-medium px-2 py-1 h-6 rounded-md shadow-sm backdrop-blur-sm border border-white/20"
                          onClick={() => {
                            setCurrentImageIndex(0);
                            setIsGalleryOpen(true);
                          }}
                        >
                          Plus de Photos
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto lg:px-8 px-0 py-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 gap-0">
            {/* Contenu principal - Colonne de gauche (2/3) */}
            <div className="lg:col-span-2 lg:border lg:border-gray-200 lg:rounded-lg lg:p-6 px-4 py-0">
              {/* En-tête de la propriété */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-primaryText mb-3">
                  {property.title}{" "}
                  {property.is_public && (
                    <Badge className="bg-green-600 text-white px-2 py-0.5 text-xs rounded-full inline-block align-middle">
                      En vedette
                    </Badge>
                  )}
                </h1>
                
                <div className="flex items-center justify-between text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-4 w-4 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ 
                        __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C7.02944 2 3 6.02944 3 11C3 13.704 4.40858 16.0555 5.97592 17.8473C7.55461 19.652 9.3972 21.0075 10.4939 21.7371C11.411 22.3473 12.589 22.3473 13.5061 21.7371C14.6028 21.0075 16.4454 19.652 18.0241 17.8473C19.5914 16.0555 21 13.704 21 11C21 6.02944 16.9706 2 12 2ZM10 11C10 9.89543 10.8954 9 12 9C13.1046 9 14 9.89543 14 11C14 12.1046 13.1046 13 12 13C10.8954 13 10 12.1046 10 11ZM12 7C9.79086 7 8 8.79086 8 11C8 13.2091 9.79086 15 12 15C14.2091 15 16 13.2091 16 11C16 8.79086 14.2091 7 12 7Z" fill="rgb(100,116,139)"></path></g></svg>`
                      }}
                    />
                    <span className="text-base">{property.location || "Localisation non spécifiée"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div 
                      className="h-4 w-4 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ 
                        __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g><path d="M9.75 12C9.75 10.7574 10.7574 9.75 12 9.75C13.2426 9.75 14.25 10.7574 14.25 12C14.25 13.2426 13.2426 14.25 12 14.25C10.7574 14.25 9.75 13.2426 9.75 12Z" fill="rgb(100,116,139)"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 13.6394 2.42496 14.1915 3.27489 15.2957C4.97196 17.5004 7.81811 20 12 20C16.1819 20 19.028 17.5004 20.7251 15.2957C21.575 14.1915 22 13.6394 22 12C22 10.3606 21.575 9.80853 20.7251 8.70433C19.028 6.49956 16.1819 4 12 4C7.81811 4 4.97196 6.49956 3.27489 8.70433C2.42496 9.80853 2 10.3606 2 12ZM12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25Z" fill="rgb(100,116,139)"></path></g></svg>`
                      }}
                    />
                    <span className="text-sm text-gray-600">0 vues</span>
                  </div>
                </div>
                
                <div className="space-y-3 mt-4">
                  {/* Première ligne: Type et Invités */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-4 w-4 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ 
                          __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M2.5192 7.82274C2 8.77128 2 9.91549 2 12.2039V13.725C2 17.6258 2 19.5763 3.17157 20.7881C4.34315 22 6.22876 22 10 22H14C17.7712 22 19.6569 22 20.8284 20.7881C22 19.5763 22 17.6258 22 13.725V12.2039C22 9.91549 22 8.77128 21.4808 7.82274C20.9616 6.87421 20.0131 6.28551 18.116 5.10812L16.116 3.86687C14.1106 2.62229 13.1079 2 12 2C10.8921 2 9.88939 2.62229 7.88403 3.86687L5.88403 5.10813C3.98695 6.28551 3.0384 6.87421 2.5192 7.82274ZM9 17.25C8.58579 17.25 8.25 17.5858 8.25 18C8.25 18.4142 8.58579 18.75 9 18.75H15C15.4142 18.75 15.75 18.4142 15.75 18C15.75 17.5858 15.4142 17.25 15 17.25H9Z" fill="rgb(100,116,139)"></path></g></svg>`
                        }}
                      />
                      <span className="text-base text-gray-700">{property.property_type || "Type non spécifié"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-4 w-4 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ 
                          __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g><rect width="24" height="24" fill="white"></rect><path fill-rule="evenodd" clip-rule="evenodd" d="M5 9.5C5 7.01472 7.01472 5 9.5 5C11.9853 5 14 7.01472 14 9.5C14 11.9853 11.9853 14 9.5 14C7.01472 14 5 11.9853 5 9.5Z" fill="rgb(100,116,139)"></path><path d="M14.3675 12.0632C14.322 12.1494 14.3413 12.2569 14.4196 12.3149C15.0012 12.7454 15.7209 13 16.5 13C18.433 13 20 11.433 20 9.5C20 7.567 18.433 6 16.5 6C15.7209 6 15.0012 6.2546 14.4196 6.68513C14.3413 6.74313 14.322 6.85058 14.3675 6.93679C14.7714 7.70219 15 8.5744 15 9.5C15 10.4256 14.7714 11.2978 14.3675 12.0632Z" fill="rgb(100,116,139)"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M4.64115 15.6993C5.87351 15.1644 7.49045 15 9.49995 15C11.5112 15 13.1293 15.1647 14.3621 15.7008C15.705 16.2847 16.5212 17.2793 16.949 18.6836C17.1495 19.3418 16.6551 20 15.9738 20H3.02801C2.34589 20 1.85045 19.3408 2.05157 18.6814C2.47994 17.2769 3.29738 16.2826 4.64115 15.6993Z" fill="rgb(100,116,139)"></path><path d="M14.8185 14.0364C14.4045 14.0621 14.3802 14.6183 14.7606 14.7837V14.7837C15.803 15.237 16.5879 15.9043 17.1508 16.756C17.6127 17.4549 18.33 18 19.1677 18H20.9483C21.6555 18 22.1715 17.2973 21.9227 16.6108C21.9084 16.5713 21.8935 16.5321 21.8781 16.4932C21.5357 15.6286 20.9488 14.9921 20.0798 14.5864C19.2639 14.2055 18.2425 14.0483 17.0392 14.0008L17.0194 14H16.9997C16.2909 14 15.5506 13.9909 14.8185 14.0364Z" fill="rgb(100,116,139)"></path></g></svg>`
                        }}
                      />
                      <span className="text-base text-gray-700">{property.max_guests} Invités</span>
                    </div>
                  </div>
                  
                  {/* Deuxième ligne: Chambres et Salles de bain */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-4 w-4 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ 
                          __html: `<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M5 10C3.347656 10 2 11.347656 2 13L2 26.8125C3.296875 25.6875 4.9375 24.777344 7 24.0625L7 20C7 17.339844 11.542969 17 15.5 17C19.457031 17 24 17.339844 24 20L24 22C24.335938 21.996094 24.65625 22 25 22C25.34375 22 25.664063 21.996094 26 22L26 20C26 17.339844 30.542969 17 34.5 17C38.457031 17 43 17.339844 43 20L43 24.03125C45.058594 24.742188 46.691406 25.671875 48 26.8125L48 13C48 11.347656 46.652344 10 45 10 Z M 25 24C5.90625 24 -0.015625 27.53125 0 37L50 37C50.015625 27.46875 44.09375 24 25 24 Z M 0 39L0 50L7 50L7 46C7 44.5625 7.5625 44 9 44L41 44C42.4375 44 43 44.5625 43 46L43 50L50 50L50 39Z" fill="rgb(100,116,139)"></path></g></svg>`
                        }}
                      />
                      <span className="text-base text-gray-700">{property.bedrooms} Chambres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-4 w-4 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ 
                          __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g><path d="M3.5 4.13516C3.5 3.23209 4.23209 2.5 5.13516 2.5C5.80379 2.5 6.40505 2.90708 6.65338 3.52788L6.79665 3.88607C6.20214 4.31929 5.71643 4.92335 5.41723 5.66014C4.99692 6.69515 5.01959 7.80665 5.3978 8.76651C5.47221 8.95535 5.61997 9.10596 5.80735 9.18396C5.99473 9.26197 6.20572 9.26069 6.39215 9.18044L12.3529 6.61436C12.725 6.45417 12.9026 6.02744 12.7541 5.65053C12.3758 4.69029 11.637 3.87189 10.6217 3.43813C9.81033 3.09152 8.94952 3.04489 8.15623 3.24613L8.04609 2.97079C7.56997 1.7805 6.41715 1 5.13516 1C3.40366 1 2 2.40366 2 4.13516V11H1.75C1.33579 11 1 11.3358 1 11.75C1 12.1642 1.33579 12.5 1.75 12.5H2V12.75C2 12.7538 2.00003 12.7576 2.00008 12.7614C1.99999 12.7799 2 12.7985 2.00001 12.8168L2.00001 12.8546C2 13.2298 2 13.4498 2.01557 13.6952C2.15751 15.9316 3.36604 17.9968 5.11758 19.3472C5.10383 19.3688 5.09106 19.3913 5.07934 19.4148L4.07934 21.4148C3.8941 21.7852 4.04427 22.2357 4.41475 22.421C4.78524 22.6062 5.23574 22.4561 5.42098 22.0856L6.3887 20.1501C7.19042 20.5559 8.0623 20.823 8.96911 20.9148C9.21355 20.9396 9.36275 20.9452 9.61687 20.9548L9.62369 20.955C10.3639 20.9828 11.0885 21 11.75 21C12.4115 21 13.1361 20.9828 13.8763 20.955L13.883 20.9548C14.1372 20.9452 14.2865 20.9396 14.5309 20.9148C15.4378 20.823 16.3098 20.5559 17.1116 20.15L18.0793 22.0856C18.2646 22.4561 18.7151 22.6062 19.0856 22.421C19.4561 22.2357 19.6062 21.7852 19.421 21.4148L18.421 19.4148C18.4092 19.3913 18.3964 19.3687 18.3827 19.347C20.1341 17.9966 21.3425 15.9315 21.4845 13.6952C21.5 13.4498 21.5 13.2299 21.5 12.8546L21.5 12.8168C21.5 12.7567 21.5001 12.6942 21.4963 12.6365C21.4933 12.5905 21.4886 12.545 21.4821 12.5H21.75C22.1642 12.5 22.5 12.1642 22.5 11.75C22.5 11.3358 22.1642 11 21.75 11H3.5V4.13516Z" fill="rgb(100,116,139)"></path></g></svg>`
                        }}
                      />
                      <span className="text-base text-gray-700">{property.bathrooms} Salle{property.bathrooms > 1 ? 's' : ''} de Bain</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* À propos de cette annonce */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-primaryText">À propos de cette annonce</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {property.description || "Aucune description disponible pour cette propriété."}
                </p>
              </div>

              {/* Points forts */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-primaryText">Points forts</h2>
                {characteristics.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(showAllCharacteristics ? characteristics : characteristics.slice(0, 6)).map((characteristic) => (
                        <div
                          key={characteristic.id}
                          className="flex items-center space-x-3 p-3 rounded border border-border/50"
                        >
                          <div className="flex-shrink-0 text-muted-foreground">
                            {characteristic.icon ? (
                              <div 
                                className="h-4 w-4 flex items-center justify-center"
                                dangerouslySetInnerHTML={{ __html: characteristic.icon }}
                              />
                            ) : (
                              <Wifi className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground">
                              {characteristic.name}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Bouton pour afficher/masquer le reste */}
                    {characteristics.length > 6 && (
                      <div className="mt-4 flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center justify-center text-gray-500 hover:text-black w-8 h-8 border border-gray-500 hover:border-black rounded-full"
                          onClick={() => setShowAllCharacteristics(!showAllCharacteristics)}
                        >
                          {showAllCharacteristics ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Aucun point fort spécifié pour cette propriété.</p>
                )}
              </div>

              {/* Règles */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-primaryText">Règles</h2>
                <div className="space-y-3">
                  {/* Ligne 1: Check-in et Check-out */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3 p-3 rounded border border-border/50">
                      <div className="flex-shrink-0 text-muted-foreground">
                        <div 
                          className="h-4 w-4 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ 
                            __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M21.5303 2.46967C21.8232 2.76256 21.8232 3.23744 21.5303 3.53033L13.8107 11.25H17.3438C17.758 11.25 18.0938 11.5858 18.0938 12C18.0938 12.4142 17.758 12.75 17.3438 12.75H12C11.5858 12.75 11.25 12.4142 11.25 12V6.65625C11.25 6.24204 11.5858 5.90625 12 5.90625C12.4142 5.90625 12.75 6.24204 12.75 6.65625V10.1893L20.4697 2.46967C20.7626 2.17678 21.2374 2.17678 21.5303 2.46967Z" fill="rgb(100,116,139)"></path><path d="M20.4817 6.70026L17.4303 9.75164C18.6329 9.79714 19.5938 10.7864 19.5938 12C19.5938 13.2426 18.5864 14.25 17.3438 14.25H12C10.7574 14.25 9.75 13.2426 9.75 12V6.65625C9.75 5.41361 10.7574 4.40625 12 4.40625C13.2136 4.40625 14.2029 5.36715 14.2484 6.56966L17.2997 3.51828C15.7632 2.55618 13.9466 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 10.0534 21.4438 8.23678 20.4817 6.70026Z" fill="rgb(100,116,139)"></path></g></svg>`
                          }}
                        />
                  </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          Check-in: {property.check_in_time || "14:00"}
                  </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded border border-border/50">
                      <div className="flex-shrink-0 text-muted-foreground">
                        <div 
                          className="h-4 w-4 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ 
                            __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M2.46967 21.5303C2.17678 21.2374 2.17678 20.7626 2.46967 20.4697L10.1893 12.75H6.65625C6.24204 12.75 5.90625 12.4142 5.90625 12C5.90625 11.5858 6.24204 11.25 6.65625 11.25H12C12.4142 11.25 12.75 11.5858 12.75 12V17.3438C12.75 17.758 12.4142 18.0938 12 18.0938C11.5858 18.0938 11.25 17.758 11.25 17.3438V13.8107L3.53033 21.5303C3.23744 21.8232 2.76256 21.8232 2.46967 21.5303Z" fill="rgb(100,116,139)"></path><path d="M3.51828 17.2997L6.56966 14.2484C5.36715 14.2029 4.40625 13.2136 4.40625 12C4.40625 10.7574 5.41361 9.75 6.65625 9.75H12C13.2426 9.75 14.25 10.7574 14.25 12V17.3438C14.25 18.5864 13.2426 19.5937 12 19.5937C10.7864 19.5937 9.79714 18.6329 9.75164 17.4303L6.70026 20.4817C8.23678 21.4438 10.0534 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.9466 2.55618 15.7632 3.51828 17.2997Z" fill="rgb(100,116,139)"></path></g></svg>`
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          Check-out: {property.check_out_time || "12:00"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ligne 2: Séjour min et Séjour max */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3 p-3 rounded border border-border/50">
                      <div className="flex-shrink-0 text-muted-foreground">
                        <div 
                          className="h-4 w-4 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ 
                            __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g><path d="M7.75 2.5C7.75 2.08579 7.41421 1.75 7 1.75C6.58579 1.75 6.25 2.08579 6.25 2.5V4.07926C4.81067 4.19451 3.86577 4.47737 3.17157 5.17157C2.47737 5.86577 2.19451 6.81067 2.07926 8.25H21.9207C21.8055 6.81067 21.5226 5.86577 20.8284 5.17157C20.1342 4.47737 19.1893 4.19451 17.75 4.07926V2.5C17.75 2.08579 17.4142 1.75 17 1.75C16.5858 1.75 16.25 2.08579 16.25 2.5V4.0129C15.5847 4 14.839 4 14 4H10C9.16097 4 8.41527 4 7.75 4.0129V2.5Z" fill="rgb(100,116,139)"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12C2 11.161 2 10.4153 2.0129 9.75H21.9871C22 10.4153 22 11.161 22 12ZM16.5 18C17.3284 18 18 17.3284 18 16.5C18 15.6716 17.3284 15 16.5 15C15.6716 15 15 15.6716 15 16.5C15 17.3284 15.6716 18 16.5 18Z" fill="rgb(100,116,139)"></path></g></svg>`
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          Séjour min: {property.min_nights || 1} Nuitée{property.min_nights > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded border border-border/50">
                      <div className="flex-shrink-0 text-muted-foreground">
                        <div 
                          className="h-4 w-4 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ 
                            __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g><path d="M7.75 2.5C7.75 2.08579 7.41421 1.75 7 1.75C6.58579 1.75 6.25 2.08579 6.25 2.5V4.07926C4.81067 4.19451 3.86577 4.47737 3.17157 5.17157C2.47737 5.86577 2.19451 6.81067 2.07926 8.25H21.9207C21.8055 6.81067 21.5226 5.86577 20.8284 5.17157C20.1342 4.47737 19.1893 4.19451 17.75 4.07926V2.5C17.75 2.08579 17.4142 1.75 17 1.75C16.5858 1.75 16.25 2.08579 16.25 2.5V4.0129C15.5847 4 14.839 4 14 4H10C9.16097 4 8.41527 4 7.75 4.0129V2.5Z" fill="rgb(100,116,139)"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 11.161 2 10.4153 2.0129 9.75H21.9871C22 10.4153 22 11.161 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12ZM17 14C17.5523 14 18 13.5523 18 13C18 12.4477 17.5523 12 17 12C16.4477 12 16 12.4477 16 13C16 13.5523 16.4477 14 17 14ZM17 18C17.5523 18 18 17.5523 18 17C18 16.4477 17.5523 16 17 16C16.4477 16 16 16.4477 16 17C16 17.5523 16.4477 18 17 18ZM13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13ZM13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17ZM7 14C7.55228 14 8 13.5523 8 13C8 12.4477 7.55228 12 7 12C6.44772 12 6 12.4477 6 13C6 13.5523 6.44772 14 7 14ZM7 18C7.55228 18 8 17.5523 8 17C8 16.4477 7.55228 16 7 16C6.44772 16 6 16.4477 6 17C6 17.5523 6.44772 18 7 18Z" fill="rgb(100,116,139)"></path></g></svg>`
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          Séjour max: 30 Nuitées
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ligne 3: Autorisation de fumer et Animaux acceptés */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3 p-3 rounded border border-border/50">
                      <div className="flex-shrink-0 text-muted-foreground">
                        <div 
                          className="h-4 w-4 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ 
                            __html: `<svg viewBox="0 0 360.001 360.001" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path d="M229.088,226.178H6.478c-3.573,0-6.478,2.9-6.478,6.478v55.73c0,3.58,2.904,6.481,6.478,6.481h222.61 c3.572,0,6.479-2.901,6.479-6.481v-55.73C235.564,229.079,232.66,226.178,229.088,226.178z" fill="rgb(100,116,139)"></path> <path d="M315.209,226.178h-49.184c-3.582,0-6.484,2.9-6.484,6.478v55.73c0,3.58,2.902,6.481,6.484,6.481h49.184 c3.574,0,6.479-2.901,6.479-6.481v-55.73C321.688,229.079,318.783,226.178,315.209,226.178z" fill="rgb(100,116,139)"></path> <path d="M264.375,196.973c1.648,1,3.465,1.476,5.262,1.476c3.432,0,6.779-1.739,8.691-4.889l24.693-40.685 c2.545-4.192,1.729-9.603-1.936-12.861l-29.242-26l20.299-33.452c2.91-4.794,1.385-11.042-3.41-13.952 c-4.796-2.911-11.041-1.382-13.951,3.413l-24.693,40.688c-2.545,4.192-1.729,9.603,1.936,12.86l29.24,25.999l-20.301,33.449 C258.051,187.815,259.58,194.063,264.375,196.973z" fill="rgb(100,116,139)"></path> <path d="M356.592,140.013l-29.242-26l20.305-33.452c2.906-4.794,1.379-11.042-3.416-13.952 c-4.795-2.911-11.041-1.382-13.953,3.413l-24.694,40.689c-2.543,4.192-1.729,9.603,1.938,12.86l29.24,25.999l-20.303,33.449 c-2.91,4.796-1.381,11.043,3.414,13.953c1.646,1,3.465,1.475,5.26,1.475c3.434,0,6.781-1.738,8.691-4.888l24.695-40.685 C361.07,148.683,360.256,143.273,356.592,140.013z" fill="rgb(100,116,139)"></path> </g> </g> </g> </g></svg>`
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          Autorisation de fumer: {property.smoking_allowed ? "Oui" : "Non"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded border border-border/50">
                      <div className="flex-shrink-0 text-muted-foreground">
                        <div 
                          className="h-4 w-4 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ 
                            __html: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="0" fill="none" width="20" height="20"></rect> <g> <path d="M11.9 8.4c1.3 0 2.1-1.9 2.1-3.1 0-1-.5-2.2-1.5-2.2-1.3 0-2.1 1.9-2.1 3.1 0 1 .5 2.2 1.5 2.2zm-3.8 0c1 0 1.5-1.2 1.5-2.2C9.6 4.9 8.8 3 7.5 3 6.5 3 6 4.2 6 5.2c-.1 1.3.7 3.2 2.1 3.2zm7.4-1c-1.3 0-2.2 1.8-2.2 3.1 0 .9.4 1.8 1.3 1.8 1.3 0 2.2-1.8 2.2-3.1 0-.9-.5-1.8-1.3-1.8zm-8.7 3.1c0-1.3-1-3.1-2.2-3.1-.9 0-1.3.9-1.3 1.8 0 1.3 1 3.1 2.2 3.1.9 0 1.3-.9 1.3-1.8zm3.2-.2c-2 0-4.7 3.2-4.7 5.4 0 1 .7 1.3 1.5 1.3 1.2 0 2.1-.8 3.2-.8 1 0 1.9.8 3 .8.8 0 1.7-.2 1.7-1.3 0-2.2-2.7-5.4-4.7-5.4z" fill="rgb(100,116,139)"></path> </g> </g></svg>`
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          Animaux acceptés: {property.pets_allowed ? "Oui" : "Non"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ligne 4: Fête autorisée et Enfants autorisés */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3 p-3 rounded border border-border/50">
                      <div className="flex-shrink-0 text-muted-foreground">
                        <div 
                          className="h-4 w-4 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ 
                            __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>Party</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Party"> <rect id="Rectangle" fill-rule="nonzero" x="0" y="0" width="24" height="24"> </rect> <path d="M4.05024,19.9498 C4.75734,20.6569 5.46444989,20.6569 6.52511,20.3033 L16.9745,14.9203 C17.5768,14.61 17.7027,13.8033 17.2237,13.3242 L10.6758,6.77632 C10.1967,6.29726 9.38998,6.42319 9.07971,7.02547 L3.69668,17.4749 C3.34313,18.5355 3.34313,19.2426 4.05024,19.9498 Z" id="Path" stroke="rgb(100,116,139)" stroke-width="2" stroke-linecap="round"> </path> <path d="M18,6 L19.3675,5.31623 C19.6787,5.16066 19.746,4.74598 19.5,4.5 L19.5,4.5 C19.254,4.25402 19.3213,3.83934 19.6325,3.68377 L21,3" id="Path" stroke="rgb(100,116,139)" stroke-width="2" stroke-linecap="round"> </path> <line x1="16" y1="8" x2="16.125" y2="8" id="Path" stroke="rgb(100,116,139)" stroke-width="2" stroke-linecap="round"> </line> <line x1="19.375" y1="11.5" x2="19.5" y2="11.5" id="Path" stroke="rgb(100,116,139)" stroke-width="2" stroke-linecap="round"> </line> <line x1="12" y1="4" x2="11" y2="2.5" id="Path" stroke="rgb(100,116,139)" stroke-width="2" stroke-linecap="round"> </line> <line x1="15.5" y1="4.5" x2="16" y2="2" id="Path" stroke="rgb(100,116,139)" stroke-width="2" stroke-linecap="round"> </line> <line x1="22" y1="9" x2="19.5" y2="8.5" id="Path" stroke="rgb(100,116,139)" stroke-width="2" stroke-linecap="round"> </line> <line x1="12" y1="8.5" x2="12" y2="17.5" id="Path" stroke="rgb(100,116,139)" stroke-width="2" stroke-linecap="round"> </line> <line x1="8" y1="9.5" x2="8" y2="19.5" id="Path" stroke="rgb(100,116,139)" stroke-width="2" stroke-linecap="round"> </line> </g> </g> </g></svg>`
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          Fête autorisée: {property.parties_allowed ? "Oui" : "Non"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded border border-border/50">
                      <div className="flex-shrink-0 text-muted-foreground">
                        <div 
                          className="h-4 w-4 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ 
                            __html: `<svg viewBox="0 0 357.153 357.153" fill="none" xmlns="http://www.w3.org/2000/svg" fill="rgb(100,116,139)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g id="Layer_5_41_"> <g> <circle cx="177.567" cy="120.841" r="12.338" fill="rgb(100,116,139)"></circle> <path d="M272.81,282.602c-5.939-3.188-5.025-8.935-5.025-12.538v-50.341c17.373-3.548,55.607-3.874,55.607-38.214 c0-16.969-13.844-23.183-30.727-21.466c-13.463,1.368-19.795,10.353-42.602,1.775c-2.891-1.087-10.957-8.202-6.339-13.831 c11.806-14.393,18.466-33.157,18.466-53.363c0-3.303-0.028-9.921,2.934-11.157c15.189-6.34,25.461-22.073,25.461-39.859 C290.585,19.525,271.408,0,247.755,0c-12.823,0-24.328,5.742-32.178,14.835c-0.687,0.797-1.915,2.451-4.924,1.152 c-10.654-5.012-19.57-6.498-32.078-6.498c-13.434,0-23.197,1.812-34.446,7.544c-3.55,1.086-5.962-2.571-7.717-4.346 C128.671,4.848,118.009,0,106.229,0C82.575,0,63.397,19.524,63.397,43.608c0,18.489,11.303,34.289,27.257,40.632 c1.542,0.613,3.925,2.463,4.306,10.384c0.963,20.033,6.816,38.489,18.213,53.038c4.227,5.394,0.154,12.357-6.207,14.323 c-23.203,7.173-29.063-0.559-42.477-1.943c-16.881-1.742-30.727,4.497-30.727,21.466c0,33.416,38.223,34.606,55.604,38.104 v50.451c0,3.702,0.518,8.887-7.201,13.656c-21.557,8.884-52.498,9.57-52.498,39.738c0,18.357,15.225,36.778,33.238,33.238 c22.566-4.433,34.411-11.924,68.651-27.42c7.374-3.36,12.577-1.675,15.815-1.221c9.713,1.364,20.228,1.892,31.203,1.892 c12.263,0,23.949-0.658,34.582-2.406c2.684-0.441,8.96-0.694,14.722,1.648c33.415,15.554,44.138,23.032,66.37,27.507 c17.996,3.622,33.238-14.881,33.238-33.238C327.488,293.291,294.328,291.6,272.81,282.602z M219.045,133.18 c0,17.972-18.569,32.544-41.479,32.544c-22.906,0-41.478-14.572-41.478-32.544c0-17.974,18.571-32.544,41.478-32.544 C200.475,100.636,219.045,115.206,219.045,133.18z M117.879,79.506c0-8.178,6.627-14.807,14.806-14.807 c8.177,0,14.808,6.629,14.808,14.807s-6.631,14.807-14.808,14.807C124.506,94.312,117.879,87.683,117.879,79.506z M228.684,262.682c0,27.673-22.435,40.1-50.106,40.1c-27.674,0-50.107-12.427-50.107-40.1V239.12 c0-27.673,22.434-50.106,50.107-50.106c27.672,0,50.106,22.434,50.106,50.106V262.682z M217.207,94.312 c-8.178,0-14.807-6.629-14.807-14.807s6.629-14.807,14.807-14.807s14.807,6.629,14.807,14.807S225.385,94.312,217.207,94.312z" fill="rgb(100,116,139)"></path> </g> </g> </g> </g></svg>`
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          Enfants autorisés: {property.children_allowed ? "Oui" : "Non"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Localisation */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-primaryText">Localisation</h2>
                <div className="h-64 w-full rounded-lg overflow-hidden border border-border relative z-0">
                  <style>{`
                    .leaflet-control-attribution {
                      display: none !important;
                    }
                    .leaflet-control-zoom {
                      border: none !important;
                      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important;
                    }
                    .leaflet-control-zoom a {
                      background-color: white !important;
                      color: #6b7280 !important;
                      border-radius: 6px !important;
                      margin: 1px !important;
                    }
                    .leaflet-control-zoom a:hover {
                      background-color: #f9fafb !important;
                    }
                    .custom-marker {
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background-color: hsl(145, 71%, 40%);
                      border: 3px solid white;
                      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                      position: relative;
                      opacity: 0.9;
                    }
                    .custom-marker::before {
                      content: '';
                      position: absolute;
                      top: -10px;
                      left: -10px;
                      width: 40px;
                      height: 40px;
                      border-radius: 50%;
                      background-color: hsl(145, 71%, 40%);
                      opacity: 0.3;
                      animation: pulse 2s ease-in-out infinite;
                    }
                    @keyframes pulse {
                      0% {
                        transform: scale(1);
                        opacity: 0.3;
                      }
                      50% {
                        transform: scale(1.5);
                        opacity: 0.1;
                      }
                      100% {
                        transform: scale(1);
                        opacity: 0.3;
                      }
                    }
                  `}</style>
                  <MapContainer
                    center={[parseFloat(property.latitude) || 36.8763, parseFloat(property.longitude) || 10.3247]}
                    zoom={14}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                    zoomControl={true}
                    attributionControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Circle
                      center={[parseFloat(property.latitude) || 36.8763, parseFloat(property.longitude) || 10.3247]}
                      radius={160}
                      pathOptions={{
                        color: 'hsl(145, 71%, 40%)',
                        weight: 3,
                        opacity: 0.8,
                        fillColor: 'hsl(145, 71%, 40%)',
                        fillOpacity: 0.2
                      }}
                    />
                    <Marker 
                      position={[parseFloat(property.latitude) || 36.8763, parseFloat(property.longitude) || 10.3247]}
                      icon={L.divIcon({
                        className: 'custom-marker',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                        popupAnchor: [0, -10],
                        html: ''
                      })}
                    >
                      <Popup>
                        <div 
                          className="text-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                          onClick={() => {
                            const lat = parseFloat(property.latitude) || 36.8763;
                            const lng = parseFloat(property.longitude) || 10.3247;
                            const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                            window.open(googleMapsUrl, '_blank');
                          }}
                        >
                          <strong>{property.title}</strong><br />
                          {property.location || "Localisation non spécifiée"}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Cliquez sur la carte d'information pour ouvrir dans Google Maps
                </p>
              </div>

              {/* À Proximité */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-primaryText">À Proximité</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Explorez les environs et découvrez les meilleures adresses pour un séjour pratique, agréable et inoubliable.
                </p>
                
                <div className="space-y-4">
                  {/* Carte publicitaire 1 */}
                  <div 
                    className="flex gap-3 cursor-pointer items-center"
                    onClick={() => window.open('https://example.com/plongee-bizerte', '_blank')}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&h=200&fit=crop"
                        alt="Plongée Sous Marine"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primaryText mb-1 text-sm">Plongée Sous Marine Bizerte</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Découvrez les fonds marins de Bizerte, une aventure à couper le souffle entre amis ou en famille.
                      </p>
                    </div>
                  </div>

                  {/* Carte publicitaire 2 */}
                  <div 
                    className="flex gap-3 cursor-pointer items-center"
                    onClick={() => window.open('https://example.com/restaurant-korba', '_blank')}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=200&fit=crop"
                        alt="Restaurant Local"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primaryText mb-1 text-sm">Restaurant Traditionnel Korba</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Savourez les spécialités locales dans un cadre authentique avec vue sur la mer Méditerranée.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Équipements */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-primaryText">Équipements</h2>
                {equipments.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(showAllEquipments ? equipments : equipments.slice(0, 6)).map((equipment) => (
                        <div
                          key={equipment.id}
                          className="flex items-center space-x-3 p-3 rounded border border-border/50"
                        >
                          <div className="flex-shrink-0 text-muted-foreground">
                            {equipment.icon ? (
                              <div 
                                className="h-4 w-4 flex items-center justify-center"
                                dangerouslySetInnerHTML={{ __html: equipment.icon }}
                              />
                            ) : (
                              <Wifi className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground">
                              {equipment.name}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Bouton pour afficher/masquer le reste */}
                    {equipments.length > 6 && (
                      <div className="mt-4 flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center justify-center text-gray-500 hover:text-black w-8 h-8 border border-gray-500 hover:border-black rounded-full"
                          onClick={() => setShowAllEquipments(!showAllEquipments)}
                        >
                          {showAllEquipments ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Aucun équipement spécifié pour cette propriété.</p>
                )}
              </div>

              {/* À propos de l'hôte */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-primaryText">À propos de l'hôte</h2>
                <div className="flex items-center gap-4 mb-4">
                  {property.owner_avatar_url ? (
                    <img
                      src={property.owner_avatar_url}
                      alt={`Photo de ${property.owner_name || "Propriétaire"}`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        // Fallback vers l'initiale si l'image ne charge pas
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-base">${property.owner_name ? property.owner_name.charAt(0).toUpperCase() : "P"}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-base">
                      {property.owner_name ? property.owner_name.charAt(0).toUpperCase() : "P"}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-primaryText text-base">{property.owner_name || "Propriétaire"}</h3>
                    <p className="text-muted-foreground text-sm">Propriétaire</p>
                  </div>
                </div>
                
                {property.owner_languages && property.owner_languages.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-primaryText">Langues parlées:</span>
                    <div className="flex flex-wrap gap-2">
                      {property.owner_languages.map((language) => (
                        <span
                          key={language}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {language.charAt(0).toUpperCase() + language.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Boutons d'action - Mobile uniquement */}
              <div className="lg:hidden flex flex-col gap-3 pt-6">
                <Button variant="outline" className="flex items-center justify-center gap-2 text-gray-500 w-full">
                  <Heart className="h-4 w-4" />
                  Ajouter aux Favoris
                </Button>
                <Button variant="outline" className="flex items-center justify-center gap-2 text-gray-500 w-full">
                  <Share2 className="h-4 w-4" />
                  Partager
                </Button>
              </div>
            </div>

            {/* Widget de réservation - Colonne de droite (1/3) - Desktop uniquement */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-8">
                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-5">
                    <div className="space-y-5">
              {/* Prix */}
              <div className="pb-3 border-b">
                <div className="text-2xl font-bold mb-1 text-primaryText">
                  {property.price_per_night}<sup className="text-sm font-bold">TND</sup><span className="text-sm font-normal text-gray-600">/nuitée</span>
                </div>
              </div>

                      {/* Calendrier de disponibilité */}
                      <div className="space-y-4 -mx-5 px-5">
                        {/* En-tête du calendrier avec navigation */}
                        <div className="flex items-center justify-between w-full">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={goToPreviousMonth}
                            disabled={startOfMonth(currentMonth) <= startOfMonth(new Date())}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <h3 className="text-sm font-medium capitalize">
                            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                          </h3>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={goToNextMonth}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Calendrier personnalisé */}
                        <div className="w-full">
                          {/* En-têtes des jours */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['lu', 'ma', 'me', 'je', 've', 'sa', 'di'].map((day) => (
                              <div key={day} className="text-xs text-gray-500 text-center py-2 font-medium">
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Grille du calendrier */}
                          <div className="grid grid-cols-7 gap-1">
                            {generateCalendarDays().map((date, index) => {
                              const isCurrentMonth = isSameMonth(date, currentMonth);
                              const isToday = isSameDay(date, new Date());
                              const isSelected = (checkIn && isSameDay(date, checkIn)) || (checkOut && isSameDay(date, checkOut));
                              const isInRange = checkIn && checkOut && isAfter(date, checkIn) && isBefore(date, checkOut);
                              const isPast = isBefore(date, startOfDay(new Date()));
                              const status = getDateStatus(date);
                              
                              let className = "aspect-square flex items-center justify-center text-sm rounded transition-colors ";
                              
                              if (!isCurrentMonth) {
                                className += "text-gray-400 ";
                              } else if (isPast || status === 'past') {
                                className += "text-gray-300 cursor-not-allowed ";
                              } else if (isSelected) {
                                className += "bg-primary text-primary-foreground ";
                              } else if (isInRange) {
                                className += "bg-primary/20 text-primary ";
                              } else if (isToday) {
                                className += "bg-gray-100 text-primaryText font-medium border border-gray-300 ";
                              } else if (status === 'available') {
                                className += "bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer ";
                            } else if (status === 'reserved') {
                                className += "bg-green-50 text-green-600 cursor-not-allowed ";
                              } else {
                                className += "bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer ";
                              }
                              
                              return (
                                <div
                                  key={index}
                                  className={className}
                                  onClick={() => handleDateClick(date)}
                                >
                                  {date.getDate()}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Légende */}
                        <div className="flex items-center justify-center gap-6 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-sm"></div>
                            <span className="text-gray-600">Disponible</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded-sm"></div>
                            <span className="text-gray-600">Réservé</span>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="pt-4">
                          <div className="space-y-2">
                            <Button 
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium flex items-center justify-center gap-2"
                              onClick={() => window.open('https://wa.me/21612345678', '_blank')}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                              </svg>
                              WhatsApp
                            </Button>
                            <Button 
                              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:!text-white h-10 px-4 py-2 bg-[#32323A] text-white hover:bg-[#3a3a42]"
                              onClick={() => window.open('tel:+21612345678', '_self')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              Téléphone
                            </Button>
                          </div>
                        </div>

                                                  {/* Informations de contact */}
                          <div className="text-center space-y-1 text-xs text-muted-foreground">
                            <p>Réservez instantanément via WhatsApp ou par téléphone.</p>
                          </div>

                        {/* Boutons d'action */}
                        <div className="flex flex-col gap-3 pt-4">
                          <Button variant="outline" className="flex items-center justify-center gap-2 text-gray-500 w-full">
                            <Heart className="h-4 w-4" />
                            Ajouter aux Favoris
                          </Button>
                          <Button variant="outline" className="flex items-center justify-center gap-2 text-gray-500 w-full">
                            <Share2 className="h-4 w-4" />
                            Partager
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de galerie complète */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col">
            {/* En-tête du modal */}
            <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
              <div className="text-white">
                <span className="text-sm font-medium">
                  {currentImageIndex + 1} / {displayImages.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={() => setIsGalleryOpen(false)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {/* Image principale */}
            <div className="flex-1 flex items-center justify-center relative p-4 overflow-hidden">
              <img
                src={displayImages[currentImageIndex]}
                alt={`${property.title} - Photo ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              />
              
              {/* Bouton précédent */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
                onClick={prevImage}
                disabled={currentImageIndex === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              {/* Bouton suivant */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
                onClick={nextImage}
                disabled={currentImageIndex === displayImages.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Miniatures en bas */}
            <div className="bg-black/50 backdrop-blur-sm p-4">
              <div className="flex gap-2 overflow-x-auto max-w-full">
                {displayImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative flex-shrink-0 cursor-pointer overflow-hidden rounded-md ${
                      index === currentImageIndex 
                        ? 'ring-2 ring-primary' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`Miniature ${index + 1}`}
                      className="w-16 h-16 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bannière mobile sticky avec prix et bouton Réserver */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[0]">
        <div className="flex items-center justify-between px-4" style={{ paddingTop: "0.8rem", paddingBottom: "0.8rem" }}>
          {/* Prix */}
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-primaryText">
              {property.price_per_night}<sup className="text-base font-bold">TND</sup><span className="text-sm font-normal text-gray-600">/nuitée</span>
            </div>
          </div>
          
          {/* Bouton Réserver */}
          <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-3 rounded-lg"
                onClick={() => setIsBookingModalOpen(true)}
              >
                Réserver
              </Button>
            </DialogTrigger>
             <DialogContent 
               className="!fixed !top-0 !left-0 !right-0 !bottom-0 !w-full !h-screen !max-w-none !max-h-none !m-0 !rounded-none !p-0 !border-0 !shadow-none !transform-none !fade-in-0 !fade-out-0 md:!max-w-md md:!h-auto md:!max-h-[90vh] md:!mx-4 md:!rounded-lg md:!p-6 md:!border md:!shadow-lg [&>button]:hidden"
               style={{
                 border: 'none',
                 boxShadow: 'none',
                 zIndex: 95
               }}
             >
               <VisuallyHidden>
                 <DialogTitle>Réservation - {property.title}</DialogTitle>
                 <DialogDescription>
                   Calendrier de disponibilité et options de contact pour réserver cette propriété
                 </DialogDescription>
               </VisuallyHidden>
               <div className="flex flex-col h-full">
                {/* Contenu scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-5">
                    {/* Prix - Identique au desktop */}
                    <div className="pb-3 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-2xl font-bold mb-1 text-primaryText">
                            {property.price_per_night}<sup className="text-sm font-bold">TND</sup><span className="text-sm font-normal text-gray-600">/nuitée</span>
                          </div>
                          <div className="text-xs text-gray-500 italic">
                            Prix à vérifier directement avec le propriétaire.
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 rounded-md border border-green-600 hover:bg-transparent hover:text-green-600"
                          onClick={() => setIsBookingModalOpen(false)}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                    </div>

                    {/* Calendrier de disponibilité - Identique au desktop */}
                    <div className="space-y-4 -mx-4 px-4 md:-mx-5 md:px-5">
                      {/* En-tête du calendrier avec navigation */}
                      <div className="flex items-center justify-between w-full">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={goToPreviousMonth}
                          disabled={startOfMonth(currentMonth) <= startOfMonth(new Date())}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="text-sm font-medium capitalize">
                          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                        </h3>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={goToNextMonth}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Calendrier personnalisé */}
                      <div className="w-full">
                        {/* En-têtes des jours */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['lu', 'ma', 'me', 'je', 've', 'sa', 'di'].map((day) => (
                            <div key={day} className="text-xs text-gray-500 text-center py-2 font-medium">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Grille du calendrier */}
                        <div className="grid grid-cols-7 gap-1">
                          {generateCalendarDays().map((date, index) => {
                            const isCurrentMonth = isSameMonth(date, currentMonth);
                            const isToday = isSameDay(date, new Date());
                            const isSelected = (checkIn && isSameDay(date, checkIn)) || (checkOut && isSameDay(date, checkOut));
                            const isInRange = checkIn && checkOut && isAfter(date, checkIn) && isBefore(date, checkOut);
                            const isPast = isBefore(date, startOfDay(new Date()));
                            const status = getDateStatus(date);
                            
                            let className = "aspect-square flex items-center justify-center text-sm rounded transition-colors ";
                            
                            if (!isCurrentMonth) {
                              className += "text-gray-400 ";
                            } else if (isPast || status === 'past') {
                              className += "text-gray-300 cursor-not-allowed ";
                            } else if (isSelected) {
                              className += "bg-primary text-primary-foreground ";
                            } else if (isInRange) {
                              className += "bg-primary/20 text-primary ";
                            } else if (isToday) {
                              className += "bg-gray-100 text-primaryText font-medium border border-gray-300 ";
                            } else if (status === 'available') {
                              className += "bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer ";
                            } else if (status === 'reserved') {
                              className += "bg-green-50 text-green-600 cursor-not-allowed ";
                            } else {
                              className += "bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer ";
                            }
                            
                            return (
                              <div
                                key={index}
                                className={className}
                                onClick={() => handleDateClick(date)}
                              >
                                {date.getDate()}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Légende */}
                      <div className="flex items-center justify-center gap-6 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-sm"></div>
                          <span className="text-gray-600">Disponible</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-50 border border-green-200 rounded-sm"></div>
                          <span className="text-gray-600">Réservé</span>
                        </div>
                      </div>

                      {/* Contact - Identique au desktop */}
                      <div className="pt-4">
                        <div className="space-y-2">
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium flex items-center justify-center gap-2"
                            onClick={() => window.open('https://wa.me/21612345678', '_blank')}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                            WhatsApp
                          </Button>
                          <Button 
                            className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:!text-white h-10 px-4 py-2 bg-[#32323A] text-white hover:bg-[#3a3a42]"
                            onClick={() => window.open('tel:+21612345678', '_self')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Téléphone
                          </Button>
                        </div>
                      </div>

                      {/* Informations de contact */}
                      <div className="text-center space-y-1 text-xs text-muted-foreground">
                        <p>Réservez instantanément via WhatsApp ou par téléphone.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;


