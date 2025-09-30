import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet avec Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configuration des icônes par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapSelectorProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

// Composant pour gérer les clics sur la carte
const MapClickHandler: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({
  latitude,
  longitude,
  onLocationSelect,
  height = '400px',
  className = ''
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([latitude, longitude]);
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([latitude, longitude]);

  // Mettre à jour la position du marqueur quand les props changent
  useEffect(() => {
    if (latitude && longitude) {
      const newPosition: [number, number] = [latitude, longitude];
      setMarkerPosition(newPosition);
      setMapCenter(newPosition);
    }
  }, [latitude, longitude]);

  const handleLocationSelect = (lat: number, lng: number) => {
    const newPosition: [number, number] = [lat, lng];
    setMarkerPosition(newPosition);
    onLocationSelect(lat, lng);
  };

  // Coordonnées par défaut (Tunis, Tunisie)
  const defaultCenter: [number, number] = [36.8065, 10.1815];

  // Masquer l'attribution Leaflet après le rendu
  useEffect(() => {
    const hideAttribution = () => {
      const attributionElements = document.querySelectorAll('.leaflet-control-attribution');
      attributionElements.forEach(element => {
        (element as HTMLElement).style.display = 'none';
      });
    };

    // Masquer immédiatement
    hideAttribution();
    
    // Masquer après un délai pour s'assurer que Leaflet a rendu
    const timer = setTimeout(hideAttribution, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full ${className}`} style={{ height, zIndex: 1 }}>
      <MapContainer
        center={mapCenter || defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        className="rounded-lg border border-gray-200"
        attributionControl={false}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={markerPosition} />
        <MapClickHandler onLocationSelect={handleLocationSelect} />
      </MapContainer>
    </div>
  );
};

export default MapSelector;
