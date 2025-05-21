
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

  // Function to check if geolocation is available in the browser
  const isGeolocationAvailable = () => {
    return 'geolocation' in navigator;
  };

  // Get current position using Geolocation API
  const getCurrentPosition = useCallback(() => {
    if (!isGeolocationAvailable()) {
      setError("La geolocalizzazione non è supportata dal tuo browser");
      setPermission("denied");
      localStorage.setItem(GEO_PERMISSION_KEY, "denied");
      return;
    }

    setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setPermission("granted");
        localStorage.setItem(GEO_PERMISSION_KEY, "granted");
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        setError("Impossibile ottenere la tua posizione.");
        setPermission("denied");
        localStorage.setItem(GEO_PERMISSION_KEY, "denied");
        setLoading(false);
        
        // Default fallback to Milano
        setUserLocation([45.4642, 9.19]);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute cache
      }
    );
  }, []);

  // Check stored permission and get location on initial load
  useEffect(() => {
    const storedPermission = localStorage.getItem(GEO_PERMISSION_KEY);
    
    if (storedPermission === "granted") {
      setPermission("granted");
      getCurrentPosition();
    } else if (storedPermission === "denied") {
      setPermission("denied");
      // Default a Milano in caso di permesso negato
      setUserLocation([45.4642, 9.19]);
    } else {
      setPermission("prompt");
      // Try to get position automatically on first load
      getCurrentPosition();
    }
  }, [getCurrentPosition]);

  // Function to explicitly ask for permission
  const askPermission = useCallback(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return { permission, userLocation, askPermission, loading, error };
}
