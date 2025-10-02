import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { showSuccess } from "@/lib/appToast";
import { supabase } from "@/integrations/supabase/client";
import { PropertyService, Property } from "@/lib/propertyService";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft,
  ChevronRight,
  Home,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  ExternalLink
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarManagementProps {}

interface BlockedDate {
  id?: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

const CalendarManagement = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [blockedDatesSet, setBlockedDatesSet] = useState<Set<string>>(new Set());

  // Charger les propriétés du propriétaire
  useEffect(() => {
    loadProperties();
  }, []);

  // Charger les dates bloquées quand une propriété est sélectionnée
  useEffect(() => {
    if (selectedPropertyId) {
      loadBlockedDates();
      const property = properties.find(p => p.id === selectedPropertyId);
      setSelectedProperty(property || null);
    } else {
      setBlockedDates([]);
      setBlockedDatesSet(new Set());
      setSelectedProperty(null);
    }
  }, [selectedPropertyId, properties]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const data = await PropertyService.getOwnerProperties();
      setProperties(data);
    } catch (error) {
      console.error("Erreur lors du chargement des propriétés:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos propriétés",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBlockedDates = async () => {
    if (!selectedPropertyId) return;

    try {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .rpc('get_property_availability', { p_property_id: selectedPropertyId });

      if (error) {
        console.error('Erreur lors du chargement des dates bloquées:', error);
        return;
      }

      // Filtrer seulement les dates bloquées
      const blockedData = (data || []).filter((item: any) => !item.is_available);
      const blockedSet = new Set<string>(blockedData.map((item: any) => item.date));
      setBlockedDatesSet(blockedSet);

      // Grouper les dates consécutives par raison
      const groupedDates = groupConsecutiveDates(blockedData);
      setBlockedDates(groupedDates);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupConsecutiveDates = (dates: any[]) => {
    if (dates.length === 0) return [];

    const grouped: BlockedDate[] = [];
    let currentGroup: any[] = [dates[0]];

    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i].date);
      const prevDate = new Date(dates[i - 1].date);
      const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1 && dates[i].reason === dates[i - 1].reason) {
        currentGroup.push(dates[i]);
      } else {
        grouped.push({
          id: currentGroup[0].id,
          startDate: new Date(currentGroup[0].date),
          endDate: new Date(currentGroup[currentGroup.length - 1].date),
          reason: currentGroup[0].reason
        });
        currentGroup = [dates[i]];
      }
    }

    // Ajouter le dernier groupe
    grouped.push({
      id: currentGroup[0].id,
      startDate: new Date(currentGroup[0].date),
      endDate: new Date(currentGroup[currentGroup.length - 1].date),
      reason: currentGroup[0].reason
    });

    return grouped;
  };

