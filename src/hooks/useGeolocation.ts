import { useEffect, useRef, useState } from 'react';

export type GeoStatus = 'idle'|'prompt'|'granted'|'denied'|'error';

export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [position, setPosition] = useState<{lat:number; lng:number} | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    const pref = localStorage.getItem('m1:geo:enabled');
    if (pref === '1') enable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enable = () => {
    if (!('geolocation' in navigator)) { setStatus('error'); return; }
    setStatus('prompt');
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setStatus('granted');
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn('[geo] error', err);
        setStatus(err?.code === (err as any)?.PERMISSION_DENIED ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    localStorage.setItem('m1:geo:enabled', '1');
  };

  const disable = () => {
    if (watchId.current != null && navigator.geolocation?.clearWatch) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    watchId.current = null;
    setStatus('idle');
    setPosition(null);
    localStorage.setItem('m1:geo:enabled', '0');
  };

  return { status, position, enable, disable };
}
