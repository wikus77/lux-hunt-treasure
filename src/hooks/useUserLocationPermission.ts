
import { useState, useEffect, useCallback } from "react";

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
  const [loading, setLoading] = useState(true); // Initialize as loading
  const [error, setError] = useState<string | null>(null);
  const [lastAttempt, setLastAttempt] = useState<number | null>(null);

  // Function to check if geolocation is available in the browser
  const isGeolocationAvailable = () => {
    return 'geolocation' in navigator;
  };

  // Get current position using Geolocation API with improved error handling
  const getCurrentPosition = useCallback(() => {
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
    if (lastAttempt && now - lastAttempt < 3000) {
      console.log("Skipping duplicate geolocation request");
      return;
    }
    
    setLastAttempt(now);
    setLoading(true);
    setError(null);
    
    console.log("Requesting user position...");
    
    try {
      navigator.permissions && navigator.permissions.query({name: 'geolocation'})
        .then(permissionStatus => {
          console.log('Geolocation permission status:', permissionStatus.state);
          
          // Make sure we don't short-circuit the geolocation request if it was previously denied
          // We'll still request it to give the user a chance to change their mind
        });
        
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Position obtained:", { latitude, longitude });
          setUserLocation([latitude, longitude]);
          setPermission("granted");
          localStorage.setItem(GEO_PERMISSION_KEY, "granted");
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error("Geolocation error:", error.message, error.code);
          
          let errorMessage = "Impossibile ottenere la tua posizione.";
          
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = "Accesso alla posizione negato dall'utente.";
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = "Informazioni sulla posizione non disponibili.";
              break;
            case 3: // TIMEOUT
              errorMessage = "Timeout nella richiesta della posizione.";
              break;
          }
          
          setError(errorMessage);
          setPermission("denied");
          localStorage.setItem(GEO_PERMISSION_KEY, "denied");
          setLoading(false);
        },
        {
          enableHighAccuracy: true, // Using high accuracy for better positioning
          timeout: 15000, // 15 seconds timeout - increased from previous setting
          maximumAge: 0 // Don't use cached position - always get a fresh reading
        }
      );
    } catch (e) {
      console.error("Unexpected error in geolocation request:", e);
      setError("Errore imprevisto nella geolocalizzazione");
      setLoading(false);
      setPermission("denied");
    }
  }, [lastAttempt]);

  // Check stored permission and get location on initial load - IMMEDIATELY
  useEffect(() => {
    // Clear any previous stored permission to ensure we always try to get location
    // when the component mounts - this helps if the user previously denied but has
    // since changed their browser settings
    localStorage.removeItem(GEO_PERMISSION_KEY);
    
    // Always try to get the location on component mount
    console.log("Initial geolocation request on component mount");
    getCurrentPosition();
    
    // Don't rely on stored permission anymore, always prompt the user
    setPermission("prompt");
  }, [getCurrentPosition]);

  // Function to explicitly ask for permission
  const askPermission = useCallback(() => {
    console.log("Explicitly asking for geolocation permission");
    getCurrentPosition();
  }, [getCurrentPosition]);

  return { permission, userLocation, askPermission, loading, error };
}
