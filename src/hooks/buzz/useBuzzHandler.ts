
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - BUZZ Handler Hook
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useBuzzApi } from '@/hooks/buzz/useBuzzApi';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { useAbuseProtection } from './useAbuseProtection';
import { useStripePayment } from '@/hooks/useStripePayment';

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
  const { processBuzzPurchase, loading: paymentLoading } = useStripePayment();

  const handleBuzz = async () => {
    console.log('🚀 BUZZ PRESSED - Start handleBuzz', { user: !!user, currentPrice });
    
    if (!user) {
      console.log('❌ BUZZ FAILED - Missing user');
      toast.error('Devi essere loggato per utilizzare BUZZ!');
      return;
    }
    
    try {
      setBuzzing(true);
      setShowShockwave(true);
      await vibrate(100);
      
      console.log('💰 BUZZ PRICE CHECK', { todayCount: currentPrice });
      
      // Check if blocked
      if (currentPrice === 0) {
        toast.error('BUZZ bloccato per oggi! Limite giornaliero raggiunto.');
        return;
      }
      
      // Check abuse protection
      const abuseResult = await checkAbuseAndLog(user.id);
      if (abuseResult.isBlocked) {
        toast.error(abuseResult.message!);
        return;
      }

      // 🚨 MANDATORY: FORCE STRIPE PAYMENT BEFORE BUZZ API
      console.log('💳 BUZZ: Processing MANDATORY Stripe payment');
      
      // Check for active subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('status, tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const isDeveloper = user.email === 'wikus77@hotmail.it';
      
      // MANDATORY: Force payment if no subscription and not developer
      if (!isDeveloper && (subError || !subscription)) {
        console.log('💳 BUZZ: Payment REQUIRED - no active subscription found');
        
        // 🚨 MANDATORY: Process Stripe payment before BUZZ
        const paymentSuccess = await processBuzzPurchase(false, currentPrice);
        
        if (!paymentSuccess) {
          toast.error("Pagamento obbligatorio", {
            description: "Il pagamento tramite Stripe è necessario per utilizzare BUZZ."
          });
          setBuzzing(false);
          setShowShockwave(false);
          return;
        }
        
        console.log('✅ BUZZ: Stripe payment completed successfully');
      } else if (isDeveloper) {
        console.log('🔓 BUZZ: Developer bypass activated for wikus77@hotmail.it');
      } else {
        console.log('✅ BUZZ: Active subscription verified, proceeding');
      }

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
      
      console.log('✅ BUZZ API CALL COMPLETED');
      console.log('🚨 POST-BUZZ API CALL:', {
        success: buzzResult?.success,
        error: buzzResult?.error,
        errorMessage: buzzResult?.errorMessage,
        hasClueText: !!buzzResult?.clue_text,
        fullResult: buzzResult
      });
      
      if (buzzResult.error) {
        console.error('BUZZ API Error:', buzzResult.errorMessage);
        toast.dismiss();
        toast.error(buzzResult.errorMessage || 'Errore di rete. Riprova.');
        return;
      }
      
      if (!buzzResult.success) {
        toast.dismiss();
        toast.error(buzzResult.errorMessage || 'Errore durante BUZZ');
        return;
      }
      
      console.log('📝 BUZZ RESULT M1SSION™:', { 
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
      
      // ✅ TOAST SUCCESS CON CLUE_TEXT REALE
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
      
      // Success callback
      onSuccess();
      
      // Reset shockwave after animation
      setTimeout(() => {
        setShowShockwave(false);
      }, 1500);
      
    } catch (err) {
      console.error('Error in handleBuzz:', err);
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
