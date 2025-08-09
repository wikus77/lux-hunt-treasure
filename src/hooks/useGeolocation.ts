// © 2025 Joseph MULÉ – M1SSION™
import { useEffect, useRef, useState } from 'react';

type GeoPoint = { lat: number; lng: number };
type Options = { enableHighAccuracy?: boolean; timeout?: number; maximumAge?: number };

export function useGeolocation(options: Options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }) {
  const [position, setPosition] = useState<GeoPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocalizzazione non supportata');
      return;
    }

    const onSuccess = (pos: GeolocationPosition) => {
      setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    };

    const onError = (err: GeolocationPositionError) => {
      setError(err.message || 'Impossibile ottenere la posizione');
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, options);

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return { position, error };
}
