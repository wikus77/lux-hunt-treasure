// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { supabase } from '@/integrations/supabase/client';

interface BuzzMapButtonPaidOnlyProps {
  onBuzzPress: () => void;
  mapCenter?: [number, number];
  onAreaGenerated?: (lat: number, lng: number, radius: number) => void;
}

const BuzzMapButtonPaidOnly: React.FC<BuzzMapButtonPaidOnlyProps> = ({
  onBuzzPress,
  mapCenter,
  onAreaGenerated
}) => {
  const { isAuthenticated } = useAuthContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentWeekAreas } = useBuzzMapLogic();
  
  // Simple 3-hour cooldown check
  const isEligibleForBuzz = true; // Simplified for paid-only logic

  const handleBuzzMapPress = async () => {
    if (!isAuthenticated) {
      toast.error('Devi essere loggato per usare il Buzz Map!');
      return;
    }

    if (!mapCenter || !mapCenter[0] || !mapCenter[1]) {
      toast.error('Centro mappa non disponibile');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Sessione scaduta. Effettua di nuovo il login.');
        return;
      }

      // Call edge function directly with paid-only logic
      const { data, error } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          lat: mapCenter[0],
          lng: mapCenter[1],
          radiusKm: 0.5,
          sessionId: 'paid_buzz_map'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success('🎯 Buzz Map generato con successo!');
        onAreaGenerated?.(mapCenter[0], mapCenter[1], 0.5);
      } else {
        throw new Error(data?.error || 'Errore sconosciuto');
      }
    } catch (error: any) {
      console.error('❌ BUZZ MAP Error:', error);
      if (error.message?.includes('429')) {
        toast.error('Limite giornaliero raggiunto (5/giorno)');
      } else if (error.message?.includes('403')) {
        toast.error('Pagamento richiesto');
      } else {
        toast.error('Errore durante la generazione della mappa');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div className="fixed bottom-20 right-4 z-50">
      <motion.button
        className={`relative rounded-full shadow-lg transition-all duration-300 ${
          isAuthenticated && isEligibleForBuzz
            ? 'bg-gradient-to-br from-purple-500 to-red-500 hover:scale-110 active:scale-95' 
            : 'bg-gray-500 cursor-not-allowed opacity-50'
        }`}
        onClick={handleBuzzMapPress}
        disabled={!isAuthenticated || isProcessing || !isEligibleForBuzz}
        style={{
          width: '80px',
          height: '80px',
        }}
        whileTap={{ scale: (isAuthenticated && isEligibleForBuzz) ? 0.9 : 1 }}
        aria-label="Genera Buzz Map"
      >
        <div className="absolute top-0 left-0 w-full h-full rounded-full flex flex-col items-center justify-center">
          <span className="text-xs text-white/90 font-bold leading-none">
            BUZZ MAPPA
          </span>
          <span className="text-xs text-white/70 leading-none mt-1">
            500km
          </span>
        </div>
      </motion.button>
      {(!isEligibleForBuzz && isAuthenticated) && (
        <div className="absolute bottom-full mb-2 right-0 bg-black/80 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          Attendere 3h dal precedente
        </div>
      )}
    </motion.div>
  );
};

export default BuzzMapButtonPaidOnly;