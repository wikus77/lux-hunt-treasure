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
  debugInfo?: {
    locationEnabled: boolean;
    permission: 'granted' | 'denied' | 'prompt';
    lastError: string;
    coords: { lat: number; lng: number } | null;
    attempts: number;
    lastAttemptTime: number;
  };
};

// iOS PWA-friendly geolocation with proper error handling and fallbacks
export function useGeoWatcher() {
  const [state, setState] = useState<GeoState>({ granted: false });
  const watchId = useRef<number | null>(null);
  const attemptsRef = useRef(0);
  
  
  // CRITICAL iOS PWA Detection Fix
  const isIOS = typeof window !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
  
  const isPWA = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://') ||
    window.location.href.includes('lovable') // PWA in preview mode
  );

  console.log('🔍 CRITICAL GEO DEBUG:', { 
    isIOS, 
    isPWA, 
    userAgent: navigator.userAgent,
    standalone: (window.navigator as any).standalone,
    displayMode: window.matchMedia('(display-mode: standalone)').matches,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints
  });

  const clear = () => {
    if (watchId.current !== null && navigator.geolocation) {
      try { navigator.geolocation.clearWatch(watchId.current); } catch {}
      watchId.current = null;
    }
  };

  const onSuccess = (pos: GeolocationPosition) => {
    console.log('✅ Geolocation success:', pos.coords);
    setState(prevState => ({
      granted: true,
      coords: { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy },
      ts: Date.now(),
      isIOS,
      isPWA,
      error: undefined,
      debugInfo: {
        locationEnabled: true,
        permission: 'granted',
        lastError: '',
        coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        attempts: (prevState?.debugInfo?.attempts || 0) + 1,
        lastAttemptTime: Date.now()
      }
    }));
  };

  const onError = (err: GeolocationPositionError) => {
    console.error('❌ Geolocation error:', err.code, err.message);
    console.log('🔍 GEO DEBUG INFO:', {
      errorCode: err.code,
      errorMessage: err.message,
      isIOS,
      isPWA,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    const errorMessages = {
      1: 'Accesso alla posizione negato. Abilita la geolocalizzazione nelle impostazioni del browser.',
      2: 'Posizione non disponibile. Verifica la connessione e i servizi di localizzazione.',
      3: 'Timeout nella richiesta di posizione. Riprova.'
    };
    
    // Enhanced debugging for iOS PWA
    const debugState = {
      locationEnabled: false,
      permission: err.code === 1 ? 'denied' : 'prompt',
      lastError: errorMessages[err.code as keyof typeof errorMessages] || err.message,
      coords: null,
      attempts: 0,
      lastAttemptTime: Date.now()
    } as const;
    
    // iOS PWA specific handling with enhanced diagnostics
    if (isIOS && isPWA && err.code === 1) {
      setState(s => ({ 
        ...s, 
        granted: false, 
        error: 'iOS PWA: Apri Safari > Impostazioni > Privacy e Sicurezza > Localizzazione. Abilita per tutti i siti web.',
        isIOS,
        isPWA,
        debugInfo: debugState
      }));
      return;
    }

    // Enhanced retry mechanism for iOS
    if (err.code === 1 && navigator.geolocation) {
      // Try with different options for iOS compatibility
      navigator.geolocation.getCurrentPosition(
        onSuccess, 
        (e) => setState(s => ({ 
          ...s, 
          granted: false, 
          error: errorMessages[e.code as keyof typeof errorMessages] || e.message,
          isIOS,
          isPWA,
          debugInfo: {
            ...debugState,
            attempts: 2,
            lastError: `Retry failed: ${e.message}`
          }
        })),
        { 
          enableHighAccuracy: false, 
          maximumAge: 60000, 
          timeout: 20000 
        }
      );
    } else {
      setState(s => ({ 
        ...s, 
        granted: false, 
        error: errorMessages[err.code as keyof typeof errorMessages] || err.message,
        isIOS,
        isPWA,
        debugInfo: debugState
      }));
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ 
        granted: false, 
        error: 'Geolocalizzazione non supportata su questo dispositivo',
        isIOS,
        isPWA,
        debugInfo: {
          locationEnabled: false,
          permission: 'denied',
          lastError: 'navigator.geolocation not available',
          coords: null,
          attempts: 0,
          lastAttemptTime: Date.now()
        }
      });
      return;
    }

    console.log('🌍 Starting geolocation watch...', { isIOS, isPWA });
    
  const initGeoLocation = async () => {
      console.log('🌍 CRITICAL INIT GEO - Starting geolocation for:', { isIOS, isPWA, hasGeolocation: !!navigator.geolocation });
      attemptsRef.current = 0;
      
      // FORCE DIRECT APPROACH for ALL PWA scenarios
      if (isPWA || isIOS) {
        console.log('🍎 PWA/iOS: Using direct geolocation approach');
        tryDirectGeolocation();
        return;
      }
      
      // Standard browser approach
      startStandardGeolocation();
    };
    
    const tryDirectGeolocation = () => {
      console.log('🔥 CRITICAL: Direct geolocation attempt');
      attemptsRef.current++;
      
      const options = {
        enableHighAccuracy: false, // False for better iOS compatibility
        timeout: 25000, // Longer timeout for PWA
        maximumAge: 300000 // 5 minutes cache
      };
      
      console.log('🔥 Using options:', options);
      
      // First try getCurrentPosition
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('✅ CRITICAL: Direct geolocation SUCCESS!', pos.coords);
          onSuccess(pos);
          
          // Then start watching for continuous updates
          try {
            watchId.current = navigator.geolocation.watchPosition(
              onSuccess, 
              (err) => {
                console.warn('⚠️ Watch position failed, but initial position acquired:', err);
                // Don't call onError here since we already have position
              }, 
              { ...options, maximumAge: 60000 }
            );
            console.log('🔥 Watch position started with ID:', watchId.current);
          } catch (e) {
            console.warn('🔥 Watch position failed to start:', e);
          }
        },
        (err) => {
          console.error('❌ CRITICAL: Direct geolocation FAILED:', err.code, err.message);
          
          // Try with different options as fallback
          console.log('🔥 CRITICAL: Trying fallback options...');
          navigator.geolocation.getCurrentPosition(
            onSuccess,
            (fallbackErr) => {
              console.error('❌ CRITICAL: Fallback also failed:', fallbackErr);
              
              let errorMsg = 'Geolocalizzazione non disponibile.';
              if (fallbackErr.code === 1) {
                errorMsg = 'Accesso alla posizione negato. Abilita nelle impostazioni del browser/dispositivo.';
              } else if (fallbackErr.code === 2) {
                errorMsg = 'Posizione non disponibile. Verifica GPS e connessione.';
              } else if (fallbackErr.code === 3) {
                errorMsg = 'Timeout geolocalizzazione. La richiesta è scaduta.';
              }
              
              setState(s => ({ 
                ...s, 
                granted: false, 
                error: errorMsg,
                isIOS,
                isPWA,
                debugInfo: {
                  locationEnabled: false,
                  permission: fallbackErr.code === 1 ? 'denied' : 'prompt',
                  lastError: fallbackErr.message,
                  coords: null,
                  attempts: attemptsRef.current,
                  lastAttemptTime: Date.now()
                }
              }));
            },
            { 
              enableHighAccuracy: true, // Try high accuracy as fallback
              timeout: 15000, 
              maximumAge: 0 
            }
          );
        },
        options
      );
    };
    
    const startStandardGeolocation = () => {
      console.log('🌍 Starting standard geolocation watch');
      
      const options = {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000
      };
      
      try {
        watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, options);
      } catch (e: any) {
        console.error('❌ Standard geolocation failed:', e);
        setState({ 
          granted: false, 
          error: 'Errore di inizializzazione geolocalizzazione',
          isIOS,
          isPWA,
          debugInfo: {
            locationEnabled: false,
            permission: 'prompt',
            lastError: e?.message || 'Unknown error',
            coords: null,
            attempts: 1,
            lastAttemptTime: Date.now()
          }
        });
      }
    };
    
    initGeoLocation();
    return () => clear();
  }, [isIOS, isPWA]);

  const requestPermissions = async () => {
    const tryDirectGeolocation = () => {
      console.log('🔥 CRITICAL: Direct geolocation attempt');
      attemptsRef.current++;
      
      const options = {
        enableHighAccuracy: false, // False for better iOS compatibility
        timeout: 25000, // Longer timeout for PWA
        maximumAge: 300000 // 5 minutes cache
      };
      
      console.log('🔥 Using options:', options);
      
      // First try getCurrentPosition
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('✅ CRITICAL: Direct geolocation SUCCESS!', pos.coords);
          onSuccess(pos);
          
          // Then start watching for continuous updates
          try {
            watchId.current = navigator.geolocation.watchPosition(
              onSuccess, 
              (err) => {
                console.warn('⚠️ Watch position failed, but initial position acquired:', err);
                // Don't call onError here since we already have position
              }, 
              { ...options, maximumAge: 60000 }
            );
            console.log('🔥 Watch position started with ID:', watchId.current);
          } catch (e) {
            console.warn('🔥 Watch position failed to start:', e);
          }
        },
        (err) => {
          console.error('❌ CRITICAL: Direct geolocation FAILED:', err.code, err.message);
          
          // Try with different options as fallback
          console.log('🔥 CRITICAL: Trying fallback options...');
          navigator.geolocation.getCurrentPosition(
            onSuccess,
            (fallbackErr) => {
              console.error('❌ CRITICAL: Fallback also failed:', fallbackErr);
              
              let errorMsg = 'Geolocalizzazione non disponibile.';
              if (fallbackErr.code === 1) {
                errorMsg = 'Accesso alla posizione negato. Abilita nelle impostazioni del browser/dispositivo.';
              } else if (fallbackErr.code === 2) {
                errorMsg = 'Posizione non disponibile. Verifica GPS e connessione.';
              } else if (fallbackErr.code === 3) {
                errorMsg = 'Timeout geolocalizzazione. La richiesta è scaduta.';
              }
              
              setState(s => ({ 
                ...s, 
                granted: false, 
                error: errorMsg,
                isIOS,
                isPWA,
                debugInfo: {
                  locationEnabled: false,
                  permission: fallbackErr.code === 1 ? 'denied' : 'prompt',
                  lastError: fallbackErr.message,
                  coords: null,
                  attempts: attemptsRef.current,
                  lastAttemptTime: Date.now()
                }
              }));
            },
            { 
              enableHighAccuracy: true, // Try high accuracy as fallback
              timeout: 15000, 
              maximumAge: 0 
            }
          );
        },
        options
      );
    };

    try {
      console.log('🔐 CRITICAL: Requesting geolocation permission...');
      
      // FORCE direct approach for PWA/iOS
      if (isPWA || isIOS) {
        console.log('🔥 PWA/iOS detected, using direct geolocation approach');
        tryDirectGeolocation();
        return;
      }
      
      // Standard permission check for other browsers
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          console.log('🔐 Permission state:', result.state);
          
          setState(s => ({ ...s, permissionState: result.state }));
          
          if (result.state === 'denied') {
            setState(s => ({ 
              ...s, 
              granted: false,
              error: 'Geolocalizzazione bloccata. Abilita nelle impostazioni del browser.',
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
