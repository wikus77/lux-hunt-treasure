
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Handler Hook - RESET COMPLETO 17/07/2025
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useBuzzApi } from '@/hooks/buzz/useBuzzApi';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { useAbuseProtection } from './useAbuseProtection';
import { useUniversalStripePayment } from '@/hooks/useUniversalStripePayment';
import { useBuzzNotificationScheduler } from '@/hooks/useBuzzNotificationScheduler';

interface UseBuzzHandlerProps {
  currentPrice: number;
  onSuccess: () => void;
}

export function useBuzzHandler({ currentPrice, onSuccess }: UseBuzzHandlerProps) {
  const [buzzing, setBuzzing] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const { user } = useAuth();
  const { vibrate } = useCapacitorHardware();
  const { checkAbuseAndLog } = useAbuseProtection();
  const { processPayment, loading: paymentLoading } = useUniversalStripePayment();
  const { scheduleBuzzAvailableNotification } = useBuzzNotificationScheduler();

  const handleBuzz = async () => {
    console.log('🚀 BUZZ PRESSED - Start handleBuzz', { 
      user: !!user, 
      currentPrice,
      timestamp: new Date().toISOString()
    });
    
    if (!user) {
      console.log('❌ BUZZ FAILED - Missing user');
      toast.error('Devi essere loggato per utilizzare BUZZ!');
      return;
    }
    
    try {
      setBuzzing(true);
      setShowShockwave(true);
      await vibrate(100);
      
      console.log('💰 BUZZ PRICE CHECK', { currentPrice });
      
      // Check if blocked
      if (currentPrice === 0) {
        toast.error('BUZZ bloccato per oggi! Limite giornaliero raggiunto.');
        setBuzzing(false);
        setShowShockwave(false);
        return;
      }
      
      // Check abuse protection
      const abuseResult = await checkAbuseAndLog(user.id);
      if (abuseResult.isBlocked) {
        toast.error(abuseResult.message!);
        setBuzzing(false);
        setShowShockwave(false);
        return;
      }

      // 🚨 MANDATORY: Use Universal Stripe In-App Checkout
      console.log('💳 BUZZ: Opening Universal Stripe Checkout');
      
      const paymentSuccess = await processPayment({
        paymentType: 'buzz',
        planName: 'BUZZ Extra',
        amount: currentPrice * 100, // Convert to cents
        description: 'Indizio extra per la missione',
        isBuzzMap: false,
        onSuccess: async () => {
          console.log('✅ BUZZ Payment completed, proceeding with BUZZ generation');
          
          // Call BUZZ API after payment
          try {
            const { callBuzzApi } = useBuzzApi();
            
            const buzzResult = await callBuzzApi({
              userId: user.id,
              generateMap: false,
              coordinates: null,
              prizeId: null,
              sessionId: `buzz_${Date.now()}`
            });
            
            if (buzzResult.error) {
              console.error('❌ BUZZ API Error:', buzzResult.errorMessage);
              toast.error(buzzResult.errorMessage || 'Errore di rete. Riprova.');
              return;
            }
            
            if (!buzzResult.success || !buzzResult?.clue_text || buzzResult.clue_text.trim() === '') {
              console.error('❌ CLUE_TEXT NON VALIDO:', buzzResult);
              toast.error('❌ Indizio non ricevuto dal server');
              return;
            }
            
            // Log the buzz action
            await supabase.from('buzz_map_actions').insert({
              user_id: user.id,
              cost_eur: currentPrice,
              clue_count: 1,
              radius_generated: 0
            });
            
            // Show clue
            toast.success(buzzResult.clue_text, {
              duration: 4000,
              position: 'top-center',
              style: { 
                zIndex: 9999,
                background: 'linear-gradient(135deg, #F213A4 0%, #FF4D4D 100%)',
                color: 'white',
                fontWeight: 'bold'
              }
            });
            
            // Success callback and notification
            onSuccess();
            await scheduleBuzzAvailableNotification();
            
          } catch (err) {
            console.error('❌ Error in BUZZ API call:', err);
            toast.error('Errore durante la generazione dell\'indizio');
          }
        }
      });
      
      if (!paymentSuccess) {
        setBuzzing(false);
        setShowShockwave(false);
        return;
      }
      
      // Reset shockwave after animation
      setTimeout(() => {
        setShowShockwave(false);
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error in handleBuzz:', err);
      toast.error('Errore imprevisto durante BUZZ');
      setBuzzing(false);
      setShowShockwave(false);
    } finally {
      setBuzzing(false);
    }
  };

  return {
    buzzing,
    showShockwave,
    handleBuzz
  };
}
