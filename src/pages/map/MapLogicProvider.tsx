
import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getDefaultMapSettings } from '@/utils/mapUtils';
import { toast } from 'sonner';
import { useUserLocationPermission } from '@/hooks/useUserLocationPermission';
import { DEFAULT_LOCATION } from './utils/leafletIcons';
import { SetViewOnChange } from './hooks/useMapView';
import UserLocationMarker from './components/UserLocationMarker';
import PrizeLocationCircle from './components/PrizeLocationCircle';
import MapStatusMessages from './components/MapStatusMessages';
import { usePrizeLocation } from './hooks/usePrizeLocation';

const MapLogicProvider = () => {
  const [mapSettings, setMapSettings] = useState(getDefaultMapSettings());
  const { permission, userLocation, askPermission, loading, error } = useUserLocationPermission();
  const [mapReady, setMapReady] = useState(false);
  const [locationReceived, setLocationReceived] = useState(false);
  
  // Get prize location based on user's location
  const { prizeLocation, bufferRadius } = usePrizeLocation(userLocation);
  
  // Handle user location updates
  React.useEffect(() => {
    console.log("Geolocation status:", { permission, loading, error });
    console.log("Geolocation data:", userLocation);
    
    if (permission === 'granted' && userLocation) {
      // Validate coordinates before setting them
      if (Array.isArray(userLocation) && userLocation.length === 2 && 
          !isNaN(userLocation[0]) && !isNaN(userLocation[1])) {
        console.log("Setting user location to:", userLocation);
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
    }
    
    // Handle loading timeouts
    if (loading && !error && !userLocation) {
      const timeoutId = setTimeout(() => {
        if (!locationReceived) {
          console.log("Geolocation timed out, using fallback");
          toast.warning("Localizzazione lenta", {
            description: "La tua posizione sta impiegando troppo tempo, utilizziamo una posizione temporanea."
          });
        }
      }, 5000); // 5 seconds timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [permission, userLocation, askPermission, loading, error, locationReceived]);
  
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
        <TileLayer url={mapSettings.tileUrl} />
        
        {/* Circle showing approximate prize location */}
        {mapReady && prizeLocation && bufferRadius && (
          <PrizeLocationCircle center={prizeLocation} radius={bufferRadius} />
        )}
        
        {/* User location marker */}
        {mapReady && userLocation && (
          <UserLocationMarker position={userLocation} />
        )}
        
        {/* Update the view when center changes and map is ready */}
        {mapReady && mapCenter && (
          <SetViewOnChange center={mapCenter} zoom={mapZoom} />
        )}
      </MapContainer>
      
      <MapStatusMessages 
        isLoading={loading} 
        locationReceived={locationReceived}
        permissionDenied={permission === 'denied'}
        retryGetLocation={retryGetLocation}
      />
    </div>
  );
};

export default MapLogicProvider;
