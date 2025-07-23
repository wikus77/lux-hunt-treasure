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
    // COSMETIC ONLY: This function is maintained for compatibility but no longer awards prizes
    console.log("🎰 Cosmetic spin triggered - no prizes awarded");
    
    // Return cosmetic result
    return {
      success: true,
      prize: "Grazie per aver partecipato!",
      rotation_deg: rotationDeg,
      message: "Continua la missione per vincere premi reali basati sulla tua abilità.",
      reroute_path: "/home"
    };
  };

  // COSMETIC ONLY: No prize redirects
  const getPrizeRedirectPath = () => {
    return "/home";
  };

  return {
    spinWheel,
    isSpinning,
    spinResult,
    error,
    setSpinResult: () => {}, // No-op for cosmetic wheel
    getPrizeRedirectPath,
  };
};