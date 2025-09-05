import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { useState, useCallback } from "react";
import { format, isAfter, isBefore, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
  TreePine
} from "lucide-react";

const PropertyDetail = () => {
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

  // Navigation de la galerie
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
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
    setCurrentMonth(subMonths(currentMonth, 1));
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
    
    // Générer 42 jours (6 semaines)
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startCalendar);
      day.setDate(startCalendar.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  // Vérifier l'état d'une date
  const getDateStatus = (date: Date) => {
    const availableDates = [
      new Date(2025, 8, 3), new Date(2025, 8, 4), new Date(2025, 8, 5), new Date(2025, 8, 6),
      new Date(2025, 8, 15), new Date(2025, 8, 16), new Date(2025, 8, 20), new Date(2025, 8, 21),
      new Date(2025, 8, 25), new Date(2025, 8, 28), new Date(2025, 8, 29)
    ];
    
    const pendingDates = [
      new Date(2025, 8, 17), new Date(2025, 8, 18), new Date(2025, 8, 22), new Date(2025, 8, 30)
    ];
    
    const reservedDates = [
      new Date(2025, 8, 19), new Date(2025, 8, 23), new Date(2025, 8, 24), new Date(2025, 8, 26), new Date(2025, 8, 27)
    ];

    if (availableDates.some(d => isSameDay(d, date))) return 'available';
    if (pendingDates.some(d => isSameDay(d, date))) return 'pending';
    if (reservedDates.some(d => isSameDay(d, date))) return 'reserved';
    return 'normal';
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
              <div className="relative group">
                                  <img
                    src={propertyImages[0]}
                    alt="Villa Curubia - Piscine principale"
                    className="w-full h-full object-cover rounded-lg cursor-pointer"
                    onClick={() => {
                      setCurrentImageIndex(0);
                      setIsGalleryOpen(true);
                    }}
                  />
              </div>
              
              {/* Grille d'images secondaires (2x2, à droite) */}
              <div className="grid grid-cols-2 gap-2">
                {propertyImages.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative group cursor-pointer">
                    <img
                      src={image}
                      alt={`Villa Curubia ${index + 2}`}
                      className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setCurrentImageIndex(index + 1);
                        setIsGalleryOpen(true);
                      }}
                    />
                    {index === 3 && (
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
              <div className="relative group">
                                  <img
                    src={propertyImages[0]}
                    alt="Villa Curubia"
                    className="w-full h-64 object-cover rounded-lg cursor-pointer"
                    onClick={() => {
                      setCurrentImageIndex(0);
                      setIsGalleryOpen(true);
                    }}
                  />
              </div>
              
              {/* Grille mobile 2x2 */}
              <div className="grid grid-cols-2 gap-2">
                {propertyImages.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative group cursor-pointer">
                    <img
                      src={image}
                      alt={`Villa Curubia ${index + 2}`}
                      className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setCurrentImageIndex(index + 1);
                        setIsGalleryOpen(true);
                      }}
                    />
                    {index === 3 && (
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
                  Villa Curubia{" "}
                  <Badge className="bg-green-600 text-white px-2 py-0.5 text-xs rounded-full inline-block align-middle">
                    En vedette
                  </Badge>
                </h1>
                
                <div className="flex items-center justify-between text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-base">Korba, Nabeul</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">1692 vues</span>
                  </div>
                </div>
                
                <div className="space-y-3 mt-4">
                  {/* Première ligne: Type et Invités */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <House className="h-4 w-4 text-gray-500" />
                      <span className="text-base text-gray-700">Villa de luxe</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-base text-gray-700">8 Invités</span>
                    </div>
                  </div>
                  
                  {/* Deuxième ligne: Chambres et Salles de bain */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-gray-500" />
                      <span className="text-base text-gray-700">4 Chambres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShowerHead className="h-4 w-4 text-gray-500" />
                      <span className="text-base text-gray-700">3 Salle de Bain</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* À propos de cette annonce */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-primaryText">À propos de cette annonce</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Une très belle villa, de style, moderne, pratique, luxueuse, très hautement équipée, 200m de l'une des plus belles plages de Tunisie.
                </p>
              </div>

                             {/* Prix */}
               <div className="mb-8">
                 <h2 className="text-xl font-bold mb-3 text-primaryText">Prix</h2>
                 <div className="space-y-2">
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 text-sm flex-1 min-w-0 pr-2">Nuitée</span>
                     <span className="font-semibold flex-shrink-0">1300 <sup className="text-xs font-bold">TND</sup><span className="font-normal text-xs">/nuitée</span></span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 text-sm flex-1 min-w-0 pr-2">Weekends (Vendredi, Samedi Et Dimanche)</span>
                     <span className="font-semibold flex-shrink-0">1500 <sup className="text-xs font-bold">TND</sup><span className="font-normal text-xs">/nuitée</span></span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 text-sm flex-1 min-w-0 pr-2">Semaine +7j</span>
                     <span className="font-semibold flex-shrink-0">1100 <sup className="text-xs font-bold">TND</sup><span className="font-normal text-xs">/nuitée</span></span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 text-sm flex-1 min-w-0 pr-2">Mois +30j</span>
                     <span className="font-semibold flex-shrink-0">1000 <sup className="text-xs font-bold">TND</sup><span className="font-normal text-xs">/nuitée</span></span>
                   </div>
                 </div>
               </div>

                             {/* Services supplémentaires */}
               <div className="mb-8">
                 <h2 className="text-xl font-bold mb-3 text-primaryText">Services supplémentaires</h2>
                 <div className="space-y-2">
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 text-sm flex-1 min-w-0 pr-2">Jardinage</span>
                     <span className="font-semibold flex-shrink-0">30 <sup className="text-xs font-bold">TND</sup><span className="font-normal text-xs">/nuitée</span></span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 text-sm flex-1 min-w-0 pr-2">Frais De Nettoyage</span>
                     <span className="font-semibold flex-shrink-0">50 <sup className="text-xs font-bold">TND</sup><span className="font-normal text-xs">/séjour</span></span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 text-sm flex-1 min-w-0 pr-2">Femme De Ménage</span>
                     <span className="font-semibold flex-shrink-0">80 <sup className="text-xs font-bold">TND</sup><span className="font-normal text-xs">/nuitée</span></span>
                   </div>
                 </div>
               </div>

              {/* Équipements */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-primaryText">Équipements</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">WiFi</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Parking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Waves className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Piscine</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Coffee className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Cuisine équipée</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mountain className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Vue sur mer</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TreePine className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Jardin</span>
                  </div>
                </div>
              </div>

              {/* Détails */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-primaryText">Détails</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <House className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Villa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">8 Invités</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">3 Chambres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">4 Lits</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <ShowerHead className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">3 Salles de bains</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Check-in: 14:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Check-out: 12:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Séjour min: 2 Nuitées</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Séjour max: 30 Nuitées</span>
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
                    center={[36.8763, 10.3247]} // Coordonnées de La Marsa, Tunis
                    zoom={14}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                    zoomControl={true}
                    attributionControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Circle
                      center={[36.8763, 10.3247]}
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
                      position={[36.8763, 10.3247]}
                      icon={L.divIcon({
                        className: 'custom-marker',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                        popupAnchor: [0, -10],
                        html: ''
                      })}
                    >
                      <Popup>
                        <div className="text-center">
                          <strong>Villa Curubia</strong><br />
                          Zone approximative - La Marsa, Tunis
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Cliquez sur le marqueur pour afficher l'itinéraire Google Maps
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

              {/* Règles */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-primaryText">Règles</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Autorisation de fumer</span>
                    <span className="font-semibold">Oui</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Animaux acceptés</span>
                    <span className="font-semibold">Oui</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Fête autorisée</span>
                    <span className="font-semibold">Non</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Enfants autorisés</span>
                    <span className="font-semibold">Oui</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-primaryText">Règles supplémentaires</h3>
                  <p className="text-gray-600 text-sm">
                    Location familiale uniquement – pas de groupes d'amis
                  </p>
                </div>
              </div>

              {/* À propos de l'hôte */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-primaryText">À propos de l'hôte</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-base">
                    MH
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primaryText text-base">Mohamed Haddad</h3>
                    <p className="text-muted-foreground text-sm">Propriétaire</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-primaryText">Langues:</span>
                  <span className="text-sm text-muted-foreground">Français, Arabe, Anglais</span>
                </div>
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
                             950<sup className="text-sm font-bold">TND</sup><span className="text-sm font-normal text-gray-600">/nuitée</span>
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
                              } else if (isPast) {
                                className += "text-gray-300 cursor-not-allowed ";
                              } else if (isSelected) {
                                className += "bg-primary text-primary-foreground ";
                              } else if (isInRange) {
                                className += "bg-primary/20 text-primary ";
                              } else if (isToday) {
                                className += "bg-gray-100 text-primaryText font-medium border border-gray-300 ";
                              } else if (status === 'available') {
                                className += "bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer ";
                              } else if (status === 'pending') {
                                className += "bg-yellow-50 text-yellow-600 hover:bg-yellow-100 cursor-pointer ";
                              } else if (status === 'reserved') {
                                className += "bg-red-50 text-red-600 cursor-not-allowed ";
                              } else {
                                className += "text-gray-900 hover:bg-gray-100 cursor-pointer ";
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
                            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded-sm"></div>
                            <span className="text-gray-600">Disponible</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded-sm"></div>
                            <span className="text-gray-600">En attente</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded-sm"></div>
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
                  {currentImageIndex + 1} / {propertyImages.length}
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
            <div className="flex-1 flex items-center justify-center relative p-4">
              <img
                src={propertyImages[currentImageIndex]}
                alt={`Villa Curubia - Photo ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
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
                disabled={currentImageIndex === propertyImages.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Miniatures en bas */}
            <div className="bg-black/50 backdrop-blur-sm p-4">
              <div className="flex gap-2 overflow-x-auto max-w-full">
                {propertyImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative flex-shrink-0 cursor-pointer ${
                      index === currentImageIndex 
                        ? 'ring-2 ring-primary' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`Miniature ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-md"
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
              950<sup className="text-base font-bold">TND</sup><span className="text-sm font-normal text-gray-600">/nuitée</span>
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
              className="w-full h-full max-w-none max-h-none m-0 rounded-none p-0 border-0 shadow-none md:max-w-md md:max-h-[90vh] md:mx-4 md:rounded-lg md:p-6 md:border md:shadow-lg [&>button]:hidden"
              style={{
                border: 'none',
                boxShadow: 'none',
                zIndex: 95
              }}
            >
              <div className="flex flex-col h-full">
                {/* Contenu scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-5">
                    {/* Prix - Identique au desktop */}
                    <div className="pb-3 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-2xl font-bold mb-1 text-primaryText">
                            950<sup className="text-sm font-bold">TND</sup><span className="text-sm font-normal text-gray-600">/nuitée</span>
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
                            } else if (isPast) {
                              className += "text-gray-300 cursor-not-allowed ";
                            } else if (isSelected) {
                              className += "bg-primary text-primary-foreground ";
                            } else if (isInRange) {
                              className += "bg-primary/20 text-primary ";
                            } else if (isToday) {
                              className += "bg-gray-100 text-primaryText font-medium border border-gray-300 ";
                            } else if (status === 'available') {
                              className += "bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer ";
                            } else if (status === 'pending') {
                              className += "bg-yellow-50 text-yellow-600 hover:bg-yellow-100 cursor-pointer ";
                            } else if (status === 'reserved') {
                              className += "bg-red-50 text-red-600 cursor-not-allowed ";
                            } else {
                              className += "text-gray-900 hover:bg-gray-100 cursor-pointer ";
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
                          <div className="w-3 h-3 bg-green-50 border border-green-200 rounded-sm"></div>
                          <span className="text-gray-600">Disponible</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded-sm"></div>
                          <span className="text-gray-600">En attente</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-50 border border-red-200 rounded-sm"></div>
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


