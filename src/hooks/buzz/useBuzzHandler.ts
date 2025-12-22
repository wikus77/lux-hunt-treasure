// @ts-nocheck

// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Handler Hook - RESET COMPLETO 17/07/2025
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useBuzzApi } from '@/hooks/buzz/useBuzzApi';
import { usePWAHardwareStub } from '@/hooks/usePWAHardwareStub';
import { useAbuseProtection } from './useAbuseProtection';
import { useBuzzNotificationScheduler } from '@/hooks/useBuzzNotificationScheduler';
import { HapticType } from '@/utils/haptics';
import { usePulseContribute } from '@/features/pulse';

// --- BUZZ TOAST GLOBAL LOCK (shared) ---
const __buzz = (globalThis as any).__buzzToastLock ?? { shown: false, t: 0 };
(globalThis as any).__buzzToastLock = __buzz;

function buzzToastOnce(fn: 'success'|'error', msg: string, opts?: any) {
  const now = Date.now();
  // 2s di finestra anti-rimbalzo
  if (!__buzz.shown || now - __buzz.t > 2000) {
    __buzz.shown = true; __buzz.t = now;
    (toast as any)[fn]?.(msg, opts);
    setTimeout(() => { __buzz.shown = false; }, 2000);
  }
}

interface UseBuzzHandlerProps {
  currentPrice: number;
  onSuccess: () => void;
  hasFreeBuzz?: boolean; // 🔥 ADDED: Flag to indicate if user has free buzz
  context?: { source?: string; skipServerBuzzPress?: boolean }; // 🔥 ADDED: Context to avoid post-payment toast duplication
  // 🔍 OBSERVABILITY: Audit metadata for FREE/PAID tracking
  buzzType?: 'TIER_FREE' | 'GRANT_FREE' | 'M1U_PAID';
}

