
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
    if (map && center && Array.isArray(center) && center.length === 2) {
      // Ensure all values are valid before setting view
      if (!isNaN(center[0]) && !isNaN(center[1]) && !isNaN(zoom)) {
        try {
          map.setView(center, zoom);
        } catch (err) {
          console.error("Error setting map view:", err);
        }
      }
    }
  }, [center, zoom, map]);
  return null;
}

const MapLogicProvider = () => {
  const [prizeLocation, setPrizeLocation] = useState<[number, number]>([41.9027, 12.4963]); // Roma by default
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [bufferRadius, setBufferRadius] = useState(1000); // 1km
  const [mapSettings, setMapSettings] = useState(getDefaultMapSettings());
  const { permission, userLocation: geoLocation, askPermission } = useUserLocationPermission();
  const [mapReady, setMapReady] = useState(false);
  
  // Get user's location
  useEffect(() => {
    if (permission === 'granted' && geoLocation) {
      // Validate coordinates before setting them
      if (Array.isArray(geoLocation) && geoLocation.length === 2 && 
          !isNaN(geoLocation[0]) && !isNaN(geoLocation[1])) {
        setUserLocation(geoLocation);
      }
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
        try {
          // Random offset within a certain range from user's location
          const latOffset = (Math.random() - 0.5) * 0.05;
          const lngOffset = (Math.random() - 0.5) * 0.05;
          
          // Validate before setting
          const newLat = userLocation[0] + latOffset;
          const newLng = userLocation[1] + lngOffset;
          
          if (!isNaN(newLat) && !isNaN(newLng)) {
            setPrizeLocation([newLat, newLng]);
          
            // Set buffer radius based on clues unlocked (simulated)
            const unlockedClues = parseInt(localStorage.getItem('unlockedClues') || '0');
            const newRadius = Math.max(100, 2000 - unlockedClues * 200); // Shrinks as more clues are unlocked
            setBufferRadius(newRadius);
          }
        } catch (err) {
          console.error("Error setting prize location:", err);
        }
      }
    }, 1000);
  }, [userLocation]);
  
  // Define map center based on availability
  const mapCenter = userLocation || prizeLocation;
  const mapZoom = userLocation ? 15 : 13; // Closer zoom when user location is available
  
  // Handle map ready state
  const handleMapReady = () => {
    setMapReady(true);
    console.log("Map component is mounted and ready");
  };

  return (
    <div style={{ height: '60vh', width: '100%', zIndex: 1 }} className="rounded-lg overflow-hidden">
      <MapContainer 
        style={{ height: '100%', width: '100%' }}
        center={mapCenter}
        zoom={mapZoom}
        whenReady={handleMapReady}
      >
        <TileLayer
          url={mapSettings.tileUrl}
        />
        
        {/* Circle showing approximate prize location - Correzione del componente Circle */}
        {mapReady && prizeLocation && (
          <Circle
            center={prizeLocation}
            pathOptions={{
              color: '#00D1FF',
              fillColor: '#00D1FF',
              fillOpacity: 0.2,
              weight: 2,
              radius: bufferRadius
            }}
          />
        )}
        
        {/* User location marker */}
        {mapReady && userLocation && (
          <Marker position={userLocation} />
        )}
        
        {/* Update the view when center changes */}
        {mapReady && mapCenter && (
          <SetViewOnChange center={mapCenter} zoom={mapZoom} />
        )}
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
