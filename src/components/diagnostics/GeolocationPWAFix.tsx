// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface GeoLocationState {
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'error';
  position?: { lat: number; lng: number; accuracy: number };
  error?: string;
  isPWA: boolean;
  isSafari: boolean;
}

export const GeolocationPWAFix: React.FC<{ 
  onLocationUpdate: (lat: number, lng: number, accuracy: number) => void;
  children: (state: GeoLocationState, requestLocation: () => void) => React.ReactNode;
}> = ({ onLocationUpdate, children }) => {
  const [state, setState] = useState<GeoLocationState>({
    status: 'idle',
    isPWA: false,
    isSafari: false
  });

  useEffect(() => {
    // Detect PWA and Safari
    const isPWA = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    setState(prev => ({ ...prev, isPWA, isSafari }));
    
    console.log('🗺️ GeolocationPWAFix: Environment detected', { isPWA, isSafari });
  }, []);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: 'Geolocalizzazione non supportata dal browser' 
      }));
      return;
    }

    setState(prev => ({ ...prev, status: 'requesting' }));
    
    try {
      // Check permissions first if available (not in Safari)
      if ('permissions' in navigator && !state.isSafari) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          console.log('🗺️ GeolocationPWAFix: Permission state:', permission.state);
          
          if (permission.state === 'denied') {
            setState(prev => ({ 
              ...prev, 
              status: 'denied', 
              error: 'Autorizzazione geolocalizzazione negata' 
            }));
            toast.error('Geolocalizzazione negata', {
              description: 'Controlla le impostazioni del browser'
            });
            return;
          }
        } catch (e) {
          console.log('🗺️ GeolocationPWAFix: Permissions API not available');
        }
      }

      // Configure options based on environment
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: state.isPWA ? 25000 : 15000, // Longer timeout for PWA
        maximumAge: state.isPWA ? 60000 : 30000 // Allow cached position in PWA
      };

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('🗺️ GeolocationPWAFix: Position success', {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            });
            resolve(pos);
          },
          (error) => {
            console.error('🗺️ GeolocationPWAFix: Position error', error);
            reject(error);
          },
          options
        );
      });

      const newPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      setState(prev => ({ 
        ...prev, 
        status: 'granted', 
        position: newPosition, 
        error: undefined 
      }));

      onLocationUpdate(newPosition.lat, newPosition.lng, newPosition.accuracy);
      
      toast.success('Posizione rilevata', {
        description: `Accuratezza: ${Math.round(newPosition.accuracy)}m`
      });

    } catch (error: any) {
      console.error('🗺️ GeolocationPWAFix: Error:', error);
      
      let errorMessage = 'Errore sconosciuto';
      let status: GeoLocationState['status'] = 'error';
      
      if (error.code === 1) {
        errorMessage = 'Autorizzazione geolocalizzazione negata';
        status = 'denied';
        toast.error('Geolocalizzazione negata', {
          description: 'Controlla le impostazioni del browser'
        });
      } else if (error.code === 2) {
        errorMessage = 'Posizione non disponibile';
        toast.error('Posizione non disponibile', {
          description: 'Riprova tra qualche secondo'
        });
      } else if (error.code === 3) {
        errorMessage = 'Timeout geolocalizzazione';
        toast.error('Timeout geolocalizzazione', {
          description: 'La richiesta ha impiegato troppo tempo'
        });
      }

      setState(prev => ({ 
        ...prev, 
        status, 
        error: errorMessage 
      }));

      // Fallback to Rome coordinates if all fails
      if (status === 'error') {
        const fallbackPos = { lat: 41.9028, lng: 12.4964, accuracy: 1000 };
        setState(prev => ({ 
          ...prev, 
          position: fallbackPos,
          error: `${errorMessage} - Usando posizione di fallback (Roma)`
        }));
        onLocationUpdate(fallbackPos.lat, fallbackPos.lng, fallbackPos.accuracy);
      }
    }
  };

  return <>{children(state, requestLocation)}</>;
};