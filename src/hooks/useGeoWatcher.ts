// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import { useEffect, useRef, useState } from 'react';

export type GeoCoords = { lat: number; lng: number; acc: number };
export type GeoState = {
  granted: boolean;
  coords?: GeoCoords;
  ts?: number;
  error?: string;
};

// iOS Safari friendly geolocation with comprehensive fallback system
export function useGeoWatcher() {
  const [state, setState] = useState<GeoState>({ granted: false });
  const watchId = useRef<number | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const clear = () => {
    if (watchId.current !== null && navigator.geolocation) {
      try { 
        navigator.geolocation.clearWatch(watchId.current); 
        console.log('🗺️ GeoWatcher: Watch cleared');
      } catch {}
      watchId.current = null;
    }
  };

  const onSuccess = (pos: GeolocationPosition) => {
    console.log('🗺️ GeoWatcher: Position success', { 
      lat: pos.coords.latitude, 
      lng: pos.coords.longitude, 
      accuracy: pos.coords.accuracy 
    });
    setState({
      granted: true,
      coords: { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy },
      ts: Date.now(),
      error: undefined
    });
    retryCount.current = 0; // Reset on success
  };

  const setFallbackLocation = () => {
    console.log('🗺️ GeoWatcher: Setting fallback location (Rome)');
    setState({
      granted: false,
      coords: { lat: 41.9028, lng: 12.4964, acc: 1000 },
      ts: Date.now(),
      error: 'Usando posizione di fallback'
    });
  };

  const onError = (err: GeolocationPositionError) => {
    console.warn('🗺️ GeoWatcher: Position error', { 
      code: err.code, 
      message: err.message,
      retry: retryCount.current 
    });

    // Handle different error types
    if (err.code === err.PERMISSION_DENIED) {
      setState((s) => ({ ...s, granted: false, error: 'Autorizzazione geolocalizzazione negata' }));
      setFallbackLocation();
    } else if (err.code === err.POSITION_UNAVAILABLE) {
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        console.log(`🗺️ GeoWatcher: Retrying (${retryCount.current}/${maxRetries})`);
        // Retry with less strict options
        setTimeout(() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onSuccess, onError, {
              enableHighAccuracy: false,
              maximumAge: 60000,
              timeout: 20000,
            });
          }
        }, 2000);
      } else {
        setState((s) => ({ ...s, granted: false, error: 'Posizione non disponibile' }));
        setFallbackLocation();
      }
    } else if (err.code === err.TIMEOUT) {
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        console.log(`🗺️ GeoWatcher: Timeout retry (${retryCount.current}/${maxRetries})`);
        setTimeout(() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onSuccess, onError, {
              enableHighAccuracy: true,
              maximumAge: 30000,
              timeout: 15000,
            });
          }
        }, 1000);
      } else {
        setState((s) => ({ ...s, granted: false, error: 'Timeout geolocalizzazione' }));
        setFallbackLocation();
      }
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('🗺️ GeoWatcher: Geolocation not supported');
      setState({ granted: false, error: 'Geolocalizzazione non supportata dal browser' });
      setFallbackLocation();
      return;
    }

    console.log('🗺️ GeoWatcher: Starting geolocation watch');
    
    // iOS Safari PWA fix: Check permissions first, then request
    const initializeGeoLocation = async () => {
      try {
        // Check if we're in a PWA (standalone mode)
        const isPWA = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
        console.log('🗺️ GeoWatcher: PWA Mode:', isPWA);
        
        // For iOS Safari PWA, use specific settings
        const options = {
          enableHighAccuracy: true,
          maximumAge: isPWA ? 30000 : 5000, // Allow cached location in PWA
          timeout: isPWA ? 20000 : 10000, // Longer timeout for PWA
        };
        
        // Try permissions API if available (not in Safari)
        if ('permissions' in navigator) {
          try {
            const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
            console.log('🗺️ GeoWatcher: Permission state:', permission.state);
            
            if (permission.state === 'denied') {
              console.log('🗺️ GeoWatcher: Permission previously denied, using fallback');
              setFallbackLocation();
              return;
            }
          } catch (e) {
            console.log('🗺️ GeoWatcher: Permissions API not available (Safari)');
          }
        }
        
        // Primary position request
        navigator.geolocation.getCurrentPosition(
          (position) => {
            onSuccess(position);
            // Start watching for continuous updates
            try {
              watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 15000,
              });
              console.log('🗺️ GeoWatcher: Watch position started successfully');
            } catch (e: any) {
              console.warn('🗺️ GeoWatcher: Watch setup failed', e);
              setState(s => ({ ...s, error: e?.message || 'Errore configurazione geolocalizzazione' }));
            }
          },
          (err) => {
            console.log('🗺️ GeoWatcher: Initial position failed, trying watch anyway');
            onError(err);
            // Still try to set up watch in case permissions change later
            try {
              watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, {
                enableHighAccuracy: true,
                maximumAge: 15000,
                timeout: 20000,
              });
            } catch (e: any) {
              console.warn('🗺️ GeoWatcher: Watch setup failed after initial error', e);
            }
          },
          options
        );
        
      } catch (error) {
        console.error('🗺️ GeoWatcher: Initialization error:', error);
        setFallbackLocation();
      }
    };
    
    initializeGeoLocation();
    return () => clear();
  }, []);

  const requestPermissions = async () => {
    console.log('🗺️ GeoWatcher: Manual permission request');
    try {
      if (navigator.geolocation) {
        retryCount.current = 0; // Reset retry counter
        const result = await new Promise<boolean>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              onSuccess(pos);
              resolve(true);
            },
            (err) => {
              console.log('🗺️ GeoWatcher: Manual request failed', err);
              onError(err);
              resolve(false);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0, // Force fresh position
              timeout: 10000,
            }
          );
        });
        return result;
      }
    } catch (e) {
      console.warn('🗺️ GeoWatcher: Manual request exception', e);
    }
    return false;
  };

  return { ...state, requestPermissions };
}