// 🔥 FIX: Use refs to always get latest values at call time
export function useBuzzHandler({ currentPrice, onSuccess, hasFreeBuzz = false, context, buzzType }: UseBuzzHandlerProps) {
  // Store props in refs so handleBuzz always uses latest values
  const propsRef = useRef({ currentPrice, hasFreeBuzz, buzzType });
  propsRef.current = { currentPrice, hasFreeBuzz, buzzType };
  const [buzzing, setBuzzing] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const { user } = useAuth();
  const { vibrate, triggerHaptic } = usePWAHardwareStub();
  const { checkAbuseAndLog } = useAbuseProtection();
  const { scheduleBuzzAvailableNotification } = useBuzzNotificationScheduler();
  
  // 🔥 FIX: useBuzzApi MUST be called at top level (React Hooks Rule)
  const { callBuzzApi } = useBuzzApi();
  
  // 🔋 PULSE: Hook per contribuzione energia collettiva
  const { contribute: contributeToPulse } = usePulseContribute();

  const handleBuzz = async () => {
    // 🔥 FIX: Use refs to get LATEST values at call time (not stale closure values)
    const { currentPrice: latestPrice, hasFreeBuzz: latestHasFreeBuzz, buzzType: latestBuzzType } = propsRef.current;
    
    console.log('🚀 BUZZ PRESSED - Start handleBuzz - RESET COMPLETO 17/07/2025', { 
      user: !!user, 
      currentPrice: latestPrice,
      hasFreeBuzz: latestHasFreeBuzz,
      buzzType: latestBuzzType,
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
    
    // 🔥 Toast deduplication flags
    let hadError = false;
    let buzzToastShown = false;
    
    try {
      setBuzzing(true);
      setShowShockwave(true);
      await triggerHaptic('buzzUnlocked');
      
      console.log('💰 BUZZ PRICE CHECK - FIXED', { currentPrice: latestPrice, hasFreeBuzz: latestHasFreeBuzz });
      
      // Progressive pricing - no blocking, price increases with usage
      console.log('💰 PROGRESSIVE PRICING: Current price M1U' + latestPrice + ' for usage level');
      
      // 🔥 FIX: After M1U payment is already processed in BuzzActionButton, 
      // we should NOT block here. The payment validation happened before this function.
      // Only check for invalid/negative prices as a safety net.
      if (!latestHasFreeBuzz && (latestPrice < 0 || isNaN(latestPrice))) {
        console.error('❌ BUZZ: Invalid price detected', { currentPrice: latestPrice, hasFreeBuzz: latestHasFreeBuzz });
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
      
      const buzzResult = await callBuzzApi({
        userId: user.id,
        generateMap: false, // Regular BUZZ, not map
        coordinates: null,
        prizeId: null,
        sessionId: `buzz_${Date.now()}`,
        // 🔍 OBSERVABILITY: Pass audit metadata for FREE/PAID tracking (use LATEST values)
        buzzType: latestBuzzType || (latestHasFreeBuzz ? 'TIER_FREE' : 'M1U_PAID'),
        m1uCost: latestHasFreeBuzz ? 0 : latestPrice
      });
      
      console.log('✅ BUZZ API CALL COMPLETED');
      console.log('🚨 POST-BUZZ API CALL:', {
        success: buzzResult?.success,
        error: buzzResult?.error,
        errorMessage: buzzResult?.errorMessage,
        hasClueText: !!buzzResult?.clue_text,
        clueTextPreview: buzzResult?.clue_text?.substring(0, 50)
      });
      
      // 🔥 FIX: Check for undefined result (network/CORS failure)
      if (!buzzResult) {
        hadError = true;
        console.error('❌ BUZZ API: No response received (network/CORS error)');
        toast.dismiss();
        toast.error('Errore di connessione. Verifica la tua connessione e riprova.');
        return;
      }
      
      // 🔥 FIX: Only show error toast if clue generation truly failed AND no clue_text
      if (buzzResult.error && !buzzResult.clue_text) {
        hadError = true;
        console.error('❌ BUZZ API Error:', buzzResult.errorMessage);
        toast.dismiss();
        toast.error(buzzResult.errorMessage || 'Errore di rete. Riprova.');
        return;
      }
      
      if (!buzzResult.success && !buzzResult.clue_text) {
        hadError = true;
        console.error('❌ BUZZ FAILED - API returned success:false without clue');
        toast.dismiss();
        toast.error(buzzResult.errorMessage || 'Errore durante BUZZ');
        return;
      }
      
      // ✅ SUCCESS: Clue received (even if there were secondary errors)
      if (buzzResult.clue_text) {
        console.log('✅ BUZZ SUCCESS - Clue received:', buzzResult.clue_text.substring(0, 50) + '...');
        
        // Show clue to user - ROSA/CYAN style
        buzzToastOnce('success', buzzResult.clue_text, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: 'linear-gradient(135deg, #F213A4 0%, #FF4D4D 100%)',
            color: 'white',
            fontWeight: 'bold',
            zIndex: 9999
          }
        });
        buzzToastShown = true;
        
        // 🔥 FIX: NON usare setTimeout qui - causa reload!
        // Lo shockwave si resetterà naturalmente quando buzzing diventa false
        buzzToastShown = true;
        
        // 🔋 PULSE: Contribuisci energia collettiva (async, non bloccante)
        contributeToPulse('BUZZ_COMPLETED', { price: latestPrice }).catch(err => {
          console.warn('[PULSE] Contribution failed (non-blocking):', err);
        });
        
      } else {
        // No clue text received - this is a real error
        hadError = true;
        console.error('❌ BUZZ FAILED - No clue_text in response');
        toast.dismiss();
        toast.error('Non sono riuscito a generare l\'indizio, riprova fra poco.');
        return;
      }
      
      // 🔍 TEST: TUTTO DISABILITATO - solo toast
      console.log('🛑 DB insert e onSuccess DISABILITATI');
      
      // Database insert DISABILITATO
      // await supabase.from('buzz_map_actions').insert({...});
      
      // onSuccess DISABILITATO
      // onSuccess();
      
    } catch (err) {
      console.error('❌ Error in handleBuzz - RESET COMPLETO 17/07/2025:', err);
      // Don't show error toast yet - will check for clue notification first
      hadError = true;
    } finally {
      setBuzzing(false);
      
      // 🔥 REMOVED: No duplicate toast from finally block - main flow already handles it
      // Only show error if no toast was shown yet
      if (hadError && !buzzToastShown) {
        await triggerHaptic('error');
        buzzToastOnce('error', "Non sono riuscito a generare l'indizio, riprova fra poco.");
      }
    }
  };

  return {
    buzzing,
    showShockwave,
    handleBuzz
  };
}
