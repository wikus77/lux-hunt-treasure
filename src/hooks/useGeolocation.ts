// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React from 'react';

export function useGeolocation() {
  const [status, setStatus] = React.useState<'idle'|'prompt'|'granted'|'denied'|'error'>('idle');
  const [position, setPosition] = React.useState<{lat:number; lng:number} | null>(null);
  const watchId = React.useRef<number | null>(null);
  const enabledRef = React.useRef<boolean>(false);

  // Initialize from localStorage
  React.useEffect(() => {
    try { enabledRef.current = localStorage.getItem('geo_enabled') === '1'; } catch {}
  }, []);

  const stop = () => {
    if (watchId.current != null && 'geolocation' in navigator) {
      try { navigator.geolocation.clearWatch(watchId.current); } catch {}
      watchId.current = null;
    }
  };

  const handle = () => {
    if (!('geolocation' in navigator)) { setStatus('error'); return; }
    try {
      setStatus('prompt');
      watchId.current = navigator.geolocation.watchPosition(
        (p) => {
          setStatus('granted');
          setPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
          if (import.meta.env.DEV) console.debug('[GEO] status=granted, position=', { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy });
        },
        (e) => {
          setStatus(e.code === 1 ? 'denied' : 'error');
          if (import.meta.env.DEV) console.debug('[GEO] status=', e.code === 1 ? 'denied' : 'error');
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10_000 }
      );
    } catch { setStatus('error'); }
  };

  const enable = () => {
    enabledRef.current = true;
    try { localStorage.setItem('geo_enabled', '1'); } catch {}
    handle();
  };

  const disable = () => {
    enabledRef.current = false;
    try { localStorage.setItem('geo_enabled', '0'); } catch {}
    stop();
    setStatus('idle');
  };

  React.useEffect(() => {
    if (enabledRef.current) handle();
    return stop;
  }, []);

  return { status, position, enable, disable };
}
