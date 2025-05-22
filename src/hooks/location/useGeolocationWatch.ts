
import { useCallback } from "react";
import { toast } from "sonner";

type GeolocationWatchOptions = {
  onSuccess: (position: GeolocationPosition) => void;
  onError: (error: GeolocationPositionError) => void;
  options?: PositionOptions;
};

export function useGeolocationWatch() {
  const startWatchingPosition = useCallback(
    ({ onSuccess, onError, options = {} }: GeolocationWatchOptions) => {
      if (!('geolocation' in navigator)) {
        console.error("Geolocation not available in this browser");
        return null;
      }

      try {
        console.log("Setting up position watching...");
        
        const watchOptions: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 20000, // 20 seconds
          maximumAge: 0,
          ...options,
        };
        
        const id = navigator.geolocation.watchPosition(
          onSuccess,
          onError,
          watchOptions
        );
        
        return id;
      } catch (e) {
        console.error("Unexpected error in geolocation watch:", e);
        toast.error("Errore di geolocalizzazione", {
          description: "Si è verificato un errore imprevisto durante la richiesta della posizione."
        });
        return null;
      }
    },
    []
  );

  const clearWatch = useCallback((watchId: number | null) => {
    if (watchId !== null && 'geolocation' in navigator) {
      console.log("Clearing watchPosition");
      navigator.geolocation.clearWatch(watchId);
      return true;
    }
    return false;
  }, []);

  return { startWatchingPosition, clearWatch };
}
