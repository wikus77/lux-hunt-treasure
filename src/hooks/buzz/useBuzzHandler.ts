
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Handler Hook - RESET COMPLETO 17/07/2025
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useBuzzApi } from '@/hooks/buzz/useBuzzApi';
import { usePWAHardwareStub } from '@/hooks/usePWAHardwareStub';
import { useAbuseProtection } from './useAbuseProtection';
import { useBuzzNotificationScheduler } from '@/hooks/useBuzzNotificationScheduler';
import { HapticType } from '@/utils/haptics';

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
}

export function useBuzzHandler({ currentPrice, onSuccess, hasFreeBuzz = false, context }: UseBuzzHandlerProps) {
  const [buzzing, setBuzzing] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const { user } = useAuth();
  const { vibrate, triggerHaptic } = usePWAHardwareStub();
  const { checkAbuseAndLog } = useAbuseProtection();
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
    
    // 🔥 Toast deduplication flags
    let hadError = false;
    let buzzToastShown = false;
    
    try {
      setBuzzing(true);
      setShowShockwave(true);
      await triggerHaptic('buzzUnlocked');
      
      console.log('💰 BUZZ PRICE CHECK - FIXED', { currentPrice, hasFreeBuzz });
      
      // Progressive pricing - no blocking, price increases with usage
      console.log('💰 PROGRESSIVE PRICING: Current price M1U' + currentPrice + ' for usage level');
      
      // 🔥 FIX: After M1U payment is already processed in BuzzActionButton, 
      // we should NOT block here. The payment validation happened before this function.
      // Only check for invalid/negative prices as a safety net.
      if (!hasFreeBuzz && (currentPrice < 0 || isNaN(currentPrice))) {
        console.error('❌ BUZZ: Invalid price detected', { currentPrice, hasFreeBuzz });
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
        
        // Show clue to user
        buzzToastOnce('success', buzzResult.clue_text, {
          duration: 6000,
          position: 'top-center',
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '16px'
          }
        });
        buzzToastShown = true;
      } else {
        // No clue text received - this is a real error
        hadError = true;
        console.error('❌ BUZZ FAILED - No clue_text in response');
        toast.dismiss();
        toast.error('Non sono riuscito a generare l\'indizio, riprova fra poco.');
        return;
      }
      
      // Log the buzz action
      await supabase.from('buzz_map_actions').insert({
        user_id: user.id,
        cost_eur: currentPrice,
        clue_count: 1,
        radius_generated: 0 // Regular BUZZ has no radius
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
      console.error('❌ Error in handleBuzz - RESET COMPLETO 17/07/2025:', err);
      // Don't show error toast yet - will check for clue notification first
      hadError = true;
    } finally {
      setBuzzing(false);
      
      // 🔥 ALWAYS fetch and show clue toast in finally block (even on error)
      try {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from('user_notifications')
          .select('id,type,title,message,metadata,created_at,is_deleted')
          .eq('user_id', user.id)
          .in('type', ['buzz', 'buzz_free'])
          .is('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        // Validate 10-minute freshness window
        const isDataFresh = data && new Date(data.created_at).getTime() >= (Date.now() - 10 * 60 * 1000);
        
        console.info({ 
          step: 'buzz-toast', 
          hadError, 
          buzzToastShown, 
          dataExists: !!data, 
          isDataFresh,
          error 
        });
        
        // Show clue toast if fresh notification available
        if (isDataFresh && data?.message && !buzzToastShown) {
          await triggerHaptic('success');
          buzzToastOnce('success', data.message, {
            duration: 4000,
            position: 'top-center',
            style: {
              background: 'linear-gradient(135deg, #F213A4 0%, #FF4D4D 100%)'
            }
          });
        } else if (hadError && !buzzToastShown) {
          await triggerHaptic('error');
          buzzToastOnce('error', "Non sono riuscito a generare l'indizio, riprova fra poco.");
        }
        
        if (!data) {
          console.info('No fresh notification in last 10 minutes');
        }
      } catch (toastError) {
        console.error('Error fetching toast notification:', toastError);
        // Show error toast only if no clue was shown
        if (hadError && !buzzToastShown) {
          toast.error('Errore imprevisto durante BUZZ');
        }
      }
    }
  };

  return {
    buzzing,
    showShockwave,
    handleBuzz
  };
}
