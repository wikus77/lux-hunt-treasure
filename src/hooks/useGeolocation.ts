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
  const toastShownRef = useRef<boolean>(false);

  const enable = useCallback(() => {
    writeEnabled(true);
    setEnabled(true);
    toastShownRef.current = false; // Reset toast flag when enabling
  }, []);
  
  const disable = useCallback(() => {
    writeEnabled(false);
    setEnabled(false);
    setStatus('idle');
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    toastShownRef.current = false; // Reset toast flag
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!('geolocation' in navigator)) {
      console.warn('🗺️ Geolocation not supported by browser');
      setStatus('error');
      if (!position) {
        setPosition({ lat: 41.9028, lng: 12.4964, acc: null }); // Rome fallback
      }
      return;
    }
    
    setStatus('prompt');
    
    // iOS Safari requires user interaction before getCurrentPosition
    // Try getCurrentPosition first for immediate result
    navigator.geolocation.getCurrentPosition(
      (p) => {
        console.log('🗺️ Initial position obtained:', { lat: p.coords.latitude, lng: p.coords.longitude });
        setStatus('granted');
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy });
      },
      (initialError) => {
        console.log('🗺️ Initial position failed, setting up watch...', initialError.message);
        // Fallback to watch position for continuous tracking
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
    );

    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        console.log('🗺️ Watch position update:', { lat: p.coords.latitude, lng: p.coords.longitude });
        setStatus('granted');
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy });
        toastShownRef.current = false; // Reset error toast flag on success
      },
      (e) => {
        console.warn('🗺️ Geolocation watch error:', e.message, e.code, 'Error name:', e.PERMISSION_DENIED === e.code ? 'PERMISSION_DENIED' : e.POSITION_UNAVAILABLE === e.code ? 'POSITION_UNAVAILABLE' : 'TIMEOUT');
        
        const newStatus = e.code === e.PERMISSION_DENIED ? 'denied' : 'error';
        setStatus(newStatus);
        
        // Only show toast once per session to avoid spam
        if (!toastShownRef.current) {
          toastShownRef.current = true;
          
          if (e.code === e.PERMISSION_DENIED) {
            console.log('🗺️ Permission denied - using fallback location');
          } else if (e.code === e.POSITION_UNAVAILABLE) {
            console.log('🗺️ Position unavailable - using fallback location');
          } else {
            console.log('🗺️ Timeout error - using fallback location');
          }
        }
        
        // Always set fallback position if we don't have one
        if (!position) {
          console.log('🗺️ Setting fallback position to Rome');
          setPosition({ lat: 41.9028, lng: 12.4964, acc: null });
        }
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 60000, // Cache for 1 minute on iOS
        timeout: 15000 // Longer timeout for iOS
      }
    );
    
    return () => {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = undefined;
      }
    };
  }, [enabled, position]); // Added position dependency for fallback logic

  return { status, enabled, position, enable, disable };
}
