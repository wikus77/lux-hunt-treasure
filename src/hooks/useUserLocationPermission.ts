
import { useState, useEffect, useCallback } from "react";

// Key su localStorage per il permesso concesso/diniego
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
  const [loading, setLoading] = useState(false);
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
          enableHighAccuracy: false, // Set to false for faster response
          timeout: 8000, // 8 seconds timeout
          maximumAge: 60000 // 1 minute cache
        }
      );
    } catch (e) {
      console.error("Unexpected error in geolocation request:", e);
      setError("Errore imprevisto nella geolocalizzazione");
      setLoading(false);
    }
  }, [lastAttempt]);

  // Check stored permission and get location on initial load
  useEffect(() => {
    const storedPermission = localStorage.getItem(GEO_PERMISSION_KEY);
    
    if (storedPermission === "granted") {
      setPermission("granted");
      getCurrentPosition();
    } else if (storedPermission === "denied") {
      setPermission("denied");
    } else {
      setPermission("prompt");
      // Try to get position automatically on first load
      getCurrentPosition();
    }
  }, [getCurrentPosition]);

  // Function to explicitly ask for permission
  const askPermission = useCallback(() => {
    console.log("Asking for geolocation permission");
    getCurrentPosition();
  }, [getCurrentPosition]);

  return { permission, userLocation, askPermission, loading, error };
}
