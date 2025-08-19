// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import { useCallback, useEffect, useRef, useState } from 'react';

type GeoStatus = 'idle' | 'prompt' | 'granted' | 'denied' | 'error';
type Pos = { lat: number; lng: number; acc?: number | null };

// Compatibilità: leggiamo sia 'geo.enabled.v1' (vecchio) sia 'geo_enabled' (nuovo)
const LS_KEYS = ['geo.enabled.v1', 'geo_enabled'];

function readEnabled(): boolean {
  try {
    return LS_KEYS.some((k) => localStorage.getItem(k) === '1');
  } catch {
    return false;
  }
}
function writeEnabled(v: boolean) {
  try {
    LS_KEYS.forEach((k) => (v ? localStorage.setItem(k, '1') : localStorage.removeItem(k)));
  } catch {}
}

export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [enabled, setEnabled] = useState<boolean>(() => readEnabled());
  const [position, setPosition] = useState<Pos | undefined>(undefined);
  const watchId = useRef<number | undefined>();

  const enable = useCallback(() => {
    writeEnabled(true);
    setEnabled(true);
  }, []);
  const disable = useCallback(() => {
    writeEnabled(false);
    setEnabled(false);
    setStatus('idle');
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!('geolocation' in navigator)) {
      setStatus('error');
      return;
    }
    setStatus('prompt');
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        setStatus('granted');
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy });
      },
      (e) => {
        console.warn('🗺️ Geolocation error:', e.message, e.code);
        const newStatus = e.code === e.PERMISSION_DENIED ? 'denied' : 'error';
        setStatus(newStatus);
        
        // Set fallback position to Rome if available
        if (newStatus === 'error' && !position) {
          setPosition({ lat: 41.9028, lng: 12.4964, acc: null });
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [enabled]);

  return { status, enabled, position, enable, disable };
}
