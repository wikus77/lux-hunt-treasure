import React, { useState, useEffect, useCallback } from 'react';
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

// Default fallback location (Milano)
const DEFAULT_LOCATION: [number, number] = [45.4642, 9.19];

// Custom component to update the map view
function SetViewOnChange({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map && center && Array.isArray(center) && center.length === 2) {
      // Ensure all values are valid before setting view
      if (!isNaN(center[0]) && !isNaN(center[1]) && !isNaN(zoom)) {
        try {
          console.log("Setting map view to:", center, zoom);
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
  const { permission, userLocation: geoLocation, askPermission, loading, error } = useUserLocationPermission();
  const [mapReady, setMapReady] = useState(false);
  const [locationReceived, setLocationReceived] = useState(false);
  
  // Get user's location with improved logging and error handling
  useEffect(() => {
    console.log("Geolocation status:", { permission, loading, error });
    console.log("Geolocation data:", geoLocation);
    
    if (permission === 'granted' && geoLocation) {
      // Validate coordinates before setting them
      if (Array.isArray(geoLocation) && geoLocation.length === 2 && 
          !isNaN(geoLocation[0]) && !isNaN(geoLocation[1])) {
        console.log("Setting user location to:", geoLocation);
        setUserLocation(geoLocation);
        setLocationReceived(true);
        
        // Show success toast
        toast.success("Posizione localizzata", {
          description: "La tua posizione è stata utilizzata per centrare la mappa."
        });
      }
    } else if (permission === 'prompt') {
      console.log("Requesting geolocation permission...");
      askPermission();
    } else if (permission === 'denied') {
      console.log("Geolocation permission denied, using fallback");
      toast.error("Posizione non disponibile", {
        description: "Non è stato possibile localizzarti. Alcune funzionalità potrebbero essere limitate."
      });
      
      // Set fallback location
      setUserLocation(DEFAULT_LOCATION);
    }
    
    // Handle loading timeouts
    if (loading && !error && !geoLocation) {
      const timeoutId = setTimeout(() => {
        if (!locationReceived) {
          console.log("Geolocation timed out, using fallback");
          setUserLocation(DEFAULT_LOCATION);
          toast.warning("Localizzazione lenta", {
            description: "La tua posizione sta impiegando troppo tempo, utilizziamo una posizione temporanea."
          });
        }
      }, 5000); // 5 seconds timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [permission, geoLocation, askPermission, loading, error, locationReceived]);
  
  // In a real application, this would come from your backend
  useEffect(() => {
    // Simulated prize location near user or default to Rome
    setTimeout(() => {
      try {
        // Use user location if available, otherwise use default
        const baseLocation = userLocation || DEFAULT_LOCATION;
        
        // Random offset within a certain range from user's location
        const latOffset = (Math.random() - 0.5) * 0.05;
        const lngOffset = (Math.random() - 0.5) * 0.05;
        
        // Validate before setting
        const newLat = baseLocation[0] + latOffset;
        const newLng = baseLocation[1] + lngOffset;
        
        if (!isNaN(newLat) && !isNaN(newLng)) {
          console.log("Setting prize location to:", [newLat, newLng]);
          setPrizeLocation([newLat, newLng]);
        
          // Set buffer radius based on clues unlocked (simulated)
          const unlockedClues = parseInt(localStorage.getItem('unlockedClues') || '0');
          const newRadius = Math.max(100, 2000 - unlockedClues * 200); // Shrinks as more clues are unlocked
          setBufferRadius(newRadius);
        }
      } catch (err) {
        console.error("Error setting prize location:", err);
      }
    }, 1000);
  }, [userLocation]);
  
  // Define map center based on availability
  const mapCenter = userLocation || DEFAULT_LOCATION;
  const mapZoom = userLocation ? 15 : 13; // Closer zoom when user location is available
  
  // Handle map ready state
  const handleMapReady = useCallback(() => {
    setMapReady(true);
    console.log("Map component is mounted and ready");
    
    // Try to get location again if not available yet
    if (!userLocation && permission !== 'denied') {
      askPermission();
    }
  }, [userLocation, permission, askPermission]);
  
  // Retry getting location after a timeout
  const retryGetLocation = () => {
    console.log("Retrying location detection...");
    askPermission();
  };

  return (
    <div style={{ height: '60vh', width: '100%', zIndex: 1 }} className="rounded-lg overflow-hidden">
      <MapContainer 
        style={{ height: '100%', width: '100%' }}
        whenReady={handleMapReady}
      >
        <TileLayer
          url={mapSettings.tileUrl}
          // Remove attribution prop since it's not supported
        />
        
        {/* Circle showing approximate prize location - only show when ready and has valid data */}
        {mapReady && prizeLocation && bufferRadius && (
          <Circle
            center={prizeLocation}
            // Move radius into pathOptions
            pathOptions={{
              color: '#00D1FF',
              fillColor: '#00D1FF',
              fillOpacity: 0.2,
              weight: 2,
              radius: bufferRadius
            }}
          />
        )}
        
        {/* User location marker - only show when ready and has valid data */}
        {mapReady && userLocation && (
          <Marker position={userLocation} />
        )}
        
        {/* Update the view when center changes and map is ready */}
        {mapReady && mapCenter && (
          <SetViewOnChange center={mapCenter} zoom={mapZoom} />
        )}
      </MapContainer>
      
      {permission === 'denied' && (
        <div 
          className="absolute bottom-4 left-0 right-0 mx-auto w-max px-6 py-2 bg-black/70 text-white rounded-full text-sm cursor-pointer"
          onClick={retryGetLocation}
        >
          Posizione non disponibile. Tocca per attivare.
        </div>
      )}
      
      {loading && !locationReceived && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-md">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Rilevamento posizione...
        </div>
      )}
    </div>
  );
};

export default MapLogicProvider;
