// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Action Button with Progressive Pricing & Universal Stripe In-App Payment
import React, { useEffect, useRef } from 'react';
import { useBuzzHandler } from '@/hooks/buzz/useBuzzHandler';
import { BuzzButton } from './BuzzButton';
import { ShockwaveAnimation } from './ShockwaveAnimation';
import { useStripeInAppPayment } from '@/hooks/useStripeInAppPayment';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { useBuzzGrants } from '@/hooks/useBuzzGrants';
import { toast } from 'sonner';
import StripeInAppCheckout from '@/components/subscription/StripeInAppCheckout';
import { validateBuzzPrice } from '@/lib/constants/buzzPricing';
import { supabase } from '@/integrations/supabase/client'; // © 2025 Joseph MULÉ – M1SSION™
import { v4 as uuidv4 } from 'uuid'; // © 2025 Joseph MULÉ – M1SSION™

interface BuzzActionButtonProps {
  isBlocked: boolean;
  onSuccess: () => void;
}

export const BuzzActionButton: React.FC<BuzzActionButtonProps> = ({
  isBlocked,
  onSuccess
}) => {
  const { user } = useUnifiedAuth();
  const { hasFreeBuzz, consumeFreeBuzz, totalRemaining } = useBuzzGrants();
  
  // Enhanced BUZZ counter with progressive pricing
  const { 
    dailyBuzzCounter, 
    getCurrentBuzzPriceCents,
    getCurrentBuzzDisplayPrice,
    updateDailyBuzzCounter
  } = useBuzzCounter(user?.id);
  
  // Progressive pricing calculation (free if grants available)
  const currentPriceCents = hasFreeBuzz ? 0 : getCurrentBuzzPriceCents();
  const currentPriceEur = currentPriceCents / 100;
  const currentPriceDisplay = hasFreeBuzz ? 'GRATIS' : getCurrentBuzzDisplayPrice();
  
  const { 
    processBuzzPayment, 
    showCheckout, 
    paymentConfig, 
    closeCheckout, 
    handlePaymentSuccess 
  } = useStripeInAppPayment();
  
  const { buzzing, showShockwave, handleBuzz } = useBuzzHandler({
    currentPrice: currentPriceEur,
    onSuccess
  });

  // © 2025 Joseph MULÉ – M1SSION™ – Progressive BUZZ Pricing Handler
  // Free reward auto-consumption flow (query: free=1&reward=1)
  const processedFree = useRef(false);

  const removeFreeQueryParams = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('free');
      url.searchParams.delete('reward');
      window.history.replaceState({}, '', url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''));
    } catch {}
  };

  const redeemFreeBuzz = async () => {
    if (!user) {
      toast.error('Devi essere loggato per usare il BUZZ gratuito');
      return;
    }
    try {
      // 1) Consume a free buzz credit via RPC
      const { data: consumed, error: consumeErr } = await supabase.rpc('consume_credit', {
        p_user_id: user.id,
        p_credit_type: 'buzz'
      });
      if (consumeErr || !consumed) {
        console.error('consume_credit error', consumeErr);
        toast.error('Nessun credito BUZZ disponibile');
        return;
      }

      // 2) Notify backend pipeline like a successful payment (free branch)
      const freeIntentId = `FREE_${uuidv4()}`;
      const { data: hbps, error: hbpsErr } = await supabase.functions.invoke('handle-buzz-payment-success', {
        body: {
          payment_intent_id: freeIntentId,
          user_id: user.id,
          amount: 0,
          is_buzz_map: false,
          metadata: { free: true, source: 'qr_reward_or_xp_reward' }
        }
      });
      if (hbpsErr) {
        console.warn('handle-buzz-payment-success warning', hbpsErr);
      }

      // 3) Run the usual BUZZ success flow (generate clue, UI, counters)
      await updateDailyBuzzCounter();
      await handleBuzz();
      onSuccess();
      toast.success('BUZZ gratuito utilizzato!');
    } catch (e) {
      console.error('redeemFreeBuzz exception', e);
      toast.error('Errore durante il riscatto gratuito');
    } finally {
      removeFreeQueryParams();
    }
  };

  useEffect(() => {
    if (processedFree.current) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const isFree = params.get('free') === '1';
      if (isFree) {
        processedFree.current = true;
        redeemFreeBuzz();
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAction = async () => {
    if (!user) {
      toast.error('Devi essere loggato per utilizzare BUZZ!');
      return;
    }

    // Check if free buzz is available first
    if (hasFreeBuzz) {
      console.log('🎁 M1SSION™ FREE BUZZ: Using free grant', { remaining: totalRemaining });
      const consumed = await consumeFreeBuzz();
      if (consumed) {
        // Execute buzz action directly without payment
        await updateDailyBuzzCounter();
        await handleBuzz();
        onSuccess();
        toast.success('BUZZ gratuito utilizzato!');
        return;
      } else {
        console.error('🔴 M1SSION™ FREE BUZZ: Failed to consume grant');
        toast.error('Errore nell\'uso del BUZZ gratuito');
        return;
      }
    }

    // Fallback to paid buzz with progressive pricing
    console.log('🔥 M1SSION™ PROGRESSIVE BUZZ: Initiating payment', { 
      dailyCount: dailyBuzzCounter,
      nextClick: dailyBuzzCounter + 1,
      priceCents: currentPriceCents,
      priceEur: currentPriceEur,
      timestamp: new Date().toISOString()
    });

    // Validate pricing integrity
    if (!validateBuzzPrice(dailyBuzzCounter, currentPriceCents)) {
      console.error('❌ BUZZ PRICING VALIDATION FAILED');
      toast.error('Errore nel calcolo del prezzo. Riprova.');
      return;
    }
    
    console.log('💳 M1SSION™ PROGRESSIVE BUZZ: Opening in-app checkout', { 
      priceCents: currentPriceCents, 
      priceEur: currentPriceEur,
      dailyCount: dailyBuzzCounter,
      userId: user.id 
    });
    
    // Open in-app checkout modal with validated progressive pricing
    await processBuzzPayment(currentPriceCents, false);
  };

  const handlePaymentComplete = async (paymentIntentId: string) => {
    console.log('✅ M1SSION™ PROGRESSIVE BUZZ: Payment completed', { 
      paymentIntentId,
      dailyCount: dailyBuzzCounter,
      pricePaid: currentPriceEur
    });
    
    try {
      // First handle payment success via hook
      await handlePaymentSuccess(paymentIntentId);
      
      // Update BUZZ counter after successful payment
      await updateDailyBuzzCounter();
      
      // Then execute the BUZZ logic
      await handleBuzz();
      
      // Finally call parent success callback
      onSuccess();
    } catch (error) {
      console.error('❌ M1SSION™ PROGRESSIVE BUZZ: Error in post-payment processing', error);
      toast.error('Errore nella finalizzazione BUZZ');
    }
  };

  return (
    <div className="relative flex flex-col items-center space-y-6">
      <BuzzButton
        currentPrice={currentPriceEur}
        isBlocked={isBlocked}
        buzzing={buzzing}
        onClick={handleAction}
        freeAvailable={hasFreeBuzz}
        freeCount={totalRemaining}
      />
      
      <ShockwaveAnimation show={showShockwave} />
      
      {/* Universal Stripe In-App Checkout - © 2025 Joseph MULÉ – M1SSION™ */}
      {showCheckout && paymentConfig && (
        <StripeInAppCheckout
          config={paymentConfig}
          onSuccess={handlePaymentComplete}
          onCancel={closeCheckout}
        />
      )}
    </div>
  );
};