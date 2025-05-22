
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

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
  const MAX_RETRIES = 3;

  // Function to check if geolocation is available in the browser
  const isGeolocationAvailable = () => {
    return 'geolocation' in navigator;
  };

  // Get current position using Geolocation API with improved error handling
  const getCurrentPosition = useCallback((isRetry = false) => {
    if (!isGeolocationAvailable()) {
      console.error("Geolocation not available in this browser");
      setError("La geolocalizzazione non è supportata dal tuo browser");
      setPermission("denied");
      localStorage.setItem(GEO_PERMISSION_KEY, "denied");
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests 
    const now = Date.now();
    if (!isRetry && lastAttempt && now - lastAttempt < 3000) {
      console.log("Skipping duplicate geolocation request");
      return;
    }
    
    setLastAttempt(now);
    setLoading(true);
    setError(null);
    
    console.log("Requesting user position...");
    
    try {
      // First check permission status if browser supports it
      if (navigator.permissions && 'query' in navigator.permissions) {
        navigator.permissions.query({name: 'geolocation'})
          .then(permissionStatus => {
            console.log('Geolocation permission status:', permissionStatus.state);
            
            // Add listener for permission changes
            permissionStatus.onchange = () => {
              console.log('Geolocation permission changed to:', permissionStatus.state);
              if (permissionStatus.state === 'granted') {
                // Re-request position if user grants permission
                getCurrentPosition();
              }
            };
          })
          .catch(err => {
            console.error('Error checking permission:', err);
          });
      }
        
      // Request position with improved options
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Position obtained:", { latitude, longitude });
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
        (error) => {
          console.error("Geolocation error:", error.message, error.code);
          
          let errorMessage = "Impossibile ottenere la tua posizione.";
          let shouldRetry = false;
          
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = "Accesso alla posizione negato dall'utente.";
              toast.error("Accesso alla posizione negato", {
                description: "Per vedere la tua posizione sulla mappa, attiva la localizzazione nelle impostazioni del browser."
              });
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = "Informazioni sulla posizione non disponibili.";
              toast.error("Posizione non disponibile", {
                description: "Il tuo dispositivo non è riuscito a determinare la tua posizione attuale."
              });
              shouldRetry = true;
              break;
            case 3: // TIMEOUT
              errorMessage = "Timeout nella richiesta della posizione.";
              toast.error("Richiesta scaduta", {
                description: "La richiesta della posizione ha impiegato troppo tempo. Riprova."
              });
              shouldRetry = true;
              break;
          }
          
          setError(errorMessage);
          setPermission(error.code === 1 ? "denied" : "prompt");
          localStorage.setItem(GEO_PERMISSION_KEY, error.code === 1 ? "denied" : "prompt");
          setLoading(false);
          
          // Auto retry logic for timeout and position unavailable errors
          if (shouldRetry && retryCount < MAX_RETRIES) {
            const nextRetryCount = retryCount + 1;
            setRetryCount(nextRetryCount);
            console.log(`Retrying geolocation (${nextRetryCount}/${MAX_RETRIES})...`);
            
            // Progressive backoff for retries
            setTimeout(() => {
              getCurrentPosition(true);
            }, 5000); // 5 seconds between retries
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000, // Increased to 20 seconds from 10 seconds
          maximumAge: 0 // Don't use cached position
        }
      );
    } catch (e) {
      console.error("Unexpected error in geolocation request:", e);
      setError("Errore imprevisto nella geolocalizzazione");
      setLoading(false);
      setPermission("denied");
      toast.error("Errore di geolocalizzazione", {
        description: "Si è verificato un errore imprevisto durante la richiesta della posizione."
      });
    }
  }, [lastAttempt, retryCount]);

  // Force location request immediately on component mount
  useEffect(() => {
    // Clear any previous stored permission to ensure we always try to get location
    localStorage.removeItem(GEO_PERMISSION_KEY);
    
    // Always try to get the location on component mount
    console.log("Initial geolocation request on component mount");
    getCurrentPosition();
    
    // Clear any possible watches to prevent memory leaks
    return () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.clearWatch(
          navigator.geolocation.watchPosition(() => {}, () => {})
        );
      }
    };
  }, [getCurrentPosition]);

  // Function to explicitly ask for permission
  const askPermission = useCallback(() => {
    console.log("Explicitly asking for geolocation permission");
    setRetryCount(0); // Reset retry count
    getCurrentPosition();
    
    // Try to clear any cached decisions in browser
    if ('geolocation' in navigator) {
      navigator.geolocation.clearWatch(
        navigator.geolocation.watchPosition(() => {}, () => {})
      );
    }
  }, [getCurrentPosition]);

  return { permission, userLocation, askPermission, loading, error };
}
