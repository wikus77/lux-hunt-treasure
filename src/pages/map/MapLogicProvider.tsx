
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getDefaultMapSettings } from '@/utils/mapUtils';
import { toast } from 'sonner';
import { useUserLocationPermission } from '@/hooks/useUserLocationPermission';

// Fix for marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/assets/marker-icon-2x.png',
  iconUrl: '/assets/marker-icon.png',
  shadowUrl: '/assets/marker-shadow.png',
});

const prizeIcon = new L.Icon({
  iconUrl: '/assets/prize-marker.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Custom component to update the map view
function SetViewOnChange({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const MapLogicProvider = () => {
  const [prizeLocation, setPrizeLocation] = useState<[number, number]>([41.9027, 12.4963]); // Roma by default
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [bufferRadius, setBufferRadius] = useState(1000); // 1km
  const [mapSettings, setMapSettings] = useState(getDefaultMapSettings());
  const { permission, userLocation: geoLocation, askPermission } = useUserLocationPermission();
  
  // Get user's location
  useEffect(() => {
    if (permission === 'granted' && geoLocation) {
      setUserLocation(geoLocation);
    } else if (permission === 'prompt') {
      askPermission();
    } else if (permission === 'denied') {
      toast.error("Posizione non disponibile", {
        description: "Non è stato possibile localizzarti. Alcune funzionalità potrebbero essere limitate."
      });
    }
  }, [permission, geoLocation, askPermission]);
  
  // In a real application, this would come from your backend
  useEffect(() => {
    // Simulated prize location near user or default to Rome
    setTimeout(() => {
      if (userLocation) {
        // Random offset within a certain range from user's location
        const latOffset = (Math.random() - 0.5) * 0.05;
        const lngOffset = (Math.random() - 0.5) * 0.05;
        setPrizeLocation([
          userLocation[0] + latOffset,
          userLocation[1] + lngOffset
        ]);
        
        // Set buffer radius based on clues unlocked (simulated)
        const unlockedClues = parseInt(localStorage.getItem('unlockedClues') || '0');
        const newRadius = Math.max(100, 2000 - unlockedClues * 200); // Shrinks as more clues are unlocked
        setBufferRadius(newRadius);
      }
    }, 1000);
  }, [userLocation]);
  
  // Define map center based on availability
  const mapCenter = userLocation || prizeLocation;
  const mapZoom = userLocation ? 15 : 13; // Closer zoom when user location is available
  
  return (
    <div style={{ height: '60vh', width: '100%', zIndex: 1 }} className="rounded-lg overflow-hidden">
      <MapContainer 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url={mapSettings.tileUrl}
        />
        
        {/* Circle showing approximate prize location - Correzione del componente Circle */}
        <Circle
          center={prizeLocation}
          pathOptions={{
            color: '#00D1FF',
            fillColor: '#00D1FF',
            fillOpacity: 0.2,
            weight: 2,
            radius: bufferRadius // Il radius deve essere all'interno di pathOptions per react-leaflet
          }}
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} />
        )}
        
        {/* Update the view when center changes */}
        <SetViewOnChange center={mapCenter} zoom={mapZoom} />
      </MapContainer>
      
      {permission === 'denied' && (
        <div className="absolute bottom-4 left-0 right-0 mx-auto w-max px-6 py-2 bg-black/70 text-white rounded-full text-sm">
          Posizione non disponibile. Tocca per attivare.
        </div>
      )}
    </div>
  );
};

export default MapLogicProvider;
