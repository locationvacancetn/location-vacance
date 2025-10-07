import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import { LocationSelect } from "@/components/LocationSelect";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Bell,
  Menu,
  MapPin,
  Search,
  Mic,
  SlidersHorizontal,
  Heart,
  Star,
  House,
  Compass,
  MessageSquare,
  UserRound,
  Calendar as CalendarIcon,
  Users,
  Plus,
  Minus,
  X,
  Bed,
  ShowerHead,
  UserCheck,
  TrendingUp,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Trash2
} from "lucide-react";
import Footer from "@/components/Footer";

const HomePage = () => {
  const categories = ["Maisons", "Appartements", "Bureaux", "Chambres"];
  const { user } = useAuth();
  usePageTitle(); // Utilise le hook pour mettre à jour le titre de la page
  const filterPanelRef = useRef<HTMLDivElement>(null);
  
  
  // États pour les filtres de recherche
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [isSelectingCheckOut, setIsSelectingCheckOut] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);
  const [propertyAvailability, setPropertyAvailability] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // Fonction pour fermer tous les panels
  const closeAllPanels = useCallback(() => {
    setIsCalendarOpen(false);
    setIsFilterOpen(false);
    setIsGuestsOpen(false);
    setIsMobileCalendarOpen(false);
    // Note: isSearchModalOpen n'est pas fermé ici car c'est géré séparément
  }, []);

  // Fonction pour ouvrir uniquement le calendrier
  const openCalendar = useCallback(() => {
    closeAllPanels();
    setIsCalendarOpen(true);
  }, [closeAllPanels]);

  // Fonction pour ouvrir uniquement les filtres
  const openFilters = useCallback(() => {
    closeAllPanels();
    setIsFilterOpen(true);
  }, [closeAllPanels]);

  // Fonction pour ouvrir uniquement les invités
  const openGuests = useCallback(() => {
    closeAllPanels();
    setIsGuestsOpen(true);
  }, [closeAllPanels]);

  // Fonction pour charger les dates disponibles
  const loadPropertyAvailability = useCallback(async () => {
    try {
      // Pour l'instant, on charge toutes les propriétés disponibles
      // Dans une vraie implémentation, on filtrerait par propriété sélectionnée
      const { data, error } = await supabase
        .from('property_availability')
        .select('*')
        .eq('is_available', true)
        .gte('date', new Date().toISOString().split('T')[0]);

      if (error) {
        console.error('Erreur lors du chargement des dates disponibles:', error);
        return;
      }

      setPropertyAvailability(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
  }, []);
  const [guests, setGuests] = useState({
    adults: 0,
    children: 0,
    pets: 0
  });

  // États pour les sliders d'images
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});

  // Images de propriétés (exemples)
  const propertyImages = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1560448204-5c8b5b5b5b5b?w=400&h=300&fit=crop"
  ];

  // Fonctions pour gérer le slider
  const nextImage = (cardId: string) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [cardId]: (prev[cardId] || 0 + 1) % propertyImages.length
    }));
  };

  const prevImage = (cardId: string) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [cardId]: prev[cardId] <= 0 ? propertyImages.length - 1 : (prev[cardId] || 0) - 1
    }));
  };

  // Gestionnaire de clic extérieur pour fermer le panel des filtres
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterOpen && filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // Logique de sélection intelligente des dates
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) return;

    const today = startOfDay(new Date());
    const selectedDate = startOfDay(date);

    // Empêcher la sélection de dates passées
    if (isBefore(selectedDate, today)) return;

    // Si aucune date n'est sélectionnée, ou si on a déjà une période complète
    if (!checkIn || (checkIn && checkOut)) {
      // Premier clic : définir l'arrivée
      setCheckIn(selectedDate);
      setCheckOut(undefined);
      setIsSelectingCheckOut(true);
    } else if (checkIn && !checkOut) {
      // Deuxième clic : définir le départ
      if (isAfter(selectedDate, checkIn) || selectedDate.getTime() === checkIn.getTime()) {
        setCheckOut(selectedDate);
        setIsSelectingCheckOut(false);
        closeAllPanels(); // Fermer automatiquement après sélection du départ
      } else {
        // Si la date est antérieure à l'arrivée, recommencer
        setCheckIn(selectedDate);
        setCheckOut(undefined);
        setIsSelectingCheckOut(true);
      }
    }
  }, [checkIn, checkOut]);

  // Fonction pour vider les dates
  const handleClearDates = useCallback(() => {
    setCheckIn(undefined);
    setCheckOut(undefined);
    setIsSelectingCheckOut(false);
  }, []);

  // Fonction pour réinitialiser les invités
  const handleClearGuests = useCallback(() => {
    setGuests({
      adults: 0,
      children: 0,
      pets: 0
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-2 pb-24 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Titre + recherche */}
          <div className="mt-6">
            <h1 className="text-2xl font-bold leading-snug text-foreground">
              Découvrez des propriétés et trouvez votre lieu de rêve
            </h1>
            
            {/* Barre de recherche mobile */}
            <div className="mt-4 md:hidden flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Commencez votre recherche"
                  className="pl-10 h-12 rounded-xl cursor-pointer"
                  onClick={() => setIsSearchModalOpen(true)}
                  readOnly
                />
                <Mic className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>

            {/* Barre de recherche desktop avec filtres */}
            <div className="mt-4 hidden md:block relative">
              <div className="flex items-center gap-2">
                {/* Destination */}
                <div className="flex-[2]">
                  <LocationSelect
                    placeholder="Où allez-vous ?"
                    className="rounded-lg w-full"
                    value={selectedLocation}
                    onLocationSelect={(location) => {
                      console.log('Localisation sélectionnée:', location);
                      setSelectedLocation(location);
                    }}
                  />
                </div>
                
                {/* Dates (Arrivée & Départ) */}
                <TooltipProvider>
                  <Popover open={isCalendarOpen && !isSearchModalOpen} onOpenChange={(open) => open ? openCalendar() : setIsCalendarOpen(false)}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-10 px-4 justify-start text-left font-normal flex-[1.5] border-input bg-background hover:bg-background hover:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 text-muted-foreground">
                        <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                        {checkIn && checkOut 
                          ? `${format(checkIn, "dd-MM-yyyy", { locale: fr })} au ${format(checkOut, "dd-MM-yyyy", { locale: fr })}`
                          : checkIn 
                            ? `${format(checkIn, "dd-MM-yyyy", { locale: fr })}`
                            : "Quand ?"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-muted-foreground">
                            {!checkIn 
                              ? "Sélectionnez votre date d'arrivée" 
                              : isSelectingCheckOut 
                                ? "Sélectionnez votre date de départ"
                                : "Sélectionnez vos dates"
                            }
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleClearDates}
                              className="h-6 w-6 text-muted-foreground border border-transparent hover:border-muted-foreground/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={closeAllPanels}
                              className="h-6 w-6 text-muted-foreground border border-transparent hover:border-muted-foreground/20"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Calendar
                          mode="single"
                          numberOfMonths={2}
                          selected={checkIn}
                          onSelect={handleDateSelect}
                          disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                          locale={fr}
                          className="rounded-md"
                          classNames={{
                            day_today: "bg-muted text-muted-foreground font-normal",
                            day_selected: "bg-feedback-success text-white hover:bg-feedback-success hover:text-white focus:bg-feedback-success focus:text-white",
                            day_disabled: "text-muted-foreground opacity-30",
                          }}
                          modifiers={{
                            checkOut: checkOut ? [checkOut] : [],
                            rangeMiddle: checkIn && checkOut ? 
                              Array.from({ length: Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) - 1) }, (_, i) => {
                                const date = new Date(checkIn);
                                date.setDate(date.getDate() + i + 1);
                                return date;
                              }) : []
                          }}
                          modifiersClassNames={{
                            checkOut: "bg-feedback-success text-white hover:bg-feedback-success hover:text-white focus:bg-feedback-success focus:text-white",
                            rangeMiddle: "bg-feedback-success/20 hover:bg-feedback-success/30",
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipProvider>
                
                {/* Invités */}
                <Popover open={isGuestsOpen && !isSearchModalOpen} onOpenChange={(open) => open ? openGuests() : setIsGuestsOpen(false)}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-10 px-4 justify-start text-left font-normal flex-[1.5] border-input bg-background hover:bg-background hover:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 text-muted-foreground">
                      <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                      {guests.adults + guests.children + guests.pets > 0
                        ? [
                            guests.adults > 0 ? `${guests.adults} adulte${guests.adults !== 1 ? 's' : ''}` : '',
                            guests.children > 0 ? `${guests.children} enfant${guests.children !== 1 ? 's' : ''}` : '',
                            guests.pets > 0 ? `${guests.pets} ${guests.pets !== 1 ? 'animaux' : 'animal'}` : ''
                          ].filter(Boolean).join(', ')
                        : 'Combien d\'invités ?'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="start" sideOffset={8}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Sélectionnez vos invités
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleClearGuests}
                          className="h-6 w-6 text-muted-foreground border border-transparent hover:border-muted-foreground/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={closeAllPanels}
                          className="h-6 w-6 text-muted-foreground border border-transparent hover:border-muted-foreground/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Adultes</p>
                          <p className="text-xs text-muted-foreground">13 ans et plus</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setGuests(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{guests.adults}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setGuests(prev => ({ ...prev, adults: prev.adults + 1 }))}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Enfants</p>
                          <p className="text-xs text-muted-foreground">2-12 ans</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setGuests(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{guests.children}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setGuests(prev => ({ ...prev, children: prev.children + 1 }))}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
          </div>
        </div>

                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Animaux</p>
                          <p className="text-xs text-muted-foreground">Animaux de compagnie</p>
                        </div>
                        <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setGuests(prev => ({ ...prev, pets: Math.max(0, prev.pets - 1) }))}
                          >
                            <Minus className="h-4 w-4" />
                  </Button>
                          <span className="w-8 text-center">{guests.pets}</span>
                  <Button
                    variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setGuests(prev => ({ ...prev, pets: prev.pets + 1 }))}
                          >
                            <Plus className="h-4 w-4" />
                  </Button>
                </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Bouton filtre */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-lg border-input bg-background hover:bg-background hover:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => isFilterOpen ? closeAllPanels() : openFilters()}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
                
                {/* Bouton de recherche */}
                <Button className="h-10 px-4 bg-primary text-primary-foreground rounded-lg">
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher
                </Button>
              </div>
              
              {/* Panel filtre en dessous de la bannière */}
              {isFilterOpen && (
                <div ref={filterPanelRef} className="absolute top-full left-0 right-0 mt-2 z-50">
                  <div className="bg-card border border-border rounded-lg shadow-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Filtres</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={closeAllPanels}
                        className="h-6 w-6 text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {/* Nombre de chambres */}
                      <div>
                        <label className="text-sm font-medium mb-2 block text-foreground">Nombre de chambres</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <Button
                              key={num}
                              variant="outline"
                              size="sm"
                              className="w-10 h-10 p-0 border-input"
                            >
                              {num}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Prix */}
                      <div>
                        <label className="text-sm font-medium mb-2 block text-foreground">Budget par nuit</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Min"
                            type="number"
                            className="flex-1 border-input bg-background text-foreground"
                          />
                          <span className="text-muted-foreground self-center">-</span>
                          <Input
                            placeholder="Max"
                            type="number"
                            className="flex-1 border-input bg-background text-foreground"
                          />
                        </div>
                      </div>

                      {/* Équipements */}
                      <div>
                        <label className="text-sm font-medium mb-2 block text-foreground">Équipements</label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Piscine", "WiFi", "Climatisation", "Bord de mer", "Parking", "Cuisine équipée"].map((amenity) => (
                            <Button
                              key={amenity}
                              variant="outline"
                              size="sm"
                              className="text-left justify-start h-8 px-3 border-input text-foreground"
                            >
                              {amenity}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Type de logement */}
                      <div>
                        <label className="text-sm font-medium mb-2 block text-foreground">Type de logement</label>
                        <div className="flex flex-wrap gap-2">
                          {["Maison", "Appartement", "Villa", "Studio", "Chalet"].map((type) => (
                            <Button
                              key={type}
                              variant="outline"
                              size="sm"
                              className="rounded-full border-input"
                            >
                              {type}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-6 pt-4 border-t border-border">
                      <Button variant="ghost" className="text-sm text-muted-foreground">
                        Effacer tout
                      </Button>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Appliquer les filtres
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Featured properties */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold leading-snug text-foreground">En Vedette</h2>
                <p className="text-sm text-muted-foreground">
                  Découvrez nos propriétés les mieux notées et les plus populaires.
                </p>
              </div>
              <Button variant="ghost" className="bg-[#32323A] text-white hover:bg-[#3a3a42] h-9">Voir tout</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                                 <Card key={i} className="border-border hover:shadow-lg transition-shadow">
                   <CardContent className="p-4">
                                      <div className="relative group">
                    {/* Image principale */}
                    <img 
                      src={propertyImages[(currentImageIndex[`featured-${i}`] || 0) % propertyImages.length]} 
                      alt={`Propriété ${i + 1}`}
                      className="h-40 w-full rounded-lg object-cover"
                    />
                    
                    {/* Bouton cœur */}
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 rounded-full bg-transparent hover:bg-white/20 h-6 w-6">
                      <Heart className="h-3 w-3" />
                    </Button>
                    
                    {/* Badge EN VEDETTE */}
                    <Badge className="absolute left-2 top-2 rounded-full text-white px-1.5 text-[10px] flex items-center gap-0.5" style={{backgroundColor: '#BC2D2B'}}>
                      <Star className="h-2.5 w-2.5" />
                      EN VEDETTE
                    </Badge>
                    
                    {/* Boutons de navigation du slider */}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute left-2 bottom-2 rounded-full bg-black/50 hover:bg-black/70 text-white h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => prevImage(`featured-${i}`)}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-2 bottom-2 rounded-full bg-black/50 hover:bg-black/70 text-white h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => nextImage(`featured-${i}`)}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                    
                    {/* Indicateurs de pagination */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {propertyImages.slice(0, 3).map((_, index) => (
                        <button
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            (currentImageIndex[`featured-${i}`] || 0) % 3 === index 
                              ? 'bg-white' 
                              : 'bg-white/50'
                          }`}
                          onClick={() => setCurrentImageIndex(prev => ({
                            ...prev,
                            [`featured-${i}`]: index
                          }))}
                        />
                      ))}
                    </div>
                  </div>
                                         <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                         <div className="flex items-baseline gap-1">
                           <span className="text-[10px] text-muted-foreground self-start">A partir</span>
                           <span className="text-xl font-bold text-primary">
                             1300<sup className="text-sm font-medium text-primary">TND</sup>
                           </span>
                           <span className="text-xs text-muted-foreground">/Nuitée</span>
                         </div>
                         <TooltipProvider>
                           <Tooltip>
                             <TooltipTrigger asChild>
                                                             <div className="flex items-center gap-2 cursor-pointer">
                                <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                              </div>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>John Micheal</p>
                             </TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
                        </div>
                       <div className="flex items-center justify-between">
                         <Link to="/property/1" className="font-semibold text-base hover:text-primary transition-colors">Nacary Elite House</Link>
                        <div className="flex items-center gap-1 text-primary">
                          <Star className="h-4 w-4 fill-current" />
                           <span className="text-sm font-medium">4.8</span>
                        </div>
                      </div>
                       <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> 2328 Despard Street, Atlanta, GA
                      </p>
                       <div className="flex items-center justify-between pt-2 border-t border-border/30">
                         <span className="flex items-center gap-2 text-sm text-muted-foreground">
                           <Bed className="h-4 w-4" />
                           4 Chambres
                         </span>
                         <span className="flex items-center gap-2 text-sm text-muted-foreground">
                           <ShowerHead className="h-4 w-4" />
                           3 Salle de Bain
                         </span>
                         <span className="flex items-center gap-2 text-sm text-muted-foreground">
                           <UserCheck className="h-4 w-4" />
                           8 Invités
                         </span>
                       </div>
                     </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 
          SECTION: LES PLUS POPULAIRES
          Description: Affiche les propriétés ayant le plus d'engagement (vues, réservations, likes)
          Critères: Basé sur un algorithme de popularité qui combine:
          - Nombre de vues dans les 30 derniers jours
          - Nombre de réservations confirmées
          - Note moyenne des avis clients
          - Temps passé sur la page de la propriété
          Badge: "POPULAIRE" avec icône TrendingUp pour indiquer la tendance
          TODO: Intégrer avec l'API analytics pour récupérer les vraies données de popularité
        */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold leading-snug text-foreground">Les Plus Populaires</h2>
              <p className="text-sm text-muted-foreground">
                Propriétés avec le plus d'engagement et de réservations.
              </p>
            </div>
            <Button variant="ghost" className="bg-[#32323A] text-white hover:bg-[#3a3a42] h-9">Voir tout</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="relative group">
                    {/* Image principale */}
                    <img 
                      src={propertyImages[(currentImageIndex[`popular-${i}`] || 0) % propertyImages.length]} 
                      alt={`Propriété populaire ${i + 1}`}
                      className="h-40 w-full rounded-lg object-cover"
                    />
                    
                    {/* Bouton cœur */}
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 rounded-full bg-transparent hover:bg-white/20 h-6 w-6">
                      <Heart className="h-3 w-3" />
                    </Button>
                    
                    {/* Badge POPULAIRE */}
                    <Badge className="absolute left-2 top-2 rounded-full bg-green-600 text-white px-1.5 text-[10px] flex items-center gap-0.5">
                      <TrendingUp className="h-2.5 w-2.5" />
                      POPULAIRE
                    </Badge>
                    
                    {/* Boutons de navigation du slider */}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute left-2 bottom-2 rounded-full bg-black/50 hover:bg-black/70 text-white h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => prevImage(`popular-${i}`)}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-2 bottom-2 rounded-full bg-black/50 hover:bg-black/70 text-white h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => nextImage(`popular-${i}`)}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                    
                    {/* Indicateurs de pagination */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {propertyImages.slice(0, 3).map((_, index) => (
                        <button
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            (currentImageIndex[`popular-${i}`] || 0) % 3 === index 
                              ? 'bg-white' 
                              : 'bg-white/50'
                          }`}
                          onClick={() => setCurrentImageIndex(prev => ({
                            ...prev,
                            [`popular-${i}`]: index
                          }))}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-primary">
                          1300<sup className="text-sm font-medium text-primary">TND</sup>
                        </span>
                        <span className="text-xs text-muted-foreground">/Nuitée</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                                                          <div className="flex items-center gap-2 cursor-pointer">
                                <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                              </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>John Micheal</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center justify-between">
                      <Link to="/property/2" className="font-semibold text-base hover:text-primary transition-colors">Nacary Elite House</Link>
                      <div className="flex items-center gap-1 text-primary">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> 2328 Despard Street, Atlanta, GA
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Bed className="h-4 w-4" />
                        4 Chambres
                      </span>
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShowerHead className="h-4 w-4" />
                        3 Salle de Bain
                      </span>
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserCheck className="h-4 w-4" />
                        8 Invités
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 
          SECTION: DERNIÈRE CHANCE
          Description: Affiche les propriétés avec peu de disponibilités restantes
          Critères: Propriétés ayant:
          - Moins de 7 jours de disponibilité dans les 3 prochains mois
          - Taux d'occupation élevé (>80%)
          - Réservations récentes fréquentes
          - Stock limité pour les dates populaires
          Badge: "DERNIÈRE CHANCE" avec couleur urgente (rouge/orange)
          Indicateur: "Plus que X jours disponibles" pour créer l'urgence
          TODO: Connecter avec le système de réservation pour calculer la disponibilité réelle
        */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold leading-snug text-foreground">Dernière Chance</h2>
              <p className="text-sm text-muted-foreground">
                Propriétés avec peu de disponibilités restantes. Réservez vite !
              </p>
            </div>
            <Button variant="ghost" className="bg-[#32323A] text-white hover:bg-[#3a3a42] h-9">Voir tout</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="relative group">
                    {/* Image principale */}
                    <img 
                      src={propertyImages[(currentImageIndex[`urgent-${i}`] || 0) % propertyImages.length]} 
                      alt={`Propriété dernière chance ${i + 1}`}
                      className="h-40 w-full rounded-lg object-cover"
                    />
                    
                    {/* Bouton cœur */}
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 rounded-full bg-transparent hover:bg-white/20 h-6 w-6">
                      <Heart className="h-3 w-3" />
                    </Button>
                    
                    {/* Badge DERNIÈRE CHANCE */}
                    <Badge className="absolute left-2 top-2 rounded-full text-white px-1.5 text-[10px] flex items-center gap-0.5" style={{backgroundColor: '#BC2D2B'}}>
                      <Clock className="h-2.5 w-2.5" />
                      DERNIÈRE CHANCE
                    </Badge>
                    
                    {/* Boutons de navigation du slider */}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute left-2 bottom-2 rounded-full bg-black/50 hover:bg-black/70 text-white h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => prevImage(`urgent-${i}`)}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-2 bottom-2 rounded-full bg-black/50 hover:bg-black/70 text-white h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => nextImage(`urgent-${i}`)}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                    
                    {/* Indicateurs de pagination */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {propertyImages.slice(0, 3).map((_, index) => (
                        <button
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            (currentImageIndex[`urgent-${i}`] || 0) % 3 === index 
                              ? 'bg-white' 
                              : 'bg-white/50'
                          }`}
                          onClick={() => setCurrentImageIndex(prev => ({
                            ...prev,
                            [`urgent-${i}`]: index
                          }))}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-primary">
                          1300<sup className="text-sm font-medium text-primary">TND</sup>
                        </span>
                        <span className="text-xs text-muted-foreground">/Nuitée</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                                                          <div className="flex items-center gap-2 cursor-pointer">
                                <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                              </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>John Micheal</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center justify-between">
                      <Link to="/property/2" className="font-semibold text-base hover:text-primary transition-colors">Nacary Elite House</Link>
                      <div className="flex items-center gap-1 text-primary">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> 2328 Despard Street, Atlanta, GA
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Bed className="h-4 w-4" />
                        4 Chambres
                      </span>
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShowerHead className="h-4 w-4" />
                        3 Salle de Bain
                      </span>
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserCheck className="h-4 w-4" />
                        8 Invités
                      </span>
                      </div>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal de recherche plein page pour mobile */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          {/* Header du modal */}
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold">Rechercher</h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setIsSearchModalOpen(false);
                closeAllPanels(); // Fermer tous les panels quand on ferme le modal mobile
              }}
              className="h-9 w-9 rounded-md text-gray-500 border-gray-300 hover:border-gray-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contenu du modal */}
          <div className="flex-1 p-4 max-w-md mx-auto">
            {/* Barre de recherche principale */}
            <div className="relative mb-4">
              <LocationSelect
                placeholder="Où voulez-vous aller ?"
                className="h-12 rounded-xl"
                value={selectedLocation}
                onLocationSelect={(location) => {
                  console.log('Localisation sélectionnée:', location);
                  setSelectedLocation(location);
                }}
              />
            </div>

            {/* Input Quand ? */}
            <div className="relative mb-4">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Quand ?"
                className="pl-10 h-12 rounded-xl cursor-pointer"
                onClick={() => {
                  closeAllPanels();
                  loadPropertyAvailability();
                  setIsMobileCalendarOpen(true);
                }}
                readOnly
                value={checkIn && checkOut 
                  ? `${format(checkIn, "dd-MM-yyyy")} au ${format(checkOut, "dd-MM-yyyy")}`
                  : checkIn 
                    ? `${format(checkIn, "dd-MM-yyyy")}`
                    : ""
                }
              />
            </div>

            {/* Calendrier mobile - Dans le même modal */}
            {isMobileCalendarOpen && (
              <div className="relative mb-4 bg-white border border-gray-200 rounded-lg">
                <Calendar
                  mode="single"
                  numberOfMonths={1}
                  selected={checkIn}
                  onSelect={handleDateSelect}
                  disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                  locale={fr}
                  className="rounded-md w-full"
                  classNames={{
                    day_today: "bg-muted text-muted-foreground font-normal",
                    day_selected: "bg-feedback-success text-white hover:bg-feedback-success hover:text-white focus:bg-feedback-success focus:text-white",
                    day_disabled: "text-muted-foreground opacity-30",
                    months: "w-full",
                    month: "w-full",
                    caption: "flex justify-center pt-1 pb-6 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full",
                    head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center",
                    row: "flex w-full mt-2",
                    cell: "flex-1 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-10 w-full p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded-md",
                  }}
                  modifiers={{
                    checkOut: checkOut ? [checkOut] : [],
                    rangeMiddle: checkIn && checkOut ? 
                      Array.from({ length: Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) - 1) }, (_, i) => {
                        const date = new Date(checkIn);
                        date.setDate(date.getDate() + i + 1);
                        return date;
                      }) : []
                  }}
                  modifiersClassNames={{
                    checkOut: "bg-feedback-success text-white hover:bg-feedback-success hover:text-white focus:bg-feedback-success focus:text-white",
                    rangeMiddle: "bg-feedback-success/20 hover:bg-feedback-success/30",
                  }}
                />
                
                {/* Légende du calendrier */}
                <div className="mt-4 p-4 flex flex-wrap gap-4 text-xs text-muted-foreground justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-feedback-success"></div>
                    <span>Dates sélectionnées</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-feedback-success/20"></div>
                    <span>Période sélectionnée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-muted"></div>
                    <span>Aujourd'hui</span>
                  </div>
                </div>
              </div>
            )}

            {/* Input Invités */}
            <div className="relative mb-4">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Combien d'invités ?"
                className="pl-10 h-12 rounded-xl cursor-pointer"
                onClick={() => {
                  closeAllPanels();
                  setIsGuestsOpen(true);
                }}
                readOnly
                value={guests.adults + guests.children + guests.pets > 0
                  ? [
                      guests.adults > 0 ? `${guests.adults} adulte${guests.adults !== 1 ? 's' : ''}` : '',
                      guests.children > 0 ? `${guests.children} enfant${guests.children !== 1 ? 's' : ''}` : '',
                      guests.pets > 0 ? `${guests.pets} ${guests.pets !== 1 ? 'animaux' : 'animal'}` : ''
                    ].filter(Boolean).join(', ')
                  : ""
                }
              />
            </div>

            {/* Panneau Invités mobile - Dans le même modal */}
            {isGuestsOpen && (
              <div className="relative mb-4 bg-white border border-gray-200 rounded-lg p-4">
                <div className="space-y-4">
                  {/* Adultes */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Adultes</h3>
                      <p className="text-sm text-muted-foreground">13 ans et plus</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setGuests(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                        disabled={guests.adults <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{guests.adults}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setGuests(prev => ({ ...prev, adults: prev.adults + 1 }))}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                      {/* Enfants */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Enfants</h3>
                          <p className="text-sm text-muted-foreground">2-12 ans</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => setGuests(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                            disabled={guests.children <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{guests.children}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => setGuests(prev => ({ ...prev, children: prev.children + 1 }))}
                            disabled={guests.adults < 1}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                  {/* Animaux */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Animaux</h3>
                      <p className="text-sm text-muted-foreground">Animaux de compagnie</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setGuests(prev => ({ ...prev, pets: Math.max(0, prev.pets - 1) }))}
                        disabled={guests.pets <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{guests.pets}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setGuests(prev => ({ ...prev, pets: prev.pets + 1 }))}
                        disabled={guests.adults < 1}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton de recherche */}
            <div className="pt-4">
              <Button 
                className="w-full h-12 rounded-xl"
                onClick={() => {
                  // Logique de recherche à implémenter
                  setIsSearchModalOpen(false);
                  closeAllPanels(); // Fermer tous les panels après recherche
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;