// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';
import { toast } from 'sonner';

interface SpinResult {
  success: boolean;
  prize: string;
  rotation_deg: number;
  message: string;
  log_id?: string;
}

export const useDailySpin = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const { user, session } = useUnifiedAuth();

  const spinWheel = async (prize: string, rotationDeg: number) => {
    if (!user || !session) {
      toast.error('Devi essere autenticato per giocare');
      return null;
    }

    try {
      setIsSpinning(true);
      setSpinResult(null);

      const { data, error } = await supabase.functions.invoke('log-daily-spin', {
        body: {
          user_id: user.id,
          prize,
          rotation_deg: rotationDeg,
          client_ip: null, // Verrà rilevato dal server
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Errore spin:', error);
        
        if (error.message?.includes('ALREADY_PLAYED_TODAY')) {
          toast.error('Hai già giocato oggi! Torna domani per un nuovo giro.');
        } else {
          toast.error('Errore durante il giro della ruota');
        }
        return null;
      }

      console.log('🎰 Risultato spin:', data);
      setSpinResult(data);
      
      // Toast di successo
      toast.success(data.message || `Hai vinto: ${data.prize}!`);
      
      return data;

    } catch (err) {
      console.error('❌ Errore critico spin:', err);
      toast.error('Errore imprevisto durante il giro');
      return null;
    } finally {
      setIsSpinning(false);
    }
  };

  return {
    spinWheel,
    isSpinning,
    spinResult,
    setSpinResult,
  };
};