// © M1SSION™
import { useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'prompt' | 'granted' | 'denied' | 'error';

const LS_KEY = 'geo.enabled.v1';

export function useGeolocation() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem(LS_KEY) === '1'; } catch { return false; }
  });
  const [status, setStatus] = useState<Status>('idle');
  const [position, setPosition] = useState<{lat:number; lng:number} | null>(null);
  const watchId = useRef<number | null>(null);

  const clearWatch = () => {
    if (watchId.current !== null && navigator.geolocation) {
      try { navigator.geolocation.clearWatch(watchId.current); } catch {}
      watchId.current = null;
    }
  };

  const startWatch = () => {
    if (!navigator.geolocation) { setStatus('error'); return; }
    try {
      setStatus('prompt');
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          setStatus('granted');
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          setPosition(null);
          setStatus(err.code === 1 ? 'denied' : 'error');
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
    } catch { setStatus('error'); }
  };

  useEffect(() => {
    if (!enabled) { clearWatch(); setStatus('idle'); setPosition(null); return; }
    startWatch();
    return () => clearWatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const enable = () => { try { localStorage.setItem(LS_KEY, '1'); } catch {} setEnabled(true); };
  const disable = () => { try { localStorage.removeItem(LS_KEY); } catch {} setEnabled(false); };

  return { status, position, enable, disable, enabled };
}
