// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Action Button with M1U Payment System
// PRIORITÀ BUZZ: 1) tierFreeBuzz (settimanali per tier) → 2) buzz_grants (premi) → 3) pricing M1U
import React, { useEffect, useRef, useCallback } from 'react';
import { pausePageAudio, resumePageAudio } from '@/utils/audioController';

// 🔊 Audio path for BUZZ button sound - UNICO SUONO AUTORIZZATO
const BUZZ_BUTTON_SOUND = '/assets/audio/BUZZMAP.mp3';

// --- BUZZ TOAST GLOBAL LOCK (shared) ---
const __buzz = (globalThis as any).__buzzToastLock ?? { shown: false, t: 0 };
(globalThis as any).__buzzToastLock = __buzz;
import { useBuzzHandler } from '@/hooks/buzz/useBuzzHandler';
import { BuzzButton } from './BuzzButton';
import { ShockwaveAnimation } from './ShockwaveAnimation';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { useBuzzGrants } from '@/hooks/useBuzzGrants';
import { useTierFreeBuzz } from '@/hooks/useTierFreeBuzz'; // 🆕 BUZZ gratuiti settimanali per tier
import { useCashbackWallet } from '@/hooks/useCashbackWallet'; // 🆕 M1SSION Cashback Vault™
// 🔇 RIMOSSO: useSoundEffects - tutti i suoni ora gestiti manualmente con BUZZMAP.mp3
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { toast } from 'sonner';
import { showInsufficientM1UToast, showM1UDebitSuccessToast } from '@/utils/m1uHelpers';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
// 🌑 Shadow Protocol v3 - Contextual trigger
import { notifyShadowContext } from '@/stores/entityOverlayStore';
// 🎉 Progress Feedback System - Celebration events
import { emitGameEvent } from '@/gameplay/events';

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
  
  // 🔊 Audio ref for BUZZ button sound
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const playBuzzButtonSound = useCallback(() => {
    // 🔇 Pause page audio before playing button sound
    pausePageAudio();
    
    if (!audioRef.current) {
      audioRef.current = new Audio(BUZZ_BUTTON_SOUND);
      audioRef.current.volume = 0.7;
      
      // 🔊 Resume page audio when button sound ends
      audioRef.current.onended = () => {
        console.log('[BuzzButton] Sound ended, resuming page audio');
        resumePageAudio();
      };
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(err => {
      console.log('[BuzzButton] Audio play failed:', err);
      // Resume page audio if play fails
      resumePageAudio();
    });
  }, []);
  
  // 🆕 PRIORITÀ 1: BUZZ gratuiti settimanali per tier abbonamento
  const { 
    hasFreeBuzz: hasTierFreeBuzz, 
    consumeFreeBuzz: consumeTierFreeBuzz,
    freeBuzzRemaining: tierFreeBuzzRemaining,
    userTier,
    weeklyLimit: tierWeeklyLimit
  } = useTierFreeBuzz();
  
  // PRIORITÀ 2: BUZZ da premi (marker, XP, etc.)
  const { hasFreeBuzz: hasGrantFreeBuzz, consumeFreeBuzz: consumeGrantFreeBuzz, totalRemaining: grantRemaining, dailyUsed } = useBuzzGrants();
  
  // 🆕 M1SSION Cashback Vault™
  const { accrueFromBuzz } = useCashbackWallet();
  
  // 🔇 RIMOSSO: playSound - ora usa solo BUZZMAP.mp3 gestito manualmente
  const { unitsData, refetch: refetchM1U } = useM1UnitsRealtime(user?.id);
  
  // Enhanced BUZZ counter with M1U pricing
  const { 
    dailyBuzzCounter, 
    getCurrentBuzzCostM1U,
    getCurrentBuzzDisplayCostM1U,
    updateDailyBuzzCounter
  } = useBuzzCounter(user?.id);
  
  // 🔥 PRIORITÀ COMBINATA: tier gratuiti → grants → pricing
  // Se ha BUZZ gratuiti da tier O da grants → mostra "GRATIS"
  const hasAnyFreeBuzz = hasTierFreeBuzz || hasGrantFreeBuzz;
  const currentCostM1U = hasAnyFreeBuzz ? 0 : getCurrentBuzzCostM1U();
  const currentPriceDisplay = hasAnyFreeBuzz ? 'GRATIS' : getCurrentBuzzDisplayCostM1U();
  
  // Log price updates for debugging
  React.useEffect(() => {
    console.log('💰 BUZZ BUTTON PRICE UPDATE:', {
      dailyBuzzCounter,
      // 🆕 Tier Free BUZZ info
      userTier,
      hasTierFreeBuzz,
      tierFreeBuzzRemaining,
      tierWeeklyLimit,
      // Grant Free BUZZ info
      hasGrantFreeBuzz,
      grantRemaining,
      // Combined
      hasAnyFreeBuzz,
      currentCostM1U,
      currentPriceDisplay,
      timestamp: new Date().toISOString()
    });
  }, [dailyBuzzCounter, userTier, hasTierFreeBuzz, tierFreeBuzzRemaining, tierWeeklyLimit, hasGrantFreeBuzz, grantRemaining, hasAnyFreeBuzz, currentCostM1U, currentPriceDisplay]);
  
  // 🔥 FIX: Pass actual M1U cost to useBuzzHandler to avoid price check blocking
  // 🔍 OBSERVABILITY: Determine buzzType for audit logging
  const determinedBuzzType = hasTierFreeBuzz ? 'TIER_FREE' : hasGrantFreeBuzz ? 'GRANT_FREE' : 'M1U_PAID';
  
  const { buzzing, showShockwave, handleBuzz } = useBuzzHandler({
    currentPrice: currentCostM1U, // Use actual M1U cost for validation
    onSuccess,
    hasFreeBuzz: hasAnyFreeBuzz, // Combined free buzz check
    buzzType: determinedBuzzType // 🔍 OBSERVABILITY: Pass buzzType for audit
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
    // 🔊 Play BUZZ button sound on press
    playBuzzButtonSound();
    
    // 🔍 DEV-ONLY: BUZZ Flow Decision Log
    if (import.meta.env.DEV) {
      console.log('[BUZZ FLOW] 🔍 Decision State:', {
        tier: userTier,
        tierFreeBuzzRemaining,
        tierWeeklyLimit,
        hasTierFreeBuzz,
        grantFreeBuzzRemaining: grantRemaining,
        hasGrantFreeBuzz,
        m1uBalance: unitsData?.balance || 0,
        nextCostM1U: getCurrentBuzzCostM1U(),
        dailyBuzzCounter,
        decisionPath: hasTierFreeBuzz ? '1️⃣ TIER FREE' : hasGrantFreeBuzz ? '2️⃣ GRANT FREE' : '3️⃣ M1U PAYMENT'
      });
    }
    
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

    // =========================================================================
    // 🆕 PRIORITÀ 1: BUZZ gratuiti settimanali per tier abbonamento
    // =========================================================================
    if (hasTierFreeBuzz) {
      console.log('🎟️ M1SSION™ TIER FREE BUZZ: Using tier weekly allowance', { 
        tier: userTier,
        remaining: tierFreeBuzzRemaining,
        weeklyLimit: tierWeeklyLimit 
      });
      const consumed = await consumeTierFreeBuzz();
      if (consumed) {
        await handleBuzz();
        await updateDailyBuzzCounter();
        onSuccess();
        // 🔥 Evento per sincronizzare il contatore nella BuzzPage
        window.dispatchEvent(new CustomEvent('buzzCompleted'));
        // 🌑 Shadow Protocol v3 - Trigger contestuale BUZZ
        notifyShadowContext('buzz');
        // 🎉 Progress Feedback - BUZZ Success event
        emitGameEvent('BUZZ_SUCCESS', { source: 'TIER_FREE', tier: userTier });
        
        // 🔍 DEV-ONLY: BUZZ Flow Result Log (Tier Free)
        if (import.meta.env.DEV) {
          console.log('[BUZZ FLOW] ✅ Result:', {
            tier: userTier,
            wasPaid: false,
            source: 'TIER_FREE',
            tierFreeBuzzRemaining: tierFreeBuzzRemaining - 1,
            tierWeeklyLimit,
            grantFreeBuzzRemaining: grantRemaining,
            m1uBalance: unitsData?.balance || 0
          });
        }
        
        if (!__buzz.shown) {
          toast.success(`BUZZ gratuito! (${tierFreeBuzzRemaining - 1}/${tierWeeklyLimit} rimasti)`);
        }
        return;
      }
      // Se fallisce, continua con grants o pricing
    }

    // =========================================================================
    // PRIORITÀ 2: BUZZ da premi (marker, XP, etc.)
    // =========================================================================
    if (hasGrantFreeBuzz) {
      console.log('🎁 M1SSION™ GRANT FREE BUZZ: Using reward grant', { remaining: grantRemaining });
      const consumed = await consumeGrantFreeBuzz();
      if (consumed) {
        await handleBuzz();
        await updateDailyBuzzCounter();
        onSuccess();
        // 🔥 Evento per sincronizzare il contatore nella BuzzPage
        window.dispatchEvent(new CustomEvent('buzzCompleted'));
        // 🌑 Shadow Protocol v3 - Trigger contestuale BUZZ
        notifyShadowContext('buzz');
        // 🎉 Progress Feedback - BUZZ Success event
        emitGameEvent('BUZZ_SUCCESS', { source: 'GRANT_FREE', tier: userTier });
        
        // 🔍 DEV-ONLY: BUZZ Flow Result Log (Grant Free)
        if (import.meta.env.DEV) {
          console.log('[BUZZ FLOW] ✅ Result:', {
            tier: userTier,
            wasPaid: false,
            source: 'GRANT_FREE',
            tierFreeBuzzRemaining,
            grantFreeBuzzRemaining: grantRemaining - 1,
            m1uBalance: unitsData?.balance || 0
          });
        }
        
        if (!__buzz.shown) {
          toast.success('BUZZ gratuito (premio) utilizzato!');
        }
        return;
      } else {
        console.error('🔴 M1SSION™ GRANT FREE BUZZ: Failed to consume grant');
        toast.error('Errore nell\'uso del BUZZ gratuito');
        return;
      }
    }

    // =========================================================================
    // PRIORITÀ 3: Pricing progressivo M1U
    // =========================================================================
    
    // 🔥 FIX: Force refetch M1U balance before payment to avoid stale data
    console.log('🔄 M1SSION™ M1U BUZZ: Refetching M1U balance...');
    await refetchM1U();
    
    // Re-read the balance after refetch
    const costM1U = getCurrentBuzzCostM1U();
    // Get fresh balance from refetched data
    const { data: freshProfile } = await supabase
      .from('profiles')
      .select('m1_units')
      .eq('id', user.id)
      .single();
    
    const currentBalance = freshProfile?.m1_units ?? unitsData?.balance ?? 0;
    
    console.log('💎 M1SSION™ M1U BUZZ: Initiating M1U payment', { 
      dailyCount: dailyBuzzCounter,
      nextClick: dailyBuzzCounter + 1,
      costM1U,
      currentBalance,
      freshBalance: freshProfile?.m1_units,
      cachedBalance: unitsData?.balance,
      userId: user.id,
      hasTierFreeBuzz,
      hasGrantFreeBuzz,
      timestamp: new Date().toISOString()
    });

    // Check M1U balance
    if (currentBalance < costM1U) {
      console.warn('❌ M1SSION™ M1U BUZZ: Insufficient M1U balance', {
        required: costM1U,
        available: currentBalance
      });
      showInsufficientM1UToast(costM1U, currentBalance);
      // 🎉 Progress Feedback - Insufficient M1U event
      emitGameEvent('BUZZ_INSUFFICIENT_M1U', { required: costM1U, available: currentBalance });
      return;
    }

    try {
      console.log('💳 M1SSION™ M1U BUZZ: Updating profiles.m1_units...', { costM1U, currentBalance });
      
      // Update profiles.m1_units directly
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          m1_units: currentBalance - costM1U,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select('m1_units')
        .single();

      console.log('💳 M1SSION™ M1U BUZZ: Update response', { updatedProfile, updateError });

      if (updateError) {
        console.error('❌ M1SSION™ M1U BUZZ: Update error', updateError);
        toast.error('Errore nel processare il pagamento M1U');
        return;
      }

      if (!updatedProfile) {
        console.error('❌ M1SSION™ M1U BUZZ: No profile returned after update');
        toast.error('Errore nel processare il pagamento M1U');
        return;
      }

      // M1U spent successfully
      const newBalance = updatedProfile.m1_units;
      console.log('✅ M1SSION™ M1U BUZZ: M1U debited successfully!', {
        spent: costM1U,
        oldBalance: currentBalance,
        newBalance: newBalance,
        timestamp: new Date().toISOString()
      });

      // 🔇 MUTED: Toast M1U debit - solo indizio visibile per ora
      // showM1UDebitSuccessToast(costM1U, newBalance);
      
      // ✅ FLUSSO COMPLETO RIPARATO
      await handleBuzz();
      
      const newCount = await updateDailyBuzzCounter();
      console.log('📊 Daily counter updated:', newCount);
      
      await refetchM1U();
      
      onSuccess();
      
      // ✅ Evento per animazione slot machine nel pill M1U
      window.dispatchEvent(new CustomEvent('buzzClueCreated', {
        detail: { costM1U, newBalance: updatedProfile.m1_units }
      }));
      
      // 🔥 Evento per sincronizzare il contatore nella BuzzPage
      window.dispatchEvent(new CustomEvent('buzzCompleted'));
      // 🌑 Shadow Protocol v3 - Trigger contestuale BUZZ
      notifyShadowContext('buzz');
      // 🎉 Progress Feedback - BUZZ Success event
      emitGameEvent('BUZZ_SUCCESS', { source: 'M1U_PAID', costM1U, tier: userTier });
      
      // 🆕 M1SSION Cashback Vault™ - Accumula cashback (1 M1U = €0.10)
      const costEur = costM1U / 10;
      await accrueFromBuzz({ costEur, tier: userTier });
      // 🎉 Progress Feedback - Cashback accrued event
      emitGameEvent('CASHBACK_ACCRUED', { amount: costEur });
      
      // 🔍 DEV-ONLY: BUZZ Flow Result Log
      if (import.meta.env.DEV) {
        console.log('[BUZZ FLOW] ✅ Result:', {
          tier: userTier,
          wasPaid: true,
          m1uBalanceBefore: currentBalance,
          m1uBalanceAfter: newBalance,
          costM1U,
          tierFreeBuzzRemaining,
          grantFreeBuzzRemaining: grantRemaining
        });
      }
      
      console.log('🎉 M1SSION™ BUZZ: Complete!');

    } catch (error: any) {
      console.error('❌ M1SSION™ M1U BUZZ: Exception during payment', error);
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
