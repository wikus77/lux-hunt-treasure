// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useEffect } from 'react';
import supabase from '../../../integrations/supabase/client';

export function useAgentLocationSync(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('geolocation' in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          await supabase.rpc('set_my_agent_location', { lat, lng });
        } catch {}
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => { try { navigator.geolocation.clearWatch(id); } catch {} };
  }, [enabled]);
}
