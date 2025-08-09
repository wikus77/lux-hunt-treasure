// © 2025 Joseph MULÉ – M1SSION™
import { useEffect, useRef, useState } from 'react';

type GeoPoint = { lat: number; lng: number };
type Options = { enableHighAccuracy?: boolean; timeout?: number; maximumAge?: number; throttleMs?: number };

type PermissionState = 'granted' | 'denied' | 'prompt' | null;

export function useGeolocation(
  options: Options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000, throttleMs: 1000 }
) {
  const [position, setPosition] = useState<GeoPoint | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [permission, setPermission] = useState<PermissionState>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const lastUpdate = useRef<number>(0);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocalizzazione non supportata');
      return;
    }

    // Try to read permission state when available
    try {
      const navAny = navigator as any;
      if (navAny?.permissions?.query) {
        navAny.permissions
          .query({ name: 'geolocation' as any })
          .then((res: any) => setPermission(res.state as PermissionState))
          .catch(() => {});
      }
    } catch {}

    const throttle = Math.max(0, options.throttleMs ?? 1000);

    const onSuccess = (pos: GeolocationPosition) => {
      const now = Date.now();
      if (now - lastUpdate.current < throttle) return;
      lastUpdate.current = now;

      setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setAccuracy(typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : null);
      setError(null);
    };

    const onError = (err: GeolocationPositionError) => {
      setError(err.message || 'Impossibile ottenere la posizione');
      // Heuristic for denied
      if ((err as any)?.code === 1) setPermission('denied');
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, options);

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return { position, accuracy, permission, error };
}
