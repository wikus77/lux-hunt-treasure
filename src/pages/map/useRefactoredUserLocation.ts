
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useSecureContextCheck } from "../../hooks/location/useSecureContextCheck";
import { useGeolocationErrors } from "../../hooks/location/useGeolocationErrors";
import { useGeolocationWatch } from "../../hooks/location/useGeolocationWatch";
import { useLocalStorage } from "../../hooks/useLocalStorage";

// Default fallback to Roma if geolocation fails
const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];
const GEO_PERMISSION_KEY = "geoPermission";
const MAX_ATTEMPTS = 3;

export function useRefactoredUserLocation() {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const watchIdRef = useRef<number | null>(null);
  const fallbackActivated = useRef<boolean>(false);
  const locationAttemptsRef = useRef<number>(0);

  const { isSecureContext, isGeolocationAvailable } = useSecureContextCheck();
  const { handleGeolocationError } = useGeolocationErrors();
  const { startWatchingPosition, clearWatch } = useGeolocationWatch();
  const [geoPermission, setGeoPermission] = useLocalStorage<string>(GEO_PERMISSION_KEY, "prompt");

  // Function to handle success callback from geolocation
  const handlePositionSuccess = (position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;
    console.log(`Position received with accuracy ${accuracy}m:`, 
      { latitude, longitude, timestamp: position.timestamp }
    );
    
    // Set location and update state
    setCurrentLocation([latitude, longitude]);
    setIsLoading(false);
    
    // Store permission status
    setGeoPermission("granted");
  };

  // Function to attempt high accuracy geolocation
  const attemptHighAccuracyLocation = () => {
    console.log("Attempting high accuracy geolocation...");
    
    if (watchIdRef.current !== null) {
      clearWatch(watchIdRef.current);
    }
    
    const id = startWatchingPosition({
      onSuccess: handlePositionSuccess,
      onError: (error) => {
        console.warn("High accuracy geolocation error:", error.message, error.code);
        
        // If high accuracy fails, try with lower accuracy
        if (!fallbackActivated.current) {
          fallbackActivated.current = true;
          attemptLowAccuracyLocation();
        }
      },
      options: { 
        enableHighAccuracy: true, 
        timeout: 40000, // 40 seconds timeout as requested
        maximumAge: 0    // Don't use cached position
      }
    });
    
    if (id) {
      watchIdRef.current = id;
    }
  };
  
  // Function to attempt lower accuracy geolocation
  const attemptLowAccuracyLocation = () => {
    console.log("Attempting low accuracy geolocation...");
    
    if (watchIdRef.current !== null) {
      clearWatch(watchIdRef.current);
    }
    
    // Try with lower accuracy settings
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      (error) => {
        console.warn("Low accuracy geolocation error:", error.message, error.code);
        
        // If both high and low accuracy attempts fail, try IP-based fallback
        locationAttemptsRef.current += 1;
        if (locationAttemptsRef.current < MAX_ATTEMPTS) {
          console.log(`Retrying location (attempt ${locationAttemptsRef.current + 1}/${MAX_ATTEMPTS})...`);
          setTimeout(attemptHighAccuracyLocation, 1000);
        } else {
          activateFallback(error);
        }
      },
      { 
        enableHighAccuracy: false, 
        timeout: 40000, // 40 seconds timeout as requested
        maximumAge: 60000 // Allow cached position up to 1 minute old
      }
    );
  };

  // Function to activate fallback measures when geolocation fails
  const activateFallback = (error: GeolocationPositionError) => {
    // Only show specific toast for permission denied
    if (error.code === 1) {
      console.log("Geolocation permission denied");
      setGeoPermission("denied");
      toast.error("Accesso alla posizione negato", {
        description: "Per vedere la tua posizione sulla mappa, attiva la localizzazione nelle impostazioni del browser."
      });
    } else {
      console.log("Geolocation failed with error:", error.message);
      // For other errors, give a generic message
      toast.error("Impossibile rilevare la posizione", {
        description: "Utilizziamo una posizione predefinita. Puoi riprovare più tardi."
      });
    }
    
    // Default to Roma as fallback location
    console.log("Using fallback location (Roma)");
    setCurrentLocation(DEFAULT_LOCATION);
    setIsLoading(false);
  };

  // Main geolocation setup effect
  useEffect(() => {
    // Reset state
    setIsLoading(true);
    fallbackActivated.current = false;
    locationAttemptsRef.current = 0;

    try {      
      // Check for secure context first
      if (!isSecureContext()) {
        console.error("Not running in secure context (HTTPS required for geolocation)");
        toast.error("Errore di sicurezza", {
          description: "La geolocalizzazione richiede una connessione HTTPS sicura."
        });
        setCurrentLocation(DEFAULT_LOCATION);
        setIsLoading(false);
        return;
      }

      // Check if geolocation is supported
      if (!isGeolocationAvailable()) {
        console.error("Geolocation not supported");
        toast.error("Geolocalizzazione non supportata", {
          description: "Il tuo browser non supporta la geolocalizzazione."
        });
        setCurrentLocation(DEFAULT_LOCATION);
        setIsLoading(false);
        return;
      }

      // Get stored permission state
      // If permission was previously denied and we don't want to prompt again
      if (geoPermission === 'denied') {
        console.log("Geolocation previously denied, using fallback without prompting");
        setCurrentLocation(DEFAULT_LOCATION);
        setIsLoading(false);
        return;
      }
      
      console.log("Starting geolocation with watchPosition...");
      attemptHighAccuracyLocation();
      
    } catch (e) {
      console.error("Unexpected error in geolocation setup:", e);
      // Default to Roma in case of generic error
      setCurrentLocation(DEFAULT_LOCATION);
      setIsLoading(false);
    }
    
    // Cleanup function to clear watches when unmounting
    return () => {
      if (watchIdRef.current !== null) {
        clearWatch(watchIdRef.current);
      }
    };
  }, [isSecureContext, isGeolocationAvailable, geoPermission, setGeoPermission, clearWatch]);

  return { currentLocation, isLoading };
}
