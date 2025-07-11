// by Joseph Mulé – M1SSION™ – BUZZ Action Button Component
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useBuzzApi } from '@/hooks/buzz/useBuzzApi';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';

interface BuzzActionButtonProps {
  currentPrice: number;
  isBlocked: boolean;
  todayCount: number;
  onSuccess: () => void;
}

export const BuzzActionButton: React.FC<BuzzActionButtonProps> = ({
  currentPrice,
  isBlocked,
  todayCount,
  onSuccess
}) => {
  const [buzzing, setBuzzing] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const { user } = useAuth();
  const { vibrate } = useCapacitorHardware();

  // Handle BUZZ action with complete logic + debug
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
      
      console.log('💰 BUZZ PRICE CHECK', { todayCount, currentPrice });
      
      // Check if blocked
      if (currentPrice === 0) {
        toast.error('BUZZ bloccato per oggi! Limite giornaliero raggiunto.');
        return;
      }
      
      // Check for abuse logs
      const { data: abuseData } = await supabase
        .from('abuse_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', 'buzz_press')
        .gte('timestamp', new Date(Date.now() - 30000).toISOString());
      
      if (abuseData && abuseData.length >= 5) {
        toast.error('Troppi tentativi. Riprova tra qualche secondo.');
        return;
      }
      
      // Log abuse attempt
      await supabase.from('abuse_logs').insert({
        user_id: user.id,
        event_type: 'buzz_press'
      });

      // ✅ CHIAMATA API CORRETTA USANDO HOOK - by Joseph Mulé - M1SSION™
      // 🚨 DEBUG: Log pre-chiamata edge function
      console.log('🚨 PRE-BUZZ API CALL:', {
        userId: user.id,
        generateMap: true,
        targetExists: true,
        timestamp: new Date().toISOString()
      });
      
      console.log('🚨 GETTING useBuzzApi HOOK...');
      
      let callBuzzApi;
      try {
        const hook = useBuzzApi();
        callBuzzApi = hook.callBuzzApi;
        console.log('✅ useBuzzApi HOOK INITIALIZED:', !!callBuzzApi);
      } catch (hookError) {
        console.error('❌ useBuzzApi HOOK ERROR:', hookError);
        toast.error(`Hook error: ${hookError.message}`);
        return;
      }
      
      console.log('🚨 CALLING BUZZ API...');
      
      // Call the buzz API with correct hook implementation
      const buzzResult = await callBuzzApi({
        userId: user.id,
        generateMap: true,
        coordinates: undefined,
        prizeId: undefined,
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
        toast.error(buzzResult.errorMessage || 'Errore di rete. Riprova.');
        return;
      }
      
      if (!buzzResult.success) {
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

  return (
    <div className="relative flex flex-col items-center space-y-6">
      {/* BUZZ Button - FORMA ROTONDA + GRADIENT FUCSIA M1SSION™ DEFINITIVO - by Joseph Mulé */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={isBlocked || buzzing}
        onClick={handleBuzz}
        className="relative w-48 h-48 rounded-full text-lg font-semibold text-white tracking-wide shadow-lg z-20"
        style={{
          background: isBlocked 
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
            : 'linear-gradient(135deg, #F213A4 0%, #FF4D4D 100%)',
          boxShadow: isBlocked 
            ? '0 0 15px rgba(239, 68, 68, 0.4)' 
            : '0 0 15px rgba(242, 19, 164, 0.4)'
        }}
      >
        {buzzing ? (
          <div className="flex flex-col items-center space-y-3">
            <Zap className="w-12 h-12 text-white" />
            <span className="text-lg font-semibold text-white">BUZZING...</span>
          </div>
        ) : isBlocked ? (
          <div className="flex flex-col items-center space-y-3">
            <X className="w-12 h-12 text-white" />
            <span className="text-lg font-semibold text-white">BLOCCATO</span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Zap className="w-16 h-16 text-white" />
            <span className="text-3xl font-bold text-white">BUZZ</span>
            <div className="text-sm font-medium bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm text-white">
              €{currentPrice.toFixed(2)}
            </div>
          </div>
        )}
      </motion.button>
      
      {/* 🌀 SHOCKWAVE ANIMATION - ONDA CIRCOLARE GRADIENT FUCSIA by Joseph Mulé */}
      {showShockwave && (
        <motion.div
          key={Date.now()}
          className="absolute w-48 h-48 rounded-full border-4 border-[#F213A4]"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3.5, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ 
            zIndex: 10,
            borderWidth: '3px',
            filter: 'blur(0.5px)',
            borderColor: '#F213A4'
          }}
        />
      )}
    </div>
  );
};