
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface GeoLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

export const useGeoLocation = () => {
  const [location, setLocation] = useState<GeoLocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null
  });

  const [watchId, setWatchId] = useState<number | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ 
        ...prev, 
        error: 'Geolocalizzazione non supportata dal browser' 
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null
        });
        toast.success('Posizione rilevata con successo');
      },
      (error) => {
        let errorMessage = 'Errore nel rilevare la posizione';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permesso di geolocalizzazione negato';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Posizione non disponibile';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout nel rilevare la posizione';
            break;
        }

        setLocation(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMessage 
        }));
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation || watchId) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null
        });
      },
      (error) => {
        console.error('Watch position error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    setWatchId(id);
  }, [watchId]);

  const stopWatching = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    ...location,
    requestLocation,
    startWatching,
    stopWatching,
    isWatching: watchId !== null
  };
};
