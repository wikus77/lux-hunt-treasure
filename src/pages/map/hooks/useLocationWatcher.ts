
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Key for storing permission in localStorage
const GEO_PERMISSION_KEY = "geo_permission_granted";

export const useLocationWatcher = (
  isSecureContext: boolean,
  permission: "granted" | "denied" | "prompt",
  map: google.maps.Map | null
) => {
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationReceived, setLocationReceived] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [lastRetryTime, setLastRetryTime] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_INTERVAL = 5000; // 5 seconds between retries
  
  // Clear any previous watchPosition
  const clearWatch = useCallback(() => {
    if (watchId !== null) {
      console.log("Clearing watchPosition");
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);
  
  // Set up watchPosition for user location with improved error handling
  const setupWatchPosition = useCallback(() => {
    // Security check
    if (!isSecureContext) {
      toast.error("Contesto non sicuro", {
        description: "Questa pagina deve essere caricata in HTTPS per utilizzare la geolocalizzazione."
      });
      return null;
    }

    // Check if permission is already granted in localStorage
    const storedPermission = localStorage.getItem(GEO_PERMISSION_KEY);
    if (storedPermission === 'denied') {
      console.log("Geolocation permission previously denied, not requesting again");
      return null;
    }

    // Device capability check
    if (!('geolocation' in navigator)) {
      toast.error("Geolocalizzazione non supportata", {
        description: "Il tuo dispositivo o browser non supporta la geolocalizzazione."
      });
      return null;
    }

    if (permission === 'granted' || permission === 'prompt' || storedPermission === 'granted') {
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
          
          // Store successful permission
          localStorage.setItem(GEO_PERMISSION_KEY, 'granted');
          
          setLocationReceived(true);
          setRetryAttempts(0);
        },
        (error) => {
          console.error("Watch position error:", error);
          
          if (error.code === 1) { // PERMISSION_DENIED
            localStorage.setItem(GEO_PERMISSION_KEY, 'denied');
            toast.error("Accesso alla posizione negato", {
              description: "Per vedere la tua posizione sulla mappa, attiva la localizzazione nelle impostazioni del browser."
            });
          } else if (error.code === 2) { // POSITION_UNAVAILABLE
            toast.error("Posizione non disponibile", {
              description: "Non è stato possibile determinare la tua posizione."
            });
            
            // Auto retry for position unavailable
            if (retryAttempts < MAX_RETRIES) {
              const now = Date.now();
              if (now - lastRetryTime > RETRY_INTERVAL) {
                setRetryAttempts(prev => prev + 1);
                setLastRetryTime(now);
                console.log(`Automatically retrying geolocation (${retryAttempts + 1}/${MAX_RETRIES})...`);
                
                // Try again with getCurrentPosition as a fallback
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("Position obtained via fallback:", { latitude, longitude });
                    
                    if (map) {
                      map.panTo({ lat: latitude, lng: longitude });
                    }
                    
                    localStorage.setItem(GEO_PERMISSION_KEY, 'granted');
                    setLocationReceived(true);
                    setRetryAttempts(0);
                  },
                  () => {}, // Silent error, already shown by watchPosition
                  { enableHighAccuracy: false, timeout: 30000, maximumAge: 0 }
                );
              }
            }
          } else if (error.code === 3) { // TIMEOUT
            toast.error("Timeout", {
              description: "Richiesta scaduta. Riprova."
            });
            
            // Auto retry for timeout, with simplified options
            if (retryAttempts < MAX_RETRIES) {
              const now = Date.now();
              if (now - lastRetryTime > RETRY_INTERVAL) {
                setRetryAttempts(prev => prev + 1);
                setLastRetryTime(now);
                console.log(`Automatically retrying geolocation with lower accuracy (${retryAttempts + 1}/${MAX_RETRIES})...`);
                
                // Try again with lower accuracy and increased timeout
                clearWatch();
                const newId = navigator.geolocation.watchPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("Position update received with lower accuracy:", { latitude, longitude });
                    
                    if (map) {
                      map.panTo({ lat: latitude, lng: longitude });
                    }
                    
                    localStorage.setItem(GEO_PERMISSION_KEY, 'granted');
                    setLocationReceived(true);
                    setRetryAttempts(0);
                  },
                  () => {}, // Silent error, already shown
                  { 
                    enableHighAccuracy: false,
                    timeout: 30000,
                    maximumAge: 60000
                  }
                );
                setWatchId(newId);
              }
            }
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
  }, [isSecureContext, permission, map, clearWatch, retryAttempts, lastRetryTime]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearWatch();
    };
  }, [clearWatch]);
  
  // Manual retry function with permission reset
  const retryGetLocation = useCallback(() => {
    if (!isSecureContext) {
      toast.error("Contesto non sicuro", {
        description: "Questa pagina deve essere caricata in HTTPS per utilizzare la geolocalizzazione."
      });
      return;
    }
    
    // Reset permission in localStorage to try again
    localStorage.removeItem(GEO_PERMISSION_KEY);
    
    console.log("Retrying location detection...");
    // Reset location state before retrying
    setLocationReceived(false);
    setRetryAttempts(0);
    setLastRetryTime(Date.now());
    
    // Clear any previous watch
    clearWatch();
    
    // Show a toast to inform the user
    toast.info("Richiesta posizione in corso", {
      description: "Assicurati di concedere l'autorizzazione quando richiesto dal browser."
    });
    
    setupWatchPosition();
  }, [isSecureContext, clearWatch, setupWatchPosition]);

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
