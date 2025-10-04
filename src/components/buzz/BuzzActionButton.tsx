// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Action Button with Progressive Pricing & Universal Stripe In-App Payment
import React, { useEffect, useRef } from 'react';

// --- BUZZ TOAST GLOBAL LOCK (shared) ---
const __buzz = (globalThis as any).__buzzToastLock ?? { shown: false, t: 0 };
(globalThis as any).__buzzToastLock = __buzz;
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
  isWalkthroughMode?: boolean;
}

export const BuzzActionButton: React.FC<BuzzActionButtonProps> = ({
  isBlocked,
  onSuccess,
  isWalkthroughMode = false
}) => {
  const { user } = useUnifiedAuth();
  const { hasFreeBuzz, consumeFreeBuzz, totalRemaining, dailyUsed } = useBuzzGrants(); // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
  
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
    onSuccess,
    hasFreeBuzz // 🔥 FIXED: Pass hasFreeBuzz flag to prevent price validation error
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

      // 2) Use handle-buzz-press instead for free BUZZ (no paymentIntentId needed)
      const { data: hbps, error: hbpsErr } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          user_id: user.id,
          generateMap: false,
          metadata: { free: true, source: 'qr_reward_or_xp_reward' }
        }
      });
      
      if (hbpsErr) {
        console.error('handle-buzz-press error', hbpsErr);
        toast.error('Errore durante l\'uso del BUZZ gratuito');
        return;
      }

      // 3) Show clue if received from backend, or proceed with normal flow
      if (hbps?.clue_text) {
        toast.success(hbps.clue_text, {
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
        toast.success('BUZZ gratuito utilizzato!');
      }

      // 4) Update counters and success callback
      await updateDailyBuzzCounter();
      onSuccess();
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

    // Walkthrough demo mode - bypass payment
    if (isWalkthroughMode) {
      await handleBuzz();
      onSuccess();
      return;
    }

    // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ - Check daily usage and trigger Stripe if needed
    if (dailyUsed || !hasFreeBuzz) {
      console.log('🔥 M1SSION™ PAID BUZZ REQUIRED: Free BUZZ exhausted for today');
      toast.error('Hai già utilizzato il BUZZ gratuito oggi.');
      
      // Calculate current paid BUZZ price
      const paidBuzzPriceCents = getCurrentBuzzPriceCents();
      const paidBuzzPriceEur = paidBuzzPriceCents / 100;
      
      console.log('💳 M1SSION™ TRIGGERING STRIPE: Paid BUZZ required', {
        priceCents: paidBuzzPriceCents,
        priceEur: paidBuzzPriceEur,
        dailyCount: dailyBuzzCounter,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      
      // Trigger Stripe payment flow
      await processBuzzPayment(paidBuzzPriceCents, false);
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
        if (!__buzz.shown) {
          toast.success('BUZZ gratuito utilizzato!');
        }
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

    // 🔥 FIXED: Only validate pricing for PAID buzz, skip validation for FREE buzz
    if (!hasFreeBuzz && !validateBuzzPrice(dailyBuzzCounter, currentPriceCents)) {
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
      // 🔥 FIXED: Get result from payment success to check if clue_text was displayed
      const result = await handlePaymentSuccess(paymentIntentId);
      
      // 🔥 FIXED: Skip handleBuzz() call if clue was already processed by handle-buzz-payment-success
      if (result.ok && result.skipFollowUpBuzzPress) {
        console.log('🎯 M1SSION™ BUZZ: Skipping handleBuzz() - clue already processed by payment success');
      } else {
        // Legacy fallback: call handleBuzz() only if payment success didn't handle the clue
        console.log('⚠️ M1SSION™ BUZZ: Falling back to handleBuzz() call');
        await handleBuzz(/* context: { source: 'paid' } */);
      }
      
      // Update BUZZ counter after successful payment
      await updateDailyBuzzCounter();
      
      // Finally call parent success callback
      onSuccess();
      
      console.log('✅ M1SSION™ BUZZ: Payment processing completed successfully', {
        clueTextShown: !!result.clue_text,
        skippedFollowUp: !!result.skipFollowUpBuzzPress
      });
    } catch (error) {
      console.error('❌ M1SSION™ PROGRESSIVE BUZZ: Error in post-payment processing', error);
      toast.error('Errore nella finalizzazione BUZZ');
    } finally {
      // 🔥 ALWAYS fetch and show clue toast in finally block (even on error)
      try {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from('user_notifications')
          .select('id,type,title,message,metadata,created_at')
          .eq('user_id', user!.id)
          .eq('is_deleted', false)
          .in('type', ['buzz', 'buzz_free'])
          .gte('created_at', tenMinutesAgo)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        console.info({ step: 'buzz-toast', data, error, tenMinutesAgo });
        
        if (data?.message && !__buzz.shown) {
          toast.success(data.message, {
            duration: 4000,
            position: 'top-center',
            style: { 
              zIndex: 9999,
              background: 'linear-gradient(135deg, #F213A4 0%, #FF4D4D 100%)',
              color: 'white',
              fontWeight: 'bold'
            }
          });
        } else if (!data) {
          console.info('No fresh notification in last 10 minutes');
        }
      } catch (toastError) {
        console.error('Error fetching toast notification:', toastError);
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center space-y-6">
      <BuzzButton
        currentPrice={currentPriceEur}
        isBlocked={isBlocked}
        buzzing={buzzing}
        onClick={handleAction}
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