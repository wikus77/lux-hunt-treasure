
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Handler Hook - RESET COMPLETO 17/07/2025
import { useState, useEffect } from 'react';
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
  const { processBuzzPurchase, loading: paymentLoading } = useUniversalStripePayment();
  const { scheduleBuzzAvailableNotification } = useBuzzNotificationScheduler();
  const { callBuzzApi } = useBuzzApi();

  // 🚨 CRITICAL: AGGRESSIVE RESET ON MOUNT - MANDATORY FOR STUCK STATE
  useEffect(() => {
    console.log('🔄 BUZZ HANDLER INIT: AGGRESSIVE clearing any stuck state - CRITICAL FIX');
    setBuzzing(false);
    setShowShockwave(false);
    
    // 🚨 CRITICAL: Double reset after 100ms to ensure state is cleared
    const doubleReset = setTimeout(() => {
      console.log('🔄 BUZZ HANDLER: Double reset to ensure clean state');
      setBuzzing(false);
      setShowShockwave(false);
    }, 100);
    
    return () => clearTimeout(doubleReset);
  }, []);

  // 🚨 CRITICAL: Auto-reset buzzing state after 5 seconds (reduced from 10) + window focus reset
  useEffect(() => {
    if (buzzing) {
      console.log('🚨 BUZZING STATE ACTIVE: Setting 5-second auto-reset');
      
      const timeout = setTimeout(() => {
        console.log('🔄 AUTO-RESET: Clearing stuck buzzing state after 5s');
        setBuzzing(false);
        setShowShockwave(false);
      }, 5000); // Reduced to 5 seconds
      
      return () => clearTimeout(timeout);
    }
  }, [buzzing]);

  // 🚨 CRITICAL: Reset on window focus to handle PWA issues
  useEffect(() => {
    const handleFocus = () => {
      if (buzzing) {
        console.log('🔄 WINDOW FOCUS: Resetting stuck buzzing state');
        setBuzzing(false);
        setShowShockwave(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && buzzing) {
        console.log('🔄 VISIBILITY CHANGE: Resetting stuck buzzing state');
        setBuzzing(false);
        setShowShockwave(false);
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, [buzzing]);

  const handleBuzz = async () => {
    console.log('🚀 BUZZ PRESSED - Start handleBuzz - RESET COMPLETO 17/07/2025', { 
      user: !!user, 
      currentPrice,
      timestamp: new Date().toISOString()
    });
    
    if (!user) {
      console.log('❌ BUZZ FAILED - Missing user');
      toast.error('Devi essere loggato per utilizzare BUZZ!');
      setBuzzing(false);
      setShowShockwave(false);
      return;
    }
    
    try {
      setBuzzing(true);
      setShowShockwave(true);
      await vibrate(100);
      
      console.log('💰 BUZZ PRICE CHECK - RESET COMPLETO 17/07/2025', { currentPrice });
      
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

      // 🚨 MANDATORY: FORCE STRIPE PAYMENT BEFORE BUZZ API - NO EXCEPTIONS
      console.log('💳 BUZZ: Processing MANDATORY Stripe payment - FORCED FOR ALL - RESET COMPLETO 17/07/2025');
      
      // 🚨 CRITICAL: ESATTAMENTE come BUZZ MAPPA che funziona - await + check result
      console.log('💳 BUZZ: Processing MANDATORY Stripe payment - COPIO LOGICA BUZZ MAPPA');
      
      // COPIO ESATTAMENTE la logica del BUZZ MAPPA che FUNZIONA
      const result = await processBuzzPurchase(false, currentPrice, handlePaymentSuccess);
      
      if (result) {
        console.log('✅ BUZZ: Stripe checkout opened successfully - waiting for payment completion');
        toast.success("Checkout Stripe aperto", {
          description: `Completa il pagamento di €${currentPrice.toFixed(2)} per ricevere l'indizio BUZZ`
        });
        
        // Keep buzzing state active until payment completion
        // The buzzing state will be reset in handlePaymentSuccess or handlePaymentCancel
      } else {
        console.error('❌ BUZZ: processBuzzPurchase failed');
        toast.error("Impossibile aprire il checkout", {
          description: "Problema con il sistema di pagamento Stripe"
        });
        setBuzzing(false);
        setShowShockwave(false);
        return;
      }
      
    } catch (err) {
      console.error('❌ Error in handleBuzz - RESET COMPLETO 17/07/2025:', err);
      toast.error('Errore imprevisto durante BUZZ');
      setBuzzing(false);
      setShowShockwave(false);
    }
  };

  // This function will be called after successful payment
  const handlePaymentSuccess = async () => {
    console.log('💳 BUZZ: Payment completed successfully - calling API - RESET COMPLETO 17/07/2025');
    
    if (!user) {
      console.error('❌ BUZZ: No user available for API call');
      return;
    }
    
    try {
      setBuzzing(true);
      setShowShockwave(true);
      
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
        setBuzzing(false);
        setShowShockwave(false);
        return;
      }
      
      if (!buzzResult.success) {
        toast.dismiss();
        toast.error(buzzResult.errorMessage || 'Errore durante BUZZ');
        setBuzzing(false);
        setShowShockwave(false);
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
        setBuzzing(false);
        setShowShockwave(false);
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

      // 🔔 Schedule push notification for 3 hours from now
      console.log('📅 Scheduling BUZZ cooldown notification...');
      await scheduleBuzzAvailableNotification();
      
      // Reset shockwave after animation
      setTimeout(() => {
        setShowShockwave(false);
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error in handlePaymentSuccess - RESET COMPLETO 17/07/2025:', err);
      toast.error('Errore imprevisto durante BUZZ');
    } finally {
      setBuzzing(false);
    }
  };

  // Function to handle checkout cancellation
  const handlePaymentCancel = () => {
    console.log('❌ BUZZ: Payment cancelled by user');
    setBuzzing(false);
    setShowShockwave(false);
  };

  return {
    buzzing,
    showShockwave,
    handleBuzz,
    handlePaymentSuccess,
    handlePaymentCancel
  };
}
