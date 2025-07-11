// by Joseph Mulé – M1SSION™ – BUZZ Handler Hook
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useBuzzApi } from '@/hooks/buzz/useBuzzApi';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { useAbuseProtection } from './useAbuseProtection';

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

  const handleBuzz = async () => {
    console.log('🚀 BUZZ PRESSED - Start handleBuzz', { user: !!user, currentPrice });
    
    if (!user) {
      console.log('❌ BUZZ FAILED - Missing user');
      toast.error('Dati utente non caricati. Riprova.');
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

      // ✅ CHIAMATA API CORRETTA USANDO HOOK - by Joseph Mulé - M1SSION™
      // 🚨 DEBUG: Log pre-chiamata edge function
      console.log('🚨 PRE-BUZZ API CALL:', {
        userId: user.id,
        generateMap: true,
        targetExists: true,
        timestamp: new Date().toISOString()
      });
      
      // by Joseph Mulé – M1SSION™ – FIXED: Proper hook usage outside component
      console.log('🚨 GETTING useBuzzApi HOOK...');
      const { callBuzzApi } = useBuzzApi();
      console.log('✅ useBuzzApi HOOK INITIALIZED:', !!callBuzzApi);
      
      console.log('🚨 CALLING BUZZ API...');
      
      // Call the buzz API with correct hook implementation
      const buzzResult = await callBuzzApi({
        userId: user.id,
        generateMap: true,
        coordinates: null, // Fix: null instead of undefined
        prizeId: null, // Fix: null instead of undefined
        sessionId: `buzz_${Date.now()}`
      });
      
      console.log('✅ BUZZ API CALL COMPLETED');
      
      // 🚨 DEBUG: Log post-chiamata edge function
      console.log('🚨 POST-BUZZ API CALL:', {
        success: buzzResult?.success,
        error: buzzResult?.error,
        errorMessage: buzzResult?.errorMessage,
        hasClueText: !!buzzResult?.clue_text,
        fullResult: buzzResult
      });
      
      if (buzzResult.error) {
        console.error('BUZZ API Error:', buzzResult.errorMessage);
        // by Joseph Mulé – M1SSION™ – FIXED: Prevent duplicate toasts with proper state check
        toast.dismiss(); // Clear any existing toasts
        toast.error(buzzResult.errorMessage || 'Errore di rete. Riprova.');
        return;
      }
      
      if (!buzzResult.success) {
        // by Joseph Mulé – M1SSION™ – FIXED: Prevent duplicate toasts with proper state check
        toast.dismiss(); // Clear any existing toasts
        toast.error(buzzResult.errorMessage || 'Errore durante BUZZ');
        return;
      }
      
      // 🧪 DEBUG COMPLETO DEL FLUSSO BUZZ - by Joseph Mulé
      console.log('📝 BUZZ RESULT M1SSION™:', { 
        clue_text: buzzResult.clue_text,
        success: buzzResult.success,
        full_response: buzzResult
      });
      
      // ✅ VERIFICA CLUE_TEXT VALIDO - LOGICA M1SSION™ - by Joseph Mulé
      if (!buzzResult?.clue_text || buzzResult.clue_text.trim() === '') {
        console.error('❌ CLUE_TEXT NON VALIDO:', buzzResult);
        toast.error('❌ Indizio non ricevuto dal server');
        return;
      }
      
      // ✅ NOTIFICA GIÀ SALVATA DALL'EDGE FUNCTION - NON DUPLICARE
      // ✅ CONTATORE GIÀ INCREMENTATO DALL'EDGE FUNCTION - NON DUPLICARE
      
      // Log the buzz action (mantenere per statistiche UI)
      await supabase.from('buzz_map_actions').insert({
        user_id: user.id,
        cost_eur: currentPrice,
        clue_count: 1,
        radius_generated: buzzResult.radius_km || 1000
      });
      
      // ✅ TOAST SUCCESS CON CLUE_TEXT REALE - CONFORME M1SSION™ - by Joseph Mulé
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