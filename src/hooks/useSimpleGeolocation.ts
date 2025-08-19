// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// GEOLOCALIZZAZIONE SEMPLICE E FUNZIONANTE - BASTA CAZZATE
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface GeoState {
  isLoading: boolean;
  coords: { lat: number; lng: number } | null;
  error: string | null;
  hasPermission: boolean;
}

export const useSimpleGeolocation = () => {
  const [state, setState] = useState<GeoState>({
    isLoading: false,
    coords: null,
    error: null,
    hasPermission: false
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();

  const requestLocation = useCallback(async () => {
    console.log('🎯 SIMPLE GEO: Starting location request...');
    
    if (!navigator.geolocation) {
      const error = 'Geolocalizzazione non supportata dal browser';
      setState(prev => ({ ...prev, error, hasPermission: false }));
      toast.error(error);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    toast.info('📍 Rilevamento posizione in corso...');

    // Timeout di sicurezza per iOS PWA
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isLoading: false, error: 'Timeout rilevamento posizione' }));
      toast.error('⏱️ Timeout rilevamento posizione');
    }, 15000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('🎯 SIMPLE GEO: Success!', position.coords);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setState({
          isLoading: false,
          coords,
          error: null,
          hasPermission: true
        });
        
        toast.success('🎯 Posizione rilevata con successo!');
      },
      (error) => {
        console.error('🎯 SIMPLE GEO: Error!', error);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        let errorMessage = 'Errore nel rilevare la posizione';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permesso di geolocalizzazione negato. Abilitalo nelle impostazioni del browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Posizione non disponibile.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout rilevamento posizione.';
            break;
        }
        
        setState({
          isLoading: false,
          coords: null,
          error: errorMessage,
          hasPermission: false
        });
        
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    );
  }, []);

  return {
    ...state,
    requestLocation
  };
};