
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

/**
 * Custom hook for getting user's current location with improved accuracy and error handling
 * 
 * This implementation:
 * - Uses watchPosition instead of getCurrentPosition for better accuracy
 * - Has increased timeout to allow time for GPS signal
 * - Implements multiple fallback strategies
 * - Provides detailed logging for debugging purposes
 */
export function useUserCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const watchIdRef = useRef<number | null>(null);
  const fallbackActivated = useRef<boolean>(false);
  const locationAttemptsRef = useRef<number>(0);

  // Max attempts for getting location
  const MAX_ATTEMPTS = 3;
  
  // Check if we're in a secure context (required for geolocation)
  const [isSecureContext] = useState(() => {
    return typeof window !== 'undefined' && (window.isSecureContext === true);
  });
  
  // Clear any active geolocation watches
  const clearWatches = () => {
    if (watchIdRef.current !== null) {
      console.log("Clearing previous watchPosition...");
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

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
    localStorage.setItem('geoPermission', 'granted');
  };
  
  // Function to attempt high accuracy geolocation
  const attemptHighAccuracyLocation = () => {
    console.log("Attempting high accuracy geolocation...");
    clearWatches();
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      (error) => {
        console.warn("High accuracy geolocation error:", error.message, error.code);
        
        // If high accuracy fails, try with lower accuracy
        if (!fallbackActivated.current) {
          fallbackActivated.current = true;
          attemptLowAccuracyLocation();
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 40000, // 40 seconds timeout as requested
        maximumAge: 0    // Don't use cached position
      }
    );
  };
  
  // Function to attempt lower accuracy geolocation
  const attemptLowAccuracyLocation = () => {
    console.log("Attempting low accuracy geolocation...");
    clearWatches();
    
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
      localStorage.setItem('geoPermission', 'denied');
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
    setCurrentLocation([41.9028, 12.4964]); // Roma as default
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
      if (!isSecureContext) {
        console.error("Not running in secure context (HTTPS required for geolocation)");
        toast.error("Errore di sicurezza", {
          description: "La geolocalizzazione richiede una connessione HTTPS sicura."
        });
        setCurrentLocation([41.9028, 12.4964]); // Roma as default
        setIsLoading(false);
        return () => clearWatches();
      }

      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.error("Geolocation not supported");
        toast.error("Geolocalizzazione non supportata", {
          description: "Il tuo browser non supporta la geolocalizzazione."
        });
        setCurrentLocation([41.9028, 12.4964]); // Roma as default
        setIsLoading(false);
        return () => clearWatches();
      }

      // Get stored permission state
      const geoPermission = localStorage.getItem('geoPermission');
      
      // If permission was previously denied and we don't want to prompt again
      if (geoPermission === 'denied') {
        console.log("Geolocation previously denied, using fallback without prompting");
        setCurrentLocation([41.9028, 12.4964]); // Roma as default
        setIsLoading(false);
        return () => clearWatches();
      }
      
      console.log("Starting geolocation with watchPosition...");
      attemptHighAccuracyLocation();
      
    } catch (e) {
      console.error("Unexpected error in geolocation setup:", e);
      // Default to Roma in case of generic error
      setCurrentLocation([41.9028, 12.4964]);
      setIsLoading(false);
    }
    
    // Cleanup function to clear watches when unmounting
    return () => clearWatches();
  }, [isSecureContext]);

  return currentLocation;
}
