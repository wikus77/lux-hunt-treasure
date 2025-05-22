
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export const useLocationWatcher = (
  isSecureContext: boolean,
  permission: "granted" | "denied" | "prompt",
  map: google.maps.Map | null
) => {
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationReceived, setLocationReceived] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  
  // Clear any previous watchPosition
  const clearWatch = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);
  
  // Set up watchPosition for user location
  const setupWatchPosition = useCallback(() => {
    if (!isSecureContext) {
      toast.error("Contesto non sicuro", {
        description: "Questa pagina deve essere caricata in HTTPS per utilizzare la geolocalizzazione."
      });
      return;
    }

    if ('geolocation' in navigator && permission === 'granted') {
      // Clear any previous watches
      clearWatch();

      console.log("Setting up position watching...");
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Position update received:", { latitude, longitude });
          
          if (map) {
            map.panTo({ lat: latitude, lng: longitude });
          }
          
          // We don't have setUserLocation, the userLocation comes from the hook
          // No need to update it directly as it's managed by useUserLocationPermission
          setLocationReceived(true);
          setRetryAttempts(0);
        },
        (error) => {
          console.error("Watch position error:", error);
          if (error.code === 1) { // PERMISSION_DENIED
            toast.error("Accesso alla posizione negato", {
              description: "Per vedere la tua posizione sulla mappa, attiva la localizzazione nelle impostazioni del browser."
            });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        }
      );
      
      setWatchId(id);
      return id;
    }
    return null;
  }, [isSecureContext, permission, map, clearWatch]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearWatch();
    };
  }, [clearWatch]);
  
  // Retry getting location
  const retryGetLocation = useCallback(() => {
    if (!isSecureContext) {
      toast.error("Contesto non sicuro", {
        description: "Questa pagina deve essere caricata in HTTPS per utilizzare la geolocalizzazione."
      });
      return;
    }
    
    console.log("Retrying location detection...");
    // Reset location state before retrying
    setLocationReceived(false);
    setRetryAttempts(0);
    
    // Clear any previous watch
    clearWatch();
    
    // Show a toast to inform the user
    toast.info("Richiesta posizione in corso", {
      description: "Assicurati di concedere l'autorizzazione quando richiesto dal browser."
    });
  }, [isSecureContext, clearWatch]);

  return {
    watchId,
    locationReceived,
    retryAttempts,
    setupWatchPosition,
    clearWatch,
    retryGetLocation,
    setRetryAttempts
  };
};
