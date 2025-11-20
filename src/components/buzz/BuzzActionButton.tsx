// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Action Button with M1U Payment System
import React, { useEffect, useRef } from 'react';

// --- BUZZ TOAST GLOBAL LOCK (shared) ---
const __buzz = (globalThis as any).__buzzToastLock ?? { shown: false, t: 0 };
(globalThis as any).__buzzToastLock = __buzz;
import { useBuzzHandler } from '@/hooks/buzz/useBuzzHandler';
import { BuzzButton } from './BuzzButton';
import { ShockwaveAnimation } from './ShockwaveAnimation';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { useBuzzGrants } from '@/hooks/useBuzzGrants';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { toast } from 'sonner';
import { showInsufficientM1UToast, showM1UDebitSuccessToast } from '@/utils/m1uHelpers';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

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
  const { hasFreeBuzz, consumeFreeBuzz, totalRemaining, dailyUsed } = useBuzzGrants();
  const { playSound } = useSoundEffects();
  const { unitsData } = useM1UnitsRealtime(user?.id);
  
  // Enhanced BUZZ counter with M1U pricing
  const { 
    dailyBuzzCounter, 
    getCurrentBuzzCostM1U,
    getCurrentBuzzDisplayCostM1U,
    updateDailyBuzzCounter
  } = useBuzzCounter(user?.id);
  
  // M1U pricing calculation (free if grants available)
  const currentCostM1U = hasFreeBuzz ? 0 : getCurrentBuzzCostM1U();
  const currentPriceDisplay = hasFreeBuzz ? 'GRATIS' : getCurrentBuzzDisplayCostM1U();
  
  // 🔥 FIX: Pass actual M1U cost to useBuzzHandler to avoid price check blocking
  const { buzzing, showShockwave, handleBuzz } = useBuzzHandler({
    currentPrice: currentCostM1U, // Use actual M1U cost for validation
    onSuccess,
    hasFreeBuzz
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
        p_credit_type: 'buzz',
        p_amount: 1
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
    // © 2025 Joseph MULÉ – M1SSION™ – Play spacecraft ignition sound on BUZZ click
    playSound('spacecraftIgnition', 0.6);
    
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

    // Paid BUZZ with M1U system
    const costM1U = getCurrentBuzzCostM1U();
    const currentBalance = unitsData?.balance || 0;
    
    console.log('💎 M1SSION™ M1U BUZZ: Initiating M1U payment', { 
      dailyCount: dailyBuzzCounter,
      nextClick: dailyBuzzCounter + 1,
      costM1U,
      currentBalance,
      userId: user.id,
      timestamp: new Date().toISOString()
    });

    // Check M1U balance
    if (currentBalance < costM1U) {
      console.warn('❌ M1SSION™ M1U BUZZ: Insufficient M1U balance', {
        required: costM1U,
        available: currentBalance
      });
      showInsufficientM1UToast(costM1U, currentBalance);
      return;
    }

    try {
      // Call RPC to spend M1U
      const { data: spendResult, error: spendError } = await (supabase as any).rpc('buzz_spend_m1u', {
        p_cost_m1u: costM1U
      });

      if (spendError) {
        console.error('❌ M1SSION™ M1U BUZZ: RPC error', spendError);
        toast.error('Errore nel processare il pagamento M1U');
        return;
      }

      if (!(spendResult as any)?.success) {
        const errorType = (spendResult as any)?.error || 'unknown';
        console.error('❌ M1SSION™ M1U BUZZ: Payment failed', { error: errorType });
        
        if (errorType === 'insufficient_m1u') {
          showInsufficientM1UToast(costM1U, (spendResult as any).current_balance || 0);
        } else {
          toast.error(`Errore: ${errorType}`);
        }
        return;
      }

      // M1U spent successfully
      console.log('✅ M1SSION™ M1U BUZZ: M1U spent successfully', {
        spent: (spendResult as any).spent,
        newBalance: (spendResult as any).new_balance
      });

      showM1UDebitSuccessToast((spendResult as any).spent, (spendResult as any).new_balance);

      // Execute BUZZ action
      await updateDailyBuzzCounter();
      await handleBuzz();
      onSuccess();

    } catch (error: any) {
      console.error('❌ M1SSION™ M1U BUZZ: Exception', error);
      toast.error('Errore durante il BUZZ. Riprova.');
    }
  };

  return (
    <div className="relative flex flex-col items-center space-y-6">
      <BuzzButton
        currentPrice={currentCostM1U}
        isBlocked={isBlocked}
        buzzing={buzzing}
        onClick={handleAction}
      />
      
      <ShockwaveAnimation show={showShockwave} />
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
