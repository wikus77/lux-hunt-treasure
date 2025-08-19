// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import { useEffect, useRef, useState } from 'react';

export type GeoCoords = { lat: number; lng: number; acc: number };
export type GeoState = {
  granted: boolean;
  coords?: GeoCoords;
  ts?: number;
  error?: string;
  isIOS?: boolean;
  isPWA?: boolean;
  permissionState?: PermissionState;
};

// iOS PWA-friendly geolocation with proper error handling and fallbacks
export function useGeoWatcher() {
  const [state, setState] = useState<GeoState>({ granted: false });
  const watchId = useRef<number | null>(null);
  
  // Detect iOS and PWA mode
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

  const clear = () => {
    if (watchId.current !== null && navigator.geolocation) {
      try { navigator.geolocation.clearWatch(watchId.current); } catch {}
      watchId.current = null;
    }
  };

  const onSuccess = (pos: GeolocationPosition) => {
    console.log('✅ Geolocation success:', pos.coords);
    setState({
      granted: true,
      coords: { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy },
      ts: Date.now(),
      isIOS,
      isPWA,
      error: undefined
    });
  };

  const onError = (err: GeolocationPositionError) => {
    console.error('❌ Geolocation error:', err.code, err.message);
    
    const errorMessages = {
      1: 'Accesso alla posizione negato. Abilita la geolocalizzazione nelle impostazioni del browser.',
      2: 'Posizione non disponibile. Verifica la connessione e i servizi di localizzazione.',
      3: 'Timeout nella richiesta di posizione. Riprova.'
    };
    
    // iOS PWA specific handling
    if (isIOS && err.code === 1) {
      setState(s => ({ 
        ...s, 
        granted: false, 
        error: 'Su iOS, apri Impostazioni > Privacy > Servizi di localizzazione e abilita Safari.',
        isIOS,
        isPWA
      }));
      return;
    }

    // Single getCurrentPosition attempt for some iOS issues
    if (err.code === 1 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        onSuccess, 
        (e) => setState(s => ({ 
          ...s, 
          granted: false, 
          error: errorMessages[e.code as keyof typeof errorMessages] || e.message,
          isIOS,
          isPWA
        })),
        { enableHighAccuracy: false, maximumAge: 30000, timeout: 15000 }
      );
    } else {
      setState(s => ({ 
        ...s, 
        granted: false, 
        error: errorMessages[err.code as keyof typeof errorMessages] || err.message,
        isIOS,
        isPWA
      }));
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ 
        granted: false, 
        error: 'Geolocalizzazione non supportata su questo dispositivo',
        isIOS,
        isPWA
      });
      return;
    }

    console.log('🌍 Starting geolocation watch...', { isIOS, isPWA });
    
    // iOS PWA requires immediate permission request
    if (isIOS && isPWA) {
      console.log('🍎 iOS PWA: Direct permission request');
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('✅ iOS PWA geolocation success');
          onSuccess(pos);
          
          // Start watching after initial success
          try {
            const options = {
              enableHighAccuracy: false,
              maximumAge: 30000,
              timeout: 15000,
            };
            watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, options);
          } catch (e) {
            console.warn('iOS PWA watch failed, using polling', e);
          }
        },
        (err) => {
          console.error('❌ iOS PWA geolocation failed:', err);
          onError(err);
        },
        { 
          enableHighAccuracy: false, 
          timeout: 20000, 
          maximumAge: 60000 
        }
      );
      return () => clear();
    }
    
    try {
      // Standard approach for non-iOS or non-PWA
      const options = {
        enableHighAccuracy: !isIOS,
        maximumAge: isIOS ? 30000 : 10000,
        timeout: isIOS ? 15000 : 10000,
      };
      
      watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, options);
    } catch (e: any) {
      setState({ 
        granted: false, 
        error: e?.message || 'Errore di inizializzazione geolocalizzazione',
        isIOS,
        isPWA
      });
    }
    
    return () => clear();
  }, [isIOS, isPWA]);

  const requestPermissions = async () => {
    try {
      console.log('🔐 Requesting geolocation permission...');
      
      // iOS PWA specific check
      if (isIOS && isPWA) {
        console.log('🍎 iOS PWA detected, using optimized approach');
        
        // Direct getCurrentPosition for iOS PWA
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            onSuccess,
            onError,
            { 
              enableHighAccuracy: false, 
              timeout: 15000, 
              maximumAge: 30000 
            }
          );
        }
        return;
      }
      
      // Check permission API if available
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          console.log('🔐 Permission state:', result.state);
          
          setState(s => ({ ...s, permissionState: result.state }));
          
          if (result.state === 'denied') {
            setState(s => ({ 
              ...s, 
              granted: false,
              error: 'Geolocalizzazione bloccata. Sblocca nelle impostazioni del browser.',
              isIOS,
              isPWA
            }));
            return;
          }
        } catch (permErr) {
          console.warn('Permission API not available:', permErr);
        }
      }

      // Force permission prompt with getCurrentPosition
      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              onSuccess(pos);
              resolve();
            }, 
            (err) => {
              onError(err);
              resolve();
            },
            { 
              enableHighAccuracy: !isIOS, 
              timeout: isIOS ? 15000 : 10000,
              maximumAge: isIOS ? 30000 : 10000
            }
          );
        });
      }
    } catch (e) {
      console.error('Permission request failed:', e);
      setState(s => ({ 
        ...s, 
        error: 'Errore durante la richiesta di geolocalizzazione',
        isIOS,
        isPWA
      }));
    }
  };

  return { ...state, requestPermissions };
}
