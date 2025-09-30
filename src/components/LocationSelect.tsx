import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationService, LocationResult } from '@/lib/locationService';

export interface LocationSelectProps {
  placeholder?: string;
  className?: string;
  onLocationSelect?: (location: LocationResult | null) => void;
  value?: LocationResult | null;
  disabled?: boolean;
}

const LocationSelect: React.FC<LocationSelectProps> = ({
  placeholder = "Sélectionner une localisation...",
  className,
  onLocationSelect,
  value,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allLocations, setAllLocations] = useState<LocationResult[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Charger toutes les villes et régions au montage du composant
  useEffect(() => {
    const loadAllLocations = async () => {
      setIsLoading(true);
      try {
        // Charger toutes les villes
        const cities = await LocationService.getAllCities();
        
        // Charger toutes les régions avec leurs villes
        const { data: regions, error } = await LocationService.supabase
          .from('regions')
          .select(`
            id,
            name,
            slug,
            is_active,
            city_id,
            cities!inner(name)
          `)
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Erreur lors du chargement des régions:', error);
        }

        const allResults: LocationResult[] = [];

        // Ajouter les villes
        cities.forEach(city => {
          allResults.push({
            id: city.id,
            name: city.name,
            type: 'city',
            display_name: city.name,
            slug: city.slug
          });
        });

        // Ajouter les régions
        if (regions) {
          regions.forEach(region => {
            const cityName = (region.cities as any)?.name || '';
            allResults.push({
              id: region.id,
              name: region.name,
              type: 'region',
              city_name: cityName,
              display_name: `${region.name}, ${cityName}`,
              slug: region.slug
            });
          });
        }

        // Trier par nom
        allResults.sort((a, b) => a.name.localeCompare(b.name));
        
        setAllLocations(allResults);
        setFilteredLocations(allResults);
      } catch (error) {
        console.error('Erreur lors du chargement des localisations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllLocations();
  }, []);

  // Filtrer les localisations selon la recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLocations(allLocations);
    } else {
      const filtered = allLocations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (location.city_name && location.city_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredLocations(filtered);
    }
    setSelectedIndex(-1);
  }, [searchQuery, allLocations]);

  // Gérer l'ouverture/fermeture
  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Gérer le focus sur l'input
  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  // Gérer la sélection
  const handleSelect = (location: LocationResult) => {
    onLocationSelect?.(location);
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(-1);
    // Remettre le focus sur l'input après sélection
    setTimeout(() => inputRef.current?.blur(), 100);
  };

  // Gérer la suppression de la sélection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLocationSelect?.(null);
    setSearchQuery('');
  };

  // Gérer les touches du clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        toggleOpen();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredLocations.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredLocations.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredLocations.length) {
          handleSelect(filteredLocations[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        setSelectedIndex(-1);
        break;
    }
  };

  // Fermer quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll vers l'élément sélectionné
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input principal */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={isOpen ? searchQuery : (value ? value.display_name : '')}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className={cn("pl-10 pr-10", className)}
          autoComplete="off"
          disabled={disabled}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <X 
              className="h-4 w-4 cursor-pointer" 
              onClick={handleClear}
            />
          )}
          <ChevronDown className={cn(
            "h-4 w-4 cursor-pointer",
            isOpen && "rotate-180"
          )} onClick={toggleOpen} />
        </div>
      </div>

          {/* Liste déroulante */}
          {isOpen && (
            <div className="relative w-full mt-3 rounded-md border bg-popover text-popover-foreground shadow-md max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:absolute sm:z-50">
          {isLoading ? (
            <div className="p-4 text-center text-sm">
              Chargement des localisations...
            </div>
          ) : filteredLocations.length > 0 ? (
            filteredLocations.map((location, index) => (
              <div
                key={location.id}
                ref={index === selectedIndex ? listRef : undefined}
                className={cn(
                  "px-4 py-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0",
                  index === selectedIndex && "bg-gray-100"
                )}
                onClick={() => handleSelect(location)}
              >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">
                        {location.type === 'city' ? (
                          <span className="font-medium">{location.name}</span>
                        ) : (
                          <>
                            <span className="font-medium">{location.city_name}</span>
                            <span>, {location.name}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs mt-1">
                        {location.type === 'city' ? 'Ville' : ''}
                      </div>
                    </div>
                  </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm">
              {searchQuery ? `Aucun résultat pour "${searchQuery}"` : 'Aucune localisation disponible'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { LocationSelect };
