
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Handler Hook - RESET COMPLETO 17/07/2025
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useBuzzApi } from '@/hooks/buzz/useBuzzApi';
import { usePWAHardwareStub } from '@/hooks/usePWAHardwareStub';
import { useAbuseProtection } from './useAbuseProtection';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useBuzzNotificationScheduler } from '@/hooks/useBuzzNotificationScheduler';

interface UseBuzzHandlerProps {
  currentPrice: number;
  onSuccess: () => void;
  hasFreeBuzz?: boolean; // 🔥 ADDED: Flag to indicate if user has free buzz
  context?: { source?: string; skipServerBuzzPress?: boolean }; // 🔥 ADDED: Context to avoid post-payment toast duplication
}

export function useBuzzHandler({ currentPrice, onSuccess, hasFreeBuzz = false, context }: UseBuzzHandlerProps) {
  const [buzzing, setBuzzing] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const { user } = useAuth();
  const { vibrate } = usePWAHardwareStub();
  const { checkAbuseAndLog } = useAbuseProtection();
  const { processBuzzPurchase, loading: paymentLoading } = useStripePayment();
  const { scheduleBuzzAvailableNotification } = useBuzzNotificationScheduler();

  const handleBuzz = async () => {
    console.log('🚀 BUZZ PRESSED - Start handleBuzz - RESET COMPLETO 17/07/2025', { 
      user: !!user, 
      currentPrice,
      context,
      timestamp: new Date().toISOString()
    });
    
    // 🔥 FIXED: Skip server call if context indicates post-payment already handled
    if (context?.skipServerBuzzPress) {
      console.log('🔇 M1SSION™ SKIP BUZZ API: Post-payment context detected, server call already handled');
      return;
    }
    
    if (!user) {
      console.log('❌ BUZZ FAILED - Missing user');
      toast.error('Devi essere loggato per utilizzare BUZZ!');
      return;
    }
    
    try {
      setBuzzing(true);
      setShowShockwave(true);
      await vibrate(100);
      
      console.log('💰 BUZZ PRICE CHECK - FIXED', { currentPrice, hasFreeBuzz });
      
      // Progressive pricing - no blocking, price increases with usage
      console.log('💰 PROGRESSIVE PRICING: Current price €' + currentPrice + ' for usage level');
      
      // 🔥 FIXED: Allow zero price for FREE buzz, only check for paid buzz
      if (!hasFreeBuzz && currentPrice <= 0) {
        toast.error('Errore nel calcolo del prezzo BUZZ');
        return;
      }
      
      // Check abuse protection
      const abuseResult = await checkAbuseAndLog(user.id);
      if (abuseResult.isBlocked) {
        toast.error(abuseResult.message!);
        return;
      }

      // 🚨 PAYMENT HANDLED IN BuzzActionButton - PROCEED DIRECTLY TO BUZZ API
      console.log('💳 BUZZ: Payment already processed by BuzzActionButton - proceeding to API - RESET COMPLETO 17/07/2025');

      // ✅ CHIAMATA API BUZZ DOPO PAGAMENTO VERIFICATO
      console.log('🚨 CALLING BUZZ API AFTER PAYMENT...');
      const { callBuzzApi } = useBuzzApi();
      
      const buzzResult = await callBuzzApi({
        userId: user.id,
        generateMap: false, // Regular BUZZ, not map
        coordinates: null,
        prizeId: null,
        sessionId: `buzz_${Date.now()}`
      });
      
      console.log('✅ BUZZ API CALL COMPLETED - RESET COMPLETO 17/07/2025');
      console.log('🚨 POST-BUZZ API CALL:', {
        success: buzzResult?.success,
        error: buzzResult?.error,
        errorMessage: buzzResult?.errorMessage,
        hasClueText: !!buzzResult?.clue_text,
        fullResult: buzzResult
      });
      
      if (buzzResult.error) {
        console.error('❌ BUZZ API Error:', buzzResult.errorMessage);
        toast.dismiss();
        toast.error(buzzResult.errorMessage || 'Errore di rete. Riprova.');
        return;
      }
      
      if (!buzzResult.success) {
        toast.dismiss();
        toast.error(buzzResult.errorMessage || 'Errore durante BUZZ');
        return;
      }
      
      console.log('📝 BUZZ RESULT M1SSION™ - RESET COMPLETO 17/07/2025:', { 
        clue_text: buzzResult.clue_text,
        success: buzzResult.success,
        full_response: buzzResult
      });
      
      // ✅ VERIFICA CLUE_TEXT VALIDO
      if (!buzzResult?.clue_text || buzzResult.clue_text.trim() === '') {
        console.error('❌ CLUE_TEXT NON VALIDO:', buzzResult);
        toast.error('❌ Indizio non ricevuto dal server');
        return;
      }
      
      // Log the buzz action
      await supabase.from('buzz_map_actions').insert({
        user_id: user.id,
        cost_eur: currentPrice,
        clue_count: 1,
        radius_generated: 0 // Regular BUZZ has no radius
      });
      
      // ✅ TOAST SUCCESS CON CLUE_TEXT REALE (only if not from post-payment context)
      if (context?.source !== 'paid') {
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
      } else {
        console.log('🔇 M1SSION™ SKIP TOAST: Post-payment context detected, toast already handled by Stripe flow');
      }
      
      // Success callback
      onSuccess();

      // 🔔 Schedule push notification for 3 hours from now
      console.log('📅 Scheduling BUZZ cooldown notification...');
      await scheduleBuzzAvailableNotification();
      
      // Reset shockwave after animation
      setTimeout(() => {
        setShowShockwave(false);
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error in handleBuzz - RESET COMPLETO 17/07/2025:', err);
      toast.error('Errore imprevisto durante BUZZ');
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
