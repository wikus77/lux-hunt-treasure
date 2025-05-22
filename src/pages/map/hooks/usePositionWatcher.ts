
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface UsePositionWatcherProps {
  isSecureContext: boolean;
  onPositionReceived: (position: GeolocationPosition) => void;
  onError: (error: GeolocationPositionError) => void;
  highAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const usePositionWatcher = ({
  isSecureContext,
  onPositionReceived,
  onError,
  highAccuracy = true,
  timeout = 20000,
  maximumAge = 0
}: UsePositionWatcherProps) => {
  const [watchId, setWatchId] = useState<number | null>(null);
  
  // Clear any previous watchPosition
  const clearWatch = useCallback(() => {
    if (watchId !== null) {
      console.log("Clearing watchPosition");
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);
  
  // Set up watchPosition
  const setupWatch = useCallback(() => {
    // Security check
    if (!isSecureContext) {
      toast.error("Contesto non sicuro", {
        description: "Questa pagina deve essere caricata in HTTPS per utilizzare la geolocalizzazione."
      });
      return;
    }

    // Device capability check
    if (!('geolocation' in navigator)) {
      toast.error("Geolocalizzazione non supportata", {
        description: "Il tuo dispositivo o browser non supporta la geolocalizzazione."
      });
      return;
    }

    // Clear any previous watches
    clearWatch();

    console.log("Setting up position watching...");
    const id = navigator.geolocation.watchPosition(
      onPositionReceived,
      onError,
      {
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge
      }
    );
    
    setWatchId(id);
    return id;
  }, [isSecureContext, onPositionReceived, onError, clearWatch, highAccuracy, timeout, maximumAge]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => clearWatch();
  }, [clearWatch]);
  
  return { watchId, setupWatch, clearWatch };
};