  // Fonction pour basculer une date - mise à jour instantanée
  const toggleDateAvailability = useCallback(async (date: Date) => {
    if (!selectedPropertyId || !date) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const isCurrentlyBlocked = blockedDatesSet.has(dateStr);
    
    // Mise à jour immédiate de l'interface (optimistic update)
    const newBlockedSet = new Set(blockedDatesSet);
    if (isCurrentlyBlocked) {
      newBlockedSet.delete(dateStr);
    } else {
      newBlockedSet.add(dateStr);
    }
    setBlockedDatesSet(newBlockedSet);

    try {
      setIsSaving(true);
      
      const { data, error } = await (supabase as any)
        .rpc('toggle_property_availability', {
          p_property_id: selectedPropertyId,
          p_date: dateStr,
          p_reason: 'Bloqué manuellement'
        });
        
      if (error) {
        console.error('Erreur lors du basculement:', error);
        // En cas d'erreur, restaurer l'état précédent
        setBlockedDatesSet(blockedDatesSet);
        toast({
          title: "Erreur",
          description: "Impossible de modifier la disponibilité de cette date",
          variant: "destructive",
        });
        return;
      }

      showSuccess({
        title: "Succès",
        description: `Date ${isCurrentlyBlocked ? 'libérée' : 'bloquée'} avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de la modification de la date:', error);
      // En cas d'erreur, restaurer l'état précédent
      setBlockedDatesSet(blockedDatesSet);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la disponibilité de cette date",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [selectedPropertyId, blockedDatesSet, toast]);

  const isDateBlocked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedDatesSet.has(dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      // Empêcher de revenir en arrière avant le mois en cours
      const currentDate = new Date();
      const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const newMonth = subMonths(currentMonth, 1);
      
      if (newMonth >= currentMonthDate) {
        setCurrentMonth(newMonth);
      }
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  const renderCalendarGrid = () => {
    const nextMonth = addMonths(currentMonth, 1);
    const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const weekDaysKeys = ['L', 'M1', 'M2', 'J', 'V', 'S', 'D'];
    
    // Vérifier si on peut revenir en arrière
    const currentDate = new Date();
    const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const canGoBack = currentMonth > currentMonthDate;

    const renderMonth = (month: Date, title: string) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      // Ajouter les jours du mois précédent pour compléter la grille
      const startDate = new Date(monthStart);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      const endDate = new Date(monthEnd);
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });

      return (
        <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-white">
          {/* En-tête du mois */}
          <div className="p-3 bg-white border-b border-gray-200 text-center">
            <h3 className="text-sm font-medium capitalize text-gray-900">{title}</h3>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-0 mb-1 p-2 bg-white">
            {weekDays.map((day, index) => (
              <div key={weekDaysKeys[index]} className="text-xs text-gray-600 text-center py-2 font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Grille des dates */}
          <div className="grid grid-cols-7 gap-1 p-2 bg-white">
            {allDays.map((day) => {
              const isCurrentMonth = isSameMonth(day, month);
              const isBlocked = isDateBlocked(day);
              const isToday = isSameDay(day, new Date());
              const isPast = isBefore(day, startOfDay(new Date()));

              // Masquer les dates qui n'appartiennent pas au mois courant
              if (!isCurrentMonth) {
                return <div key={day.toISOString()} className="aspect-square"></div>;
              }

              let className = "aspect-square flex items-center justify-center text-sm transition-colors border border-gray-200 rounded-md ";
              
              if (isPast) {
                className += "text-gray-300 cursor-not-allowed bg-gray-50 ";
              } else if (isBlocked) {
                className += "bg-green-100 text-green-700 cursor-pointer hover:bg-green-200 border-green-300 text-xs ";
              } else if (isToday) {
                className += "bg-gray-100 text-gray-900 font-medium border-gray-400 ";
              } else {
                className += "text-gray-900 hover:bg-white hover:text-green-600 hover:border-green-300 cursor-pointer bg-gray-50 ";
              }

              return (
                <div
                  key={day.toISOString()}
                  className={className}
                  onClick={() => {
                    if (!isSaving && !isPast) {
                      toggleDateAvailability(day);
                    }
                  }}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        {/* Navigation avec flèches */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Cliquer sur les flèches pour défiler
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`h-8 w-8 p-0 transition-all duration-200 ${
                canGoBack 
                  ? "bg-[#32323a] hover:bg-[#3a3a42] text-white hover:text-white border-[#32323a] hover:border-[#3a3a42] hover:scale-105 hover:shadow-lg cursor-pointer" 
                  : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
              }`}
              onClick={() => canGoBack && navigateMonth('prev')}
              disabled={!canGoBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-[#32323a] hover:bg-[#3a3a42] text-white hover:text-white border-[#32323a] hover:border-[#3a3a42] transition-all duration-200 hover:scale-105 hover:shadow-lg"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendriers - deux sur desktop, un sur mobile */}
        {/* Version Desktop - deux calendriers côte à côte */}
        <div className="hidden lg:flex gap-4">
          {renderMonth(currentMonth, format(currentMonth, 'MMMM yyyy', { locale: fr }))}
          {renderMonth(nextMonth, format(nextMonth, 'MMMM yyyy', { locale: fr }))}
        </div>
        
        {/* Version Mobile - un seul calendrier */}
        <div className="lg:hidden">
          {renderMonth(currentMonth, format(currentMonth, 'MMMM yyyy', { locale: fr }))}
        </div>

        {/* Légende */}
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-50 border border-gray-400 rounded-sm"></div>
            <span className="text-gray-600">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm"></div>
            <span className="text-gray-600">Réservé</span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && properties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement de vos propriétés...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Layout principal avec section d'aide toujours visible */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Contenu principal - 2/3 de la largeur */}
        <div className="flex-1 lg:w-2/3 space-y-6">
      {/* Sélection de propriété */}
          {/* Version Desktop avec Card */}
          <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle className="text-lg">Sélectionner une annonce</CardTitle>
          <CardDescription>
            Choisissez la propriété dont vous souhaitez gérer le calendrier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une propriété" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{property.title}</span>
                        <Badge variant={property.status === 'active' ? "default" : "secondary"}>
                          {property.status === 'active' ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProperty && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                    {selectedProperty.images && selectedProperty.images.length > 0 ? (
                      <img
                        src={selectedProperty.images[0]}
                        alt={selectedProperty.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{selectedProperty.title}</h3>
                    <p className="text-sm text-gray-600">{selectedProperty.location}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

          {/* Version Mobile sans Card */}
          <div className="lg:hidden space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Sélectionner une annonce</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Choisissez la propriété dont vous souhaitez gérer le calendrier
              </p>
            </div>
            
            <div>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une propriété" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span className="truncate max-w-[120px]" title={property.title}>
                      {property.title.length > 15 ? `${property.title.substring(0, 15)}...` : property.title}
                    </span>
                    <Badge variant={property.status === 'active' ? "default" : "secondary"}>
                      {property.status === 'active' ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProperty && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                    {selectedProperty.images && selectedProperty.images.length > 0 ? (
                      <img
                        src={selectedProperty.images[0]}
                        alt={selectedProperty.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900" title={selectedProperty.title}>
                      {selectedProperty.title.length > 25 ? `${selectedProperty.title.substring(0, 25)}...` : selectedProperty.title}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedProperty.location}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

      {/* Calendrier */}
      {selectedPropertyId && (
            <>
              {/* Version Desktop avec Card */}
              <Card className="hidden lg:block">
            <CardHeader>
              <CardTitle className="text-lg">Calendrier de disponibilité</CardTitle>
              <CardDescription>
                    Cliquez sur une date pour la bloquer et sur une date réservée pour la libérer
              </CardDescription>
            </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
                  <p className="text-muted-foreground">Chargement du calendrier...</p>
                </div>
              </div>
            ) : (
              renderCalendarGrid()
            )}
          </CardContent>
        </Card>

              {/* Version Mobile sans Card */}
              <div className="lg:hidden space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Calendrier de disponibilité</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cliquez sur une date pour la bloquer et sur une date réservée pour la libérer
                  </p>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
                      <p className="text-muted-foreground">Chargement du calendrier...</p>
                    </div>
                  </div>
                ) : (
                  renderCalendarGrid()
                )}
              </div>
            </>
      )}

      {/* Message si aucune propriété */}
      {properties.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune propriété trouvée</h3>
            <p className="text-muted-foreground mb-4">
              Vous devez d'abord créer une propriété pour gérer son calendrier
            </p>
          </CardContent>
        </Card>
      )}
        </div>

        {/* Section Besoin d'aide - 1/3 de la largeur - toujours visible */}
        <div className="lg:w-1/3">
          {/* Version Desktop avec Card */}
          <Card className="h-fit sticky top-6 hidden lg:block">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-gray-700">
                Besoin d'aide ?
              </CardTitle>
              <CardDescription>
                Faites appel à un professionnel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pr-0">
              {/* Services professionnels - Style PropertyDetail */}
              <div className="space-y-4">
                {/* SOS Piscine */}
                <div 
                  className="flex gap-3 cursor-pointer items-center"
                  onClick={() => window.open('https://example.com/sos-piscine', '_blank')}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop"
                      alt="SOS Piscine"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primaryText mb-1 text-sm">SOS Piscine</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Besoin d'entretenir votre piscine ? Nos experts interviennent rapidement pour un service de qualité.
                    </p>
                  </div>
                </div>

                {/* Ménage Express */}
                <div 
                  className="flex gap-3 cursor-pointer items-center"
                  onClick={() => window.open('https://example.com/menage-express', '_blank')}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop"
                      alt="Ménage Express"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primaryText mb-1 text-sm">Ménage Express</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Service de ménage professionnel entre deux locations pour un logement impeccable.
                    </p>
                  </div>
                </div>

                {/* Réparation Urgente */}
                <div 
                  className="flex gap-3 cursor-pointer items-center"
                  onClick={() => window.open('https://example.com/reparation-urgente', '_blank')}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop"
                      alt="Réparation Urgente"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primaryText mb-1 text-sm">Réparation Urgente</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Dépannage rapide pour tous vos problèmes techniques. Intervention sous 24h garantie.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version Mobile sans Card */}
          <div className="lg:hidden space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-700">
                <HelpCircle className="h-5 w-5 text-primary" />
                Besoin d'aide ?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Faites appel à un professionnel
              </p>
            </div>
            
            {/* Services professionnels - Style PropertyDetail */}
            <div className="space-y-4">
              {/* SOS Piscine */}
              <div 
                className="flex gap-3 cursor-pointer items-center"
                onClick={() => window.open('https://example.com/sos-piscine', '_blank')}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop"
                    alt="SOS Piscine"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-primaryText mb-1 text-sm">SOS Piscine</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Besoin d'entretenir votre piscine ? Nos experts interviennent rapidement pour un service de qualité.
                  </p>
                </div>
              </div>

              {/* Ménage Express */}
              <div 
                className="flex gap-3 cursor-pointer items-center"
                onClick={() => window.open('https://example.com/menage-express', '_blank')}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop"
                    alt="Ménage Express"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-primaryText mb-1 text-sm">Ménage Express</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Service de ménage professionnel entre deux locations pour un logement impeccable.
                  </p>
                </div>
              </div>

              {/* Réparation Urgente */}
              <div 
                className="flex gap-3 cursor-pointer items-center"
                onClick={() => window.open('https://example.com/reparation-urgente', '_blank')}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop"
                    alt="Réparation Urgente"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-primaryText mb-1 text-sm">Réparation Urgente</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Dépannage rapide pour tous vos problèmes techniques. Intervention sous 24h garantie.
                  </p>
                </div>
              </div>
              </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CalendarManagement;
