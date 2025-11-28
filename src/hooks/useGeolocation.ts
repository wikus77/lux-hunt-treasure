// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import { useCallback, useEffect, useRef, useState } from 'react';

type GeoStatus = 'idle' | 'prompt' | 'granted' | 'denied' | 'blocked' | 'error';
type Pos = { lat: number; lng: number; acc?: number | null };
type GeoError = { code: number; message: string } | null;

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

// Detect iOS/Safari
function isIOSSafari(): boolean {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  return isIOS || isSafari;
}

// Detect if running as PWA
function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
}

export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [enabled, setEnabled] = useState<boolean>(() => readEnabled());
  const [position, setPosition] = useState<Pos | undefined>(undefined);
  const [error, setError] = useState<GeoError>(null);
  const [retryCount, setRetryCount] = useState(0);
  const watchId = useRef<number | undefined>();

  const enable = useCallback(() => {
    writeEnabled(true);
    setEnabled(true);
    setRetryCount(0);
  }, []);
  
  const disable = useCallback(() => {
    writeEnabled(false);
    setEnabled(false);
    setStatus('idle');
    setError(null);
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  // Retry function for when permission is blocked
  const retry = useCallback(() => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    setRetryCount(prev => prev + 1);
    setStatus('prompt');
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!('geolocation' in navigator)) {
      setStatus('error');
      setError({ code: 0, message: 'Geolocation not supported' });
      return;
    }
    
    setStatus('prompt');
    
    // Check Permissions API first (if available)
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        console.log('📍 [Geo] Permission state:', result.state);
        
        if (result.state === 'denied') {
          setStatus('blocked');
          setError({ code: 1, message: 'Permission permanently denied. Please enable in browser settings.' });
          return;
        }
        
        // Listen for permission changes
        result.onchange = () => {
          console.log('📍 [Geo] Permission changed to:', result.state);
          if (result.state === 'granted') {
            setStatus('granted');
            setError(null);
          } else if (result.state === 'denied') {
            setStatus('blocked');
          }
        };
      }).catch(() => {
        // Permissions API not available, continue with watchPosition
        console.log('📍 [Geo] Permissions API not available');
      });
    }
    
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        console.log('📍 [Geo] Position received:', { lat: p.coords.latitude, lng: p.coords.longitude });
        setStatus('granted');
        setError(null);
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy });
      },
      (e) => {
        console.warn('📍 [Geo] Error:', e.code, e.message);
        setError({ code: e.code, message: e.message });
        
        // PERMISSION_DENIED = 1
        if (e.code === e.PERMISSION_DENIED) {
          // Check if this is a "blocked" state (user dismissed multiple times)
          if (e.message.includes('blocked') || e.message.includes('ignored') || retryCount > 2) {
            setStatus('blocked');
          } else {
            setStatus('denied');
          }
        } else if (e.code === e.POSITION_UNAVAILABLE) {
          // Position unavailable - could be temporary
          setStatus('error');
        } else if (e.code === e.TIMEOUT) {
          // Timeout - could be temporary
          setStatus('error');
        } else {
          setStatus('error');
        }
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 0, 
        timeout: isIOSSafari() ? 15000 : 10000 // Longer timeout for iOS
      }
    );
    
    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [enabled, retryCount]);

  return { 
    status, 
    enabled, 
    position, 
    error,
    isBlocked: status === 'blocked',
    isIOS: isIOSSafari(),
    isPWA: isPWA(),
    enable, 
    disable,
    retry
  };
}
