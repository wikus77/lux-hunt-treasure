// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';
import { toast } from 'sonner';
// REMOVED: PRIZE_REDIRECTS - cosmetic wheel only

interface SpinResult {
  success: boolean;
  prize: string;
  rotation_deg: number;
  message: string;
  log_id?: string;
  reroute_path?: string;
}

export const useDailySpin = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useUnifiedAuth();

  const spinWheel = async (prize: string, rotationDeg: number) => {
    if (!user || !session) {
      const errorMsg = 'Devi essere autenticato per giocare';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    try {
      setIsSpinning(true);
      setSpinResult(null);
      setError(null);

      // COSMETIC ONLY: No prize redirects
      const reroute_path = "/home";

      const { data, error } = await supabase.functions.invoke('log-daily-spin', {
        body: {
          user_id: user.id,
          prize,
          rotation_deg: rotationDeg,
          client_ip: null, // Verrà rilevato dal server
          reroute_path
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Errore spin:', error);
        
        let errorMessage = 'Errore durante il giro della ruota';
        if (error.message?.includes('ALREADY_PLAYED_TODAY')) {
          errorMessage = 'Hai già giocato oggi! Torna domani per un nuovo giro.';
        } else if (error.message?.includes('row-level security')) {
          errorMessage = 'Errore di sicurezza. Riprova più tardi.';
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }

      console.log('🎰 Risultato spin:', data);
      
      // COSMETIC ONLY: Fixed redirect to home
      const resultWithRedirect = {
        ...data,
        reroute_path: "/home"
      };
      
      setSpinResult(resultWithRedirect);
      
      // Handle special case for 3h buzz cooldown
      if (prize === '3h senza blocchi BUZZ') {
        localStorage.setItem('buzzCooldownEnd', (Date.now() + 3 * 60 * 60 * 1000).toString());
      }
      
      // Toast di successo
      toast.success(data.message || `Hai vinto: ${data.prize}!`);
      
      return resultWithRedirect;

    } catch (err) {
      console.error('❌ Errore critico spin:', err);
      const errorMsg = 'Errore imprevisto durante il giro';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setIsSpinning(false);
    }
  };

  const getPrizeRedirectPath = (prize: string) => {
    return "/home"; // COSMETIC ONLY: Always redirect to home
  };

  return {
    spinWheel,
    isSpinning,
    spinResult,
    error,
    setSpinResult,
    getPrizeRedirectPath,
  };
};