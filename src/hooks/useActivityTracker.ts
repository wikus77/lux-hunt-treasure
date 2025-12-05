// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// ACTIVITY TRACKER - Traccia comportamento utente per notifiche intelligenti
// NOTA: Non invasivo, lavora in background

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';

// Mappa route a page name
const ROUTE_TO_PAGE: Record<string, string> = {
  '/home': 'home',
  '/map-3d-tiler': 'map',
  '/buzz-map': 'map',
  '/buzz': 'buzz',
  '/intelligence': 'intelligence',
  '/leaderboard': 'leaderboard',
  '/notifications': 'notifications',
};

/**
 * Hook che traccia l'attività dell'utente per il sistema di notifiche smart
 * Lavora silenziosamente in background, non impatta le performance
 */
export const useActivityTracker = () => {
  const { user } = useAuth();
  const [location] = useLocation();
  const pageStartTime = useRef<number>(Date.now());
  const currentPage = useRef<string | null>(null);
  const lastLocationUpdate = useRef<number>(0);

  // Invia tempo trascorso sulla pagina precedente
  const flushPageTime = useCallback(async () => {
    if (!user?.id || !currentPage.current) return;

    const timeSpent = Math.floor((Date.now() - pageStartTime.current) / 1000);
    
    // Ignora tempi troppo brevi (< 3 secondi) o troppo lunghi (> 30 minuti = AFK)
    if (timeSpent < 3 || timeSpent > 1800) return;

    try {
      await supabase.rpc('update_user_activity', {
        p_user_id: user.id,
        p_page: currentPage.current,
        p_seconds: timeSpent
      });
    } catch {
      // Silenzioso - non critico
    }
  }, [user?.id]);

  // Traccia cambio pagina
  useEffect(() => {
    if (!user?.id) return;

    // Determina la pagina corrente
    const page = ROUTE_TO_PAGE[location] || null;

    // Se la pagina è cambiata
    if (page !== currentPage.current) {
      // Flush tempo pagina precedente
      flushPageTime();
      
      // Inizia tracking nuova pagina
      currentPage.current = page;
      pageStartTime.current = Date.now();
    }
  }, [location, user?.id, flushPageTime]);

  // Traccia posizione (max ogni 5 minuti)
  useEffect(() => {
    if (!user?.id) return;

    const updateLocation = async () => {
      // Rate limit: max ogni 5 minuti
      const now = Date.now();
      if (now - lastLocationUpdate.current < 5 * 60 * 1000) return;

      if (!('geolocation' in navigator)) return;

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 5 * 60 * 1000 // Cache 5 minuti
          });
        });

        lastLocationUpdate.current = now;

        await supabase.rpc('update_user_activity', {
          p_user_id: user.id,
          p_page: currentPage.current || 'unknown',
          p_seconds: 0,
          p_lat: position.coords.latitude,
          p_lng: position.coords.longitude
        });
      } catch {
        // Silenzioso - geolocation può fallire
      }
    };

    // Update iniziale
    updateLocation();

    // Update ogni 5 minuti
    const intervalId = setInterval(updateLocation, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user?.id]);

  // Flush quando l'utente lascia la pagina
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushPageTime();
      }
    };

    const handleBeforeUnload = () => {
      flushPageTime();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushPageTime(); // Flush finale
    };
  }, [flushPageTime]);
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


