import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationService, LocationResult as DBLocationResult } from '@/lib/locationService';

export interface LocationResult {
  id: string;
  name: string;
  type: 'city' | 'region';
  city_name?: string;
  display_name: string;
  slug: string;
}

interface LocationAutocompleteProps {
  placeholder?: string;
  className?: string;
  useRelativePositioning?: boolean;
  onLocationSelect?: (location: LocationResult) => void;
  onClick?: () => void;
  value?: string;
  onChange?: (value: string) => void;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  placeholder = "Rechercher une localisation...",
  className,
  useRelativePositioning = false,
  onLocationSelect,
  onClick,
  value: controlledValue,
  onChange
}) => {
  const [query, setQuery] = useState(controlledValue || '');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Gérer la valeur contrôlée
  const inputValue = controlledValue !== undefined ? controlledValue : query;

  // Fonction de recherche avec debounce
  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Utiliser le service de base de données pour récupérer les villes et régions
      const dbResults = await LocationService.searchLocations(searchQuery, 8);
      
      setResults(dbResults);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Erreur lors de la recherche de localisation:', error);
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce la recherche
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(inputValue);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue]);

  // Gérer les changements d'input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
  };

  // Gérer la sélection d'un résultat
  const handleLocationSelect = (location: LocationResult) => {
    setQuery(location.display_name);
    onChange?.(location.display_name);
    setShowResults(false);
    onLocationSelect?.(location);
  };

  // Gérer les touches du clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleLocationSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Fermer les résultats quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formater le nom d'affichage
  const formatDisplayName = (location: LocationResult) => {
    return location.display_name;
  };


  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={onClick}
          className={cn("pl-10", className)}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Résultats de recherche */}
      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          className={cn(
            "w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto",
            useRelativePositioning ? "relative" : "absolute"
          )}
          style={{
            zIndex: 9999,
            position: useRelativePositioning ? 'relative' : 'absolute',
            top: useRelativePositioning ? 'auto' : '100%',
            left: useRelativePositioning ? 'auto' : 0,
            right: useRelativePositioning ? 'auto' : 0
          }}
        >
          {results.map((location, index) => (
            <div
              key={location.id}
              className={cn(
                "px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0",
                index === selectedIndex && "bg-gray-100"
              )}
              onClick={() => handleLocationSelect(location)}
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {formatDisplayName(location)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {location.type === 'city' ? 'Ville' : 'Région'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun résultat */}
      {showResults && results.length === 0 && !isLoading && inputValue.length >= 2 && (
        <div
          ref={resultsRef}
          className={cn(
            "w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4",
            useRelativePositioning ? "relative" : "absolute"
          )}
          style={{
            zIndex: 9999,
            position: useRelativePositioning ? 'relative' : 'absolute',
            top: useRelativePositioning ? 'auto' : '100%',
            left: useRelativePositioning ? 'auto' : 0,
            right: useRelativePositioning ? 'auto' : 0
          }}
        >
          <div className="text-sm text-gray-500 text-center">
            Aucun résultat trouvé pour "{inputValue}"
          </div>
        </div>
      )}
    </div>
  );
};

export { LocationAutocomplete };
