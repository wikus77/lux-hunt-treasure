
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useLocationPermission } from './useLocationPermission';
import { useRetryLogic } from './useRetryLogic';
import { useLocationErrorHandler } from './useLocationErrorHandler';
import { usePositionWatcher } from './usePositionWatcher';

export const useLocationWatcherRefactored = (
  isSecureContext: boolean,
  initialPermission: "granted" | "denied" | "prompt",
  map: google.maps.Map | null
) => {
  const [locationReceived, setLocationReceived] = useState(false);
  
  const { 
    permissionState, 
    checkStoredPermission, 
    storePermission,
    handlePermissionDenial 
  } = useLocationPermission();
  
  const {
    retryAttempts,
    shouldRetry,
    incrementRetry,
    resetRetry,
    setRetryAttempts
  } = useRetryLogic();
  
  // Handle position updates
  const handlePositionSuccess = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    console.log("Position update received:", { latitude, longitude });
    
    if (map) {
      map.panTo({ lat: latitude, lng: longitude });
    }
    
    // Store successful permission
    storePermission('granted');
    
    setLocationReceived(true);
    resetRetry();
  }, [map, storePermission, resetRetry]);
  
  // Try a fallback location method with lower accuracy
  const tryFallbackLocation = useCallback(() => {
    if (shouldRetry()) {
      const attemptNumber = incrementRetry();
      console.log(`Automatically retrying geolocation (${attemptNumber}/3)...`);
      
      // Try with getCurrentPosition as a fallback
      navigator.geolocation.getCurrentPosition(
        handlePositionSuccess,
        () => {}, // Silent error, already shown by watchPosition
        { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
      );
    }
  }, [shouldRetry, incrementRetry, handlePositionSuccess]);
  
  const { handleGeolocationError } = useLocationErrorHandler(
    handlePermissionDenial,
    tryFallbackLocation
  );
  
  const { watchId, setupWatch, clearWatch } = usePositionWatcher({
    isSecureContext,
    onPositionReceived: handlePositionSuccess,
    onError: handleGeolocationError
  });
  
  // Setup watch position based on permission
  const setupWatchPosition = useCallback(() => {
    const storedPermission = checkStoredPermission();
    
    if (storedPermission === false) {
      return null;
    }
    
    if (permissionState === 'granted' || permissionState === 'prompt' || storedPermission === true) {
      setupWatch();
    }
    
    return watchId;
  }, [permissionState, checkStoredPermission, setupWatch, watchId]);
  
  // Manual retry function with permission reset
  const retryGetLocation = useCallback(() => {
    if (!isSecureContext) {
      toast.error("Contesto non sicuro", {
        description: "Questa pagina deve essere caricata in HTTPS per utilizzare la geolocalizzazione."
      });
      return;
    }
    
    // Reset permission in localStorage to try again
    localStorage.removeItem("geo_permission_granted");
    
    console.log("Retrying location detection...");
    // Reset location state before retrying
    setLocationReceived(false);
    resetRetry();
    
    // Clear any previous watch
    clearWatch();
    
    // Show a toast to inform the user
    toast.info("Richiesta posizione in corso", {
      description: "Assicurati di concedere l'autorizzazione quando richiesto dal browser."
    });
    
    setupWatch();
  }, [isSecureContext, clearWatch, setupWatch, resetRetry]);

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
