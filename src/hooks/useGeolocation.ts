import { useCallback, useEffect, useRef, useState } from 'react';

type GeoStatus = 'idle'|'prompt'|'granted'|'denied'|'blocked'|'error';
type Position = { lat:number; lng:number; accuracy?:number|null } | null;

const LS_KEY = 'm1.geo.enabled';

export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [position, setPosition] = useState<Position>(null);
  const watchId = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchId.current != null && 'geolocation' in navigator) {
      try { navigator.geolocation.clearWatch(watchId.current); } catch {}
    }
    watchId.current = null;
  }, []);

  const onError = useCallback((err: GeolocationPositionError) => {
    // Chrome “blocked after dismiss” ⇒ treat as blocked
    if (err?.code === 1) setStatus('denied');
    else setStatus('error');
  }, []);

  const start = useCallback(() => {
    if (!('geolocation' in navigator)) { setStatus('error'); return; }
    setStatus('prompt');
    try {
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          setStatus('granted');
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? null
          });
        },
        onError,
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    } catch {
      setStatus('error');
    }
  }, [onError]);

  const enable = useCallback(() => {
    try { localStorage.setItem(LS_KEY, '1'); } catch {}
    start();
  }, [start]);

  const disable = useCallback(() => {
    try { localStorage.setItem(LS_KEY, '0'); } catch {}
    stop();
    setPosition(null);
    setStatus('idle');
  }, [stop]);

  // restore persisted choice
  useEffect(() => {
    const want = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
    if (want === '1') start();
  }, [start]);

  // when tab hidden, reduce noise
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) return;
      // re-kick if enabled but no watch running
      const want = localStorage.getItem(LS_KEY) === '1';
      if (want && watchId.current == null) start();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [start]);

  return { status, position, enable, disable };
}
