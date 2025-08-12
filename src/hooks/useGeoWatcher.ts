// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import { useEffect, useRef, useState } from 'react';

export type GeoCoords = { lat: number; lng: number; acc: number };
export type GeoState = {
  granted: boolean;
  coords?: GeoCoords;
  ts?: number;
  error?: string;
};

// iOS-friendly, foreground-only geolocation watcher with lightweight fallback
export function useGeoWatcher() {
  const [state, setState] = useState<GeoState>({ granted: false });
  const watchId = useRef<number | null>(null);

  const clear = () => {
    if (watchId.current !== null && navigator.geolocation) {
      try { navigator.geolocation.clearWatch(watchId.current); } catch {}
      watchId.current = null;
    }
  };

  const onSuccess = (pos: GeolocationPosition) => {
    setState({
      granted: true,
      coords: { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy },
      ts: Date.now(),
    });
  };

  const onError = (err: GeolocationPositionError) => {
    // If permission denied, attempt one-time getCurrentPosition fallback (iOS oddities)
    if (err.code === 1 && navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(onSuccess, (e) => {
          setState((s) => ({ ...s, granted: false, error: e.message }));
        }, { enableHighAccuracy: true, maximumAge: 10_000, timeout: 10_000 });
      } catch {}
    } else {
      setState((s) => ({ ...s, granted: false, error: err.message }));
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ granted: false, error: 'Geolocalizzazione non supportata' });
      return;
    }
    try {
      watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        maximumAge: 10_000,
        timeout: 10_000,
      });
    } catch (e: any) {
      setState({ granted: false, error: e?.message || 'Errore geolocalizzazione' });
    }
    return () => clear();
  }, []);

  const requestPermissions = async () => {
    try {
      // Best-effort prompt by calling getCurrentPosition once
      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(() => resolve(), () => resolve());
        });
      }
    } catch {}
  };

  return { ...state, requestPermissions };
}
