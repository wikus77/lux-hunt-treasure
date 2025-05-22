
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSecureContextCheck } from "./location/useSecureContextCheck";
import { useGeolocationPermission } from "./location/useGeolocationPermission";
import { useGeolocationErrors } from "./location/useGeolocationErrors";
import { useGeolocationWatch } from "./location/useGeolocationWatch";

// Key for storing permission in localStorage
const GEO_PERMISSION_KEY = "geo_permission_granted";

export type UseUserLocationPermissionResult = {
  permission: "granted" | "denied" | "prompt";
  userLocation: [number, number] | null;
  askPermission: () => void;
  loading: boolean;
  error: string | null;
};

export function useUserLocationPermission(): UseUserLocationPermissionResult {
  const [permission, setPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastAttempt, setLastAttempt] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [watchId, setWatchId] = useState<number | null>(null);
  const MAX_RETRIES = 3;
  
  const { isSecureContext, isGeolocationAvailable } = useSecureContextCheck();
  const { handleGeolocationError, handleSecurityError } = useGeolocationErrors();
  const { checkPermissionStatus } = useGeolocationPermission();
  const { startWatchingPosition, clearWatch } = useGeolocationWatch();

  // Setup watch position for more reliable location updates
  const setupWatchPosition = useCallback(() => {
    if (!isGeolocationAvailable()) {
      console.error("Geolocation not available in this browser or context not secure");
      
      if (!isSecureContext()) {
        const { errorMessage, permissionState } = handleSecurityError();
        setError(errorMessage);
        // Fix: Explicitly cast the string to the correct type
        setPermission(permissionState as "denied" | "granted" | "prompt");
        localStorage.setItem(GEO_PERMISSION_KEY, permissionState);
      } else {
        setError("La geolocalizzazione non è supportata dal tuo browser");
        setPermission("denied");
        localStorage.setItem(GEO_PERMISSION_KEY, "denied");
      }
      
      setLoading(false);
      return null;
    }

    // Check permission status if browser supports it
    checkPermissionStatus().then(permissionStatus => {
      if (permissionStatus) {
        // Add listener for permission changes
        permissionStatus.onchange = () => {
          console.log('Geolocation permission changed to:', permissionStatus.state);
          if (permissionStatus.state === 'granted') {
            // Re-request position if user grants permission
            askPermission();
          }
        };
      }
    });
    
    // Clear any previous watch
    clearWatch(watchId);
    
    const id = startWatchingPosition({
      onSuccess: (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Watch position success:", { latitude, longitude });
        
        setUserLocation([latitude, longitude]);
        setPermission("granted");
        localStorage.setItem(GEO_PERMISSION_KEY, "granted");
        setLoading(false);
        setError(null);
        setRetryCount(0); // Reset retry count on success
        
        // Success notification
        toast.success("Posizione rilevata con successo", {
          description: "La mappa è stata centrata sulla tua posizione attuale."
        });
      },
      onError: (error) => {
        const { errorMessage, shouldRetry, permissionState } = handleGeolocationError(error);
        
        setError(errorMessage);
        // Fix: Explicitly cast the string to the correct type
        setPermission(permissionState as "denied" | "granted" | "prompt");
        localStorage.setItem(GEO_PERMISSION_KEY, permissionState);
        setLoading(false);
        
        // Auto retry logic for timeout and position unavailable errors
        if (shouldRetry && retryCount < MAX_RETRIES) {
          const nextRetryCount = retryCount + 1;
          setRetryCount(nextRetryCount);
          console.log(`Retrying geolocation (${nextRetryCount}/${MAX_RETRIES})...`);
          
          // Progressive backoff for retries
          setTimeout(() => {
            askPermission();
          }, 5000); // 5 seconds between retries
        }
      }
    });
    
    setWatchId(id);
    return id;
  }, [
    isGeolocationAvailable, 
    isSecureContext, 
    handleSecurityError, 
    checkPermissionStatus, 
    clearWatch, 
    watchId, 
    startWatchingPosition, 
    handleGeolocationError, 
    retryCount
  ]);

  // Function to explicitly ask for permission
  const askPermission = useCallback(() => {
    // Prevent multiple simultaneous requests
    const now = Date.now();
    if (lastAttempt && now - lastAttempt < 3000) {
      console.log("Skipping duplicate geolocation request");
      return;
    }
    
    setLastAttempt(now);
    setLoading(true);
    setError(null);
    
    if (!isSecureContext()) {
      setError("Il contesto non è sicuro (HTTPS richiesto)");
      setLoading(false);
      setPermission("denied");
      toast.error("Contesto non sicuro", {
        description: "Questa pagina deve essere caricata in HTTPS per utilizzare la geolocalizzazione."
      });
      return;
    }
    
    console.log("Explicitly asking for geolocation permission");
    
    // Setup watch position to continuously get updates
    setupWatchPosition();
  }, [lastAttempt, setupWatchPosition, isSecureContext]);

  // Force location request immediately on component mount
  useEffect(() => {
    // Clear any previous stored permission to ensure we always try to get location
    localStorage.removeItem(GEO_PERMISSION_KEY);
    
    // Always try to get the location on component mount
    console.log("Initial geolocation request on component mount");
    askPermission();
    
    // Cleanup function to clear watch
    return () => {
      clearWatch(watchId);
    };
  }, [askPermission, watchId, clearWatch]);

  return { permission, userLocation, askPermission, loading, error };
}
