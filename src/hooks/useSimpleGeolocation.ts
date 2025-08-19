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
    console.log('🎯 SIMPLE GEO: Starting location request...', {
      browser: navigator.userAgent,
      isSecureContext: window.isSecureContext,
      geolocationAvailable: !!navigator.geolocation,
      isIframe: window !== window.top,
      protocol: window.location.protocol,
      hostname: window.location.hostname
    });
    
    if (!navigator.geolocation) {
      const error = 'Geolocalizzazione non supportata dal browser';
      setState(prev => ({ ...prev, error, hasPermission: false }));
      toast.error(error);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    toast.info('📍 Rilevamento posizione in corso...');

    // Timeout di sicurezza per iOS PWA - MOLTO PIÙ LUNGO
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isLoading: false, error: 'Timeout rilevamento posizione dopo 45 secondi' }));
      toast.error('⏱️ Timeout rilevamento posizione - Prova a ricaricare la pagina');
    }, 45000);

    console.log('🎯 SIMPLE GEO: Calling getCurrentPosition with options:', {
      enableHighAccuracy: true,
      timeout: 45000,
      maximumAge: 60000
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('🎯 SIMPLE GEO: SUCCESS!!! Position received:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        
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
        
        console.log('🎯 SIMPLE GEO: State updated, triggering toast...');
        toast.success('🎯 Posizione rilevata con successo!');
      },
      (error) => {
        console.error('🎯 SIMPLE GEO: ERROR!!!', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT
        });
        
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
        timeout: 45000,  // 45 secondi per iOS PWA
        maximumAge: 60000  // Cache di 1 minuto
      }
    );
  }, []);

  return {
    ...state,
    requestLocation
  };
};