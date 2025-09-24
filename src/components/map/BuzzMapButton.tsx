
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Map Button Component - Progressive Pricing System

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { useBuzzMapProgressivePricing } from '@/hooks/map/useBuzzMapProgressivePricing';
import { useStripeInAppPayment } from '@/hooks/useStripeInAppPayment';
import { useBuzzNotificationScheduler } from '@/hooks/useBuzzNotificationScheduler';
import { supabase } from '@/integrations/supabase/client';
import { BuzzCostWarningModal } from '@/components/buzz/BuzzCostWarningModal';
import StripeInAppCheckout from '@/components/subscription/StripeInAppCheckout';

interface BuzzMapButtonProps {
  onBuzzPress: () => void;
  mapCenter?: [number, number];
  onAreaGenerated?: (lat: number, lng: number, radius: number) => void;
}

const BuzzMapButton: React.FC<BuzzMapButtonProps> = ({
  onBuzzPress,
  mapCenter,
  onAreaGenerated
}) => {
  const { isAuthenticated, user } = useAuthContext();
  const { 
    buzzMapPrice, 
    radiusKm, 
    segment,
    dailyBuzzMapCounter,
    isEligibleForBuzz,
    needsCostWarning,
    isEliteMaxPrice,
    validateBuzzRequest,
    incrementGeneration,
    // © 2025 Joseph MULÉ – M1SSION™ – Override System
    buzzOverride,
    setBuzzOverride
  } = useBuzzMapProgressivePricing();
  const { 
    processBuzzPayment, 
    showCheckout, 
    paymentConfig, 
    closeCheckout, 
    handlePaymentSuccess,
    loading 
  } = useStripeInAppPayment();
  const { scheduleBuzzMappaNotification } = useBuzzNotificationScheduler();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleBuzzMapPress = async () => {
    console.log('🎯 BUZZ MAPPA PRESSED - PROGRESSIVE PRICING SYSTEM', {
      isAuthenticated,
      buzzMapPrice,
      radiusKm,
      segment,
      dailyBuzzMapCounter,
      mapCenter,
      timestamp: new Date().toISOString()
    });

    if (!isAuthenticated) {
      toast.error('Devi essere loggato per usare BUZZ MAPPA!');
      return;
    }

    if (isProcessing || loading) {
      return;
    }

    // Anti-fraud checks
    if (dailyBuzzMapCounter >= 3) {
      toast.error('Limite giornaliero raggiunto', {
        description: 'Massimo 3 BUZZ MAPPA al giorno per sicurezza.'
      });
      return;
    }

    // © 2025 Joseph MULÉ – M1SSION™ – Skip cooldown check if override active
    if (!isEligibleForBuzz && !buzzOverride.cooldown_disabled) {
      toast.error('Attendi prima del prossimo BUZZ', {
        description: 'Devi attendere almeno 3 ore tra i BUZZ per sicurezza.'
      });
      return;
    }

    // Validate the request server-side with enhanced post-reset debugging
    console.log('🔍 BUZZ VALIDATION START', {
      buzzMapPrice,
      radiusKm,
      segment,
      dailyBuzzMapCounter,
      user: user?.id
    });
    
    const isValid = await validateBuzzRequest(buzzMapPrice, radiusKm);
    console.log('🔍 BUZZ VALIDATION RESULT', { isValid });
    
    if (!isValid) {
      console.warn('🚫 BUZZ VALIDATION FAILED', {
        price: buzzMapPrice,
        radius: radiusKm,
        expectedEntry: { price: 4.99, radius: 500 },
        postResetCheck: true
      });
      toast.error('Richiesta non valida', {
        description: 'Tentativo di bypass rilevato. Operazione bloccata.'
      });
      return;
    }
    
    console.log('✅ BUZZ VALIDATION PASSED - Proceeding with payment');

    // Show warning modal for high-cost operations
    if (needsCostWarning()) {
      setShowWarningModal(true);
      return;
    }

    // Proceed with payment
    await processBuzzMapPayment();
  };

  const handleWarningConfirm = async () => {
    setShowWarningModal(false);
    await processBuzzMapPayment();
  };

  const handleWarningCancel = () => {
    setShowWarningModal(false);
  };

  const processBuzzMapPayment = async () => {
    // © 2025 Joseph MULÉ – M1SSION™ – Check for FREE BUZZ first
    if (buzzOverride.free_remaining > 0) {
      console.info('[FREE-OVERRIDE] Attempting FREE BUZZ map');
      
      // 🧠 SAVE MAP STATE BEFORE FREE BUZZ
      if ((window as any).leafletMap) {
        const map = (window as any).leafletMap;
        const center = map.getCenter();
        const zoom = map.getZoom();
        
        localStorage.setItem("map_state_before_buzz", JSON.stringify({
          center: { lat: center.lat, lng: center.lng },
          zoom: zoom
        }));
        
        console.log('💾 Map state saved before FREE BUZZ:', { center, zoom });
      }

      setIsProcessing(true);

      try {
        // Decrement counter locally for wikus77@hotmail.it
        const next = Math.max(0, buzzOverride.free_remaining - 1);
        localStorage.setItem('freeBuzzRemaining', String(next));
        setBuzzOverride(prev => ({ ...prev, free_remaining: next }));

        // FREE BUZZ successful - increment generation without validation/payment
        const incrementSuccess = await incrementGeneration();
        if (!incrementSuccess) {
          // Rollback the local counter on failure
          localStorage.setItem('freeBuzzRemaining', String(buzzOverride.free_remaining));
          setBuzzOverride(prev => ({ ...prev, free_remaining: buzzOverride.free_remaining }));
          toast.error('Errore validazione BUZZ', {
            description: 'Impossibile procedere con il BUZZ. Riprova.'
          });
          setIsProcessing(false);
          return;
        }

        // Directly call success handler without payment
        console.info('[FREE-OVERRIDE] FREE BUZZ successful, bypassing payment. Remaining:', next);
        await handleBuzzMapPaymentSuccess('free_buzz_override');
        return;
        
      } catch (error) {
        console.error('[FREE-OVERRIDE] Error during FREE BUZZ:', error);
        toast.error('Errore durante FREE BUZZ');
        setIsProcessing(false);
        return;
      }
    }

    // Regular payment flow for non-FREE BUZZ - use separate function to avoid confusion
    await processBuzzMapPaymentStripe();
  };

  const processBuzzMapPaymentStripe = async () => {
    // 🧠 SAVE MAP STATE BEFORE PAYMENT (CRITICAL FOR RESTORATION)
    if ((window as any).leafletMap) {
      const map = (window as any).leafletMap;
      const center = map.getCenter();
      const zoom = map.getZoom();
      
      localStorage.setItem("map_state_before_buzz", JSON.stringify({
        center: { lat: center.lat, lng: center.lng },
        zoom: zoom
      }));
      
      console.log('💾 Map state saved before BUZZ payment:', { center, zoom });
    }

    setIsProcessing(true);

    try {
      // Increment generation counter with validation
      const incrementSuccess = await incrementGeneration();
      if (!incrementSuccess) {
        toast.error('Errore validazione BUZZ', {
          description: 'Impossibile procedere con il BUZZ. Riprova.'
        });
        setIsProcessing(false);
        return;
      }

      // 🔥 NEW STRIPE IN-APP SYSTEM: Use the same system as BUZZ normal and subscriptions
      console.log('🔥 M1SSION™ STRIPE IN-APP: Initiating BUZZ MAPPA payment', { 
        buzzMapPrice, 
        radiusKm,
        timestamp: new Date().toISOString()
      });

      // Convert price to cents for Stripe (same as BUZZ normal)
      const priceInCents = Math.round(buzzMapPrice * 100);
      
      console.log('💳 M1SSION™ BUZZ MAPPA: Opening in-app checkout', { 
        priceInCents, 
        buzzMapPrice,
        userId: user?.id 
      });
      
      // Open in-app checkout modal for BUZZ MAP
      await processBuzzPayment(priceInCents, true); // true = is BUZZ MAP
      
    } catch (error) {
      console.error('❌ BUZZ Map Progressive error:', error);
      toast.error('Errore durante l\'apertura del checkout Stripe');
      setIsProcessing(false);
    }
  };

  const handleBuzzMapPaymentSuccess = async (paymentIntentId: string) => {
    console.log('✅ M1SSION™ BUZZ MAPPA: Payment completed, processing area creation', { paymentIntentId });
    
    try {
      // First handle payment success via hook
      await handlePaymentSuccess(paymentIntentId);
      
      // Then handle BUZZ MAP specific logic
      console.log('📅 Scheduling BUZZ MAPPA™ cooldown notification...');
      await scheduleBuzzMappaNotification();
      
      // 🎯 UNIFIED TOAST: Single toast with DB values - NO CITY NAME REVEALED
      toast.success(`✅ BUZZ MAPPA creata!`, {
        description: "Una nuova zona è stata creata sulla mappa. Inizia a indagare!"
      });

      // Trigger area generation callback - this will be handled by the payment success function
      onBuzzPress();
      
    } catch (error) {
      console.error('❌ M1SSION™ BUZZ MAPPA: Error in post-payment processing', error);
      toast.error('Errore nella finalizzazione BUZZ MAPPA');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSegmentColor = () => {
    switch (segment) {
      case "ELITE":
        return 'linear-gradient(135deg, #7B2EFF 0%, #FF006E 50%, #FFD700 100%)';
      case "High-Spender":
        return 'linear-gradient(135deg, #FF006E 0%, #FF4500 50%, #FFD700 100%)';
      case "Mid High-Spender":
        return 'linear-gradient(135deg, #FF4500 0%, #FF8C00 50%, #00D1FF 100%)';
      case "TRANSIZIONE":
        return 'linear-gradient(135deg, #00D1FF 0%, #0099CC 50%, #FF4500 100%)';
      default:
        return 'linear-gradient(135deg, #00D1FF 0%, #0099CC 50%, #7B2EFF 100%)';
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `€${(price / 1000).toFixed(1)}k`;
    }
    return `€${price.toFixed(price >= 100 ? 0 : 2)}`;
  };

  return (
    <>
      <BuzzCostWarningModal
        isOpen={showWarningModal}
        onConfirm={handleWarningConfirm}
        onCancel={handleWarningCancel}
        price={buzzMapPrice}
        radius={radiusKm}
        segment={segment}
        isEliteMaxPrice={isEliteMaxPrice()}
      />
      
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          onClick={handleBuzzMapPress}
          disabled={!isAuthenticated || isProcessing || loading || (!isEligibleForBuzz && !buzzOverride.cooldown_disabled) || dailyBuzzMapCounter >= 3}
          className="h-16 px-6 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: getSegmentColor(),
            boxShadow: segment === "ELITE" ? '0 0 30px rgba(123, 46, 255, 0.7)' : '0 0 20px rgba(0, 209, 255, 0.5)',
          }}
        >
          <div className="flex flex-col items-center relative">
            {/* © 2025 Joseph MULÉ – M1SSION™ – Free Badge for Override */}
            {buzzOverride.free_remaining > 0 && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                FREE {buzzOverride.free_remaining}
              </div>
            )}
            <span className="text-sm text-white font-bold">
              {buzzOverride.free_remaining > 0 ? 'FREE' : formatPrice(buzzMapPrice)}
            </span>
            <span className="text-xs text-white/80">BUZZ MAPPA · {radiusKm}km</span>
            {segment !== "Entry" && (
              <span className="text-xs text-white/60 font-medium">{segment}</span>
            )}
          </div>
        </Button>
        
        {((!isEligibleForBuzz && !buzzOverride.cooldown_disabled) || dailyBuzzMapCounter >= 3) && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-red-400 whitespace-nowrap">
            {dailyBuzzMapCounter >= 3 ? 'Limite giornaliero raggiunto' : 'Attendere 3h dal precedente'}
          </div>
        )}
      </div>

      {/* Universal Stripe In-App Checkout - © 2025 Joseph MULÉ – M1SSION™ */}
      {showCheckout && paymentConfig && (
        <StripeInAppCheckout
          config={paymentConfig}
          onSuccess={handleBuzzMapPaymentSuccess}
          onCancel={closeCheckout}
        />
      )}
    </>
  );
};

export default BuzzMapButton;
