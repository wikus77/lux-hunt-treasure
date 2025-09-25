// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, MapPin } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { useBuzzMapCounter } from '@/hooks/useBuzzMapCounter';
import { supabase } from '@/integrations/supabase/client';

interface BuzzMapButtonSecureProps {
  onBuzzMapPress: () => void;
  currentRadius: number;
  isDisabled?: boolean;
}

const BuzzMapButtonSecure: React.FC<BuzzMapButtonSecureProps> = ({
  onBuzzMapPress,
  currentRadius,
  isDisabled = false
}) => {
  const { isAuthenticated, user } = useAuthContext();
  const [isLocked, setIsLocked] = useState(false);
  const { dailyBuzzMapCounter, lastPriceUsed } = useBuzzMapCounter(user?.id);
  const lastErrorRef = useRef<string | null>(null);
  
  // Calculate quota status
  const isQuotaExceeded = dailyBuzzMapCounter >= 5;
  const canPress = isAuthenticated && !isLocked && !isQuotaExceeded && !isDisabled;

  const getResetTimeLocal = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toLocaleString('it-IT', { 
      timeZone: 'Europe/Rome',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTokenFallback = async () => {
    try {
      // Try standard session first
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.access_token) {
        return session.session.access_token;
      }

      // Fallback to localStorage
      const keys = Object.keys(localStorage).filter(k => 
        k.startsWith('sb-') && k.endsWith('-auth-token')
      );
      
      if (keys.length > 0) {
        const tokenData = JSON.parse(localStorage.getItem(keys[0]) || '{}');
        return tokenData?.access_token;
      }
      
      throw new Error('No authentication token found');
    } catch (error) {
      console.error('Token fallback failed:', error);
      throw error;
    }
  };

  const handleBuzzMapPress = async () => {
    if (!isAuthenticated) {
      toast.error('Devi essere loggato per usare BUZZ MAPPA!');
      return;
    }

    if (isQuotaExceeded) {
      const resetTime = getResetTimeLocal();
      toast.error(`Hai raggiunto il limite giornaliero di 5 BUZZ. Riprova dopo ${resetTime}.`);
      return;
    }

    if (isLocked) {
      toast.error('Calma, un BUZZ MAPPA alla volta!');
      return;
    }

    setIsLocked(true);
    
    try {
      const token = await handleTokenFallback();
      
      // Call edge function directly for better error handling
      const response = await fetch(`https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/handle-buzz-press`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          generateMap: true,
          coordinates: { lat: 41.9028, lng: 12.4964 },
          sessionId: `paid_buzz_${Date.now()}`, // Required for paid flow
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        switch (result.code) {
          case 'daily_quota_exceeded':
            const resetTime = result.reset_at_iso ? 
              new Date(result.reset_at_iso).toLocaleString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' }) :
              getResetTimeLocal();
            toast.error(`Limite giornaliero raggiunto (${result.current_count}/5). Riprova dopo ${resetTime}.`);
            break;
          case 'payment_required':
            toast.error('Pagamento richiesto per BUZZ MAPPA.');
            break;
          case 'not_authenticated':
            toast.error('Autenticazione richiesta.');
            break;
          default:
            toast.error(`Errore: ${result.code || 'Errore sconosciuto'}`);
        }
        return;
      }

      // Success
      toast.success(`BUZZ MAPPA generata! Raggio: ${result.radius_km}km`);
      onBuzzMapPress();
      
    } catch (error: any) {
      console.error('BUZZ MAPPA error:', error);
      const errorMsg = error.message || 'Errore di connessione';
      
      // Avoid duplicate error toasts
      if (lastErrorRef.current !== errorMsg) {
        toast.error(errorMsg);
        lastErrorRef.current = errorMsg;
      }
    } finally {
      setTimeout(() => {
        setIsLocked(false);
        lastErrorRef.current = null;
      }, 2000);
    }
  };

  const getDisplayText = () => {
    if (isQuotaExceeded) {
      return {
        main: 'QUOTA',
        sub: 'ESAURITA'
      };
    }
    
    return {
      main: 'BUZZ MAPPA',
      sub: `${currentRadius}km`
    };
  };

  const displayText = getDisplayText();

  return (
    <motion.div className="fixed bottom-20 right-4 z-50">
      <motion.button
        className={`relative rounded-full shadow-lg transition-all duration-300 ${
          canPress
            ? 'bg-gradient-to-br from-purple-500 to-red-500 hover:scale-110 active:scale-95'
            : 'bg-gray-500 cursor-not-allowed opacity-50'
        }`}
        onClick={handleBuzzMapPress}
        disabled={!canPress}
        style={{
          width: '80px',
          height: '80px',
        }}
        whileTap={{ scale: canPress ? 0.9 : 1 }}
        aria-label="BUZZ MAPPA"
        title={isQuotaExceeded ? `Limite giornaliero raggiunto. Riprova dopo mezzanotte.` : `BUZZ MAPPA · ${currentRadius}km`}
      >
        <div className="absolute top-0 left-0 w-full h-full rounded-full flex flex-col items-center justify-center">
          {isLocked ? (
            <Lock className="text-white" size={24} />
          ) : isQuotaExceeded ? (
            <MapPin className="text-white opacity-50" size={24} />
          ) : (
            <>
              <span className="text-xs text-white/90 font-bold">
                {displayText.main}
              </span>
              <span className="text-xs text-white/70 leading-none mt-1">
                {displayText.sub}
              </span>
            </>
          )}
        </div>
      </motion.button>
      
      {/* Daily counter indicator */}
      {isAuthenticated && (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
          {Math.min(dailyBuzzMapCounter, 5)}
        </div>
      )}
    </motion.div>
  );
};

export default BuzzMapButtonSecure;