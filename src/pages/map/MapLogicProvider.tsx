
import React, { useState, useEffect } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { toast } from 'sonner';
import MapStatusMessages from './components/MapStatusMessages';
import { useUserLocationPermission } from '@/hooks/useUserLocationPermission';
import { usePrizeLocation } from './hooks/usePrizeLocation';
import HelpDialog from './HelpDialog';
import LoadingScreen from './LoadingScreen';
import MapMarkers from './components/MapMarkers';
import { useGoogleMap } from './hooks/useGoogleMap';
import { useSecureContext } from './hooks/useSecureContext';
import { useLocationWatcher } from './hooks/useLocationWatcher';
import { mapContainerStyle, darkModeStyle } from './utils/mapStyles';

// Key for storing permission in localStorage
const GEO_PERMISSION_KEY = "geo_permission_granted";

const MapLogicProvider = () => {
  // Check if we're in a secure context (required for geolocation)
  const { isSecureContext } = useSecureContext();
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  
  // Load the Google Maps and handle map state
  const {
    map,
    mapZoom,
    isLoaded,
    loadError,
    onMapLoad,
    getMapCenter
  } = useGoogleMap(15);

  // Get user location information using watchPosition for more reliable results
  const { permission, userLocation, askPermission, loading: locationLoading, error: locationError } = useUserLocationPermission();
  
  // Setup location watcher with improved error handling
  const {
    locationReceived,
    setupWatchPosition,
    retryGetLocation
  } = useLocationWatcher(isSecureContext, permission, map);
  
  // Get prize location based on user's location
  const { prizeLocation, bufferRadius } = usePrizeLocation(userLocation);

  // Force HTTPS for geolocation - critical fix
  useEffect(() => {
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }, []);
  
  // Check for stored permission immediately on mount
  useEffect(() => {
    const storedPermission = localStorage.getItem(GEO_PERMISSION_KEY);
    
    if (storedPermission === 'granted' && isSecureContext) {
      console.log("Permission already granted, setting up watch position without prompting");
      setupWatchPosition();
    }
  }, [isSecureContext, setupWatchPosition]);

  // Set up watchPosition for more reliable updates
  useEffect(() => {
    if (isSecureContext && permission === 'granted') {
      console.log("Setting up watch position with granted permission");
      setupWatchPosition();
    }
  }, [isSecureContext, permission, setupWatchPosition]);

  // Request location permission immediately when component mounts - using watchPosition
  useEffect(() => {
    if (isSecureContext) {
      console.log("MapLogicProvider mounted - requesting geolocation");
      
      // Check if we already have permission stored
      const storedPermission = localStorage.getItem(GEO_PERMISSION_KEY);
      if (storedPermission !== 'denied') {
        askPermission(); // Explicit request on mount
        
        // Check status after a delay to ensure the request is processed
        const checkTimer = setTimeout(() => {
          if (permission === 'prompt' && !userLocation) {
            console.log("Retrying permission request after timeout");
            askPermission();
          }
        }, 3000);
        
        return () => clearTimeout(checkTimer);
      } else {
        // If permission was denied, show a helpful message
        toast.error("Accesso alla posizione negato", {
          description: "Per vedere la tua posizione sulla mappa, attiva la localizzazione nelle impostazioni del browser."
        });
      }
    }
  }, [askPermission, permission, userLocation, isSecureContext]);

  // Handle loading state and errors
  if (loadError) return <div className="text-red-500 text-center p-4">Errore nel caricamento della mappa</div>;
  if (!isLoaded) return <LoadingScreen />;

  return (
    <div style={{ height: '60vh', width: '100%', zIndex: 1 }} className="rounded-[24px] overflow-hidden relative">
      {!isSecureContext && (
        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10 p-4">
          <div className="bg-red-500/90 text-white p-4 rounded-xl shadow-lg max-w-md">
            <h3 className="text-lg font-bold mb-2">Errore di sicurezza</h3>
            <p>La geolocalizzazione richiede una connessione sicura (HTTPS).</p>
            <p className="mt-2 text-sm">Questa pagina dovrebbe essere caricata tramite HTTPS per accedere alla tua posizione.</p>
          </div>
        </div>
      )}
      
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={getMapCenter(userLocation)}
        zoom={mapZoom}
        options={{
          styles: darkModeStyle,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
        onLoad={onMapLoad}
      >
        <MapMarkers 
          userLocation={userLocation} 
          prizeLocation={prizeLocation} 
          bufferRadius={bufferRadius} 
        />
      </GoogleMap>
      
      <MapStatusMessages 
        isLoading={locationLoading} 
        locationReceived={locationReceived}
        permissionDenied={permission === 'denied'}
        retryGetLocation={retryGetLocation}
      />
      
      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapLogicProvider;
