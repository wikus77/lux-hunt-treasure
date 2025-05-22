
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Key for storing permission in localStorage
const GEO_PERMISSION_KEY = "geo_permission_granted";

export const useLocationPermission = () => {
  const [permissionState, setPermissionState] = useState<"granted" | "denied" | "prompt">("prompt");
  
  // Check if permission is stored in localStorage
  const checkStoredPermission = useCallback(() => {
    const storedPermission = localStorage.getItem(GEO_PERMISSION_KEY);
    if (storedPermission === 'denied') {
      console.log("Geolocation permission previously denied, not requesting again");
      setPermissionState("denied");
      return false;
    }
    if (storedPermission === 'granted') {
      setPermissionState("granted");
      return true;
    }
    return null;
  }, []);

  // Store permission state in localStorage
  const storePermission = useCallback((state: "granted" | "denied") => {
    localStorage.setItem(GEO_PERMISSION_KEY, state);
    setPermissionState(state);
  }, []);

  // Handle permission denial
  const handlePermissionDenial = useCallback(() => {
    storePermission("denied");
    toast.error("Accesso alla posizione negato", {
      description: "Per vedere la tua posizione sulla mappa, attiva la localizzazione nelle impostazioni del browser."
    });
  }, [storePermission]);

  return { 
    permissionState, 
    checkStoredPermission, 
    storePermission, 
    handlePermissionDenial 
  };
};
