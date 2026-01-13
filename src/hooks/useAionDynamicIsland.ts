/**
 * M1SSION™ AION Dynamic Island Hook
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Questo hook attiva la Dynamic Island SOLO quando AION parla.
 * La disattiva quando:
 * - AION smette di parlare
 * - L'utente naviga via dalla pagina Intelligence
 * - L'utente chiude il pannello AION
 * 
 * NON si attiva per:
 * - Video con audio
 * - Suoni di navigazione
 * - Qualsiasi altro audio dell'app
 */

import { useEffect, useRef } from 'react';
import { useDynamicIsland } from '@/contexts/DynamicIslandContext';

interface UseAionDynamicIslandOptions {
  /** True quando AION sta parlando (da useTTS o useIntelAnalyst) */
  isSpeaking: boolean;
  /** Stato AION (idle | thinking | speaking | listening) */
  status?: 'idle' | 'thinking' | 'speaking' | 'listening';
  /** True quando il pannello AION è aperto */
  isPanelOpen?: boolean;
}

/**
 * Hook che gestisce la Dynamic Island SOLO per AION
 * 
 * USAGE:
 * ```tsx
 * const { isSpeaking } = useTTS();
 * const { status } = useIntelAnalyst();
 * 
 * useAionDynamicIsland({
 *   isSpeaking,
 *   status,
 *   isPanelOpen: true
 * });
 * ```
 */
export const useAionDynamicIsland = ({
  isSpeaking,
  status,
  isPanelOpen = true
}: UseAionDynamicIslandOptions) => {
  const { isActive, activate, deactivate, setPage, updateData } = useDynamicIsland();
  const wasActivatedByAionRef = useRef(false);
  const isSpeakingRef = useRef(isSpeaking);

  // Sync ref
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Attiva DI quando AION inizia a parlare
  useEffect(() => {
    const isAionTalking = isSpeaking || status === 'speaking';
    
    if (isAionTalking && isPanelOpen && !isActive) {
      // AION sta parlando - attiva DI
      console.log('[AION-DI] 🎙️ AION sta parlando - Attivo Dynamic Island');
      activate({
        aionStatus: 'active'
      }).then(() => {
        wasActivatedByAionRef.current = true;
        setPage('intelligence', { aionStatus: 'active' });
      }).catch(err => {
        console.warn('[AION-DI] Activation failed:', err);
      });
    } else if (!isAionTalking && wasActivatedByAionRef.current && isActive) {
      // AION ha smesso di parlare - disattiva DI
      console.log('[AION-DI] 🔇 AION ha smesso di parlare - Disattivo Dynamic Island');
      deactivate();
      wasActivatedByAionRef.current = false;
    }
  }, [isSpeaking, status, isPanelOpen, isActive, activate, deactivate, setPage]);

  // Aggiorna stato nella DI
  useEffect(() => {
    if (isActive && wasActivatedByAionRef.current) {
      const aionState = status === 'thinking' ? 'idle' : (isSpeaking ? 'active' : 'idle');
      updateData({ aionStatus: aionState as 'active' | 'idle' });
    }
  }, [status, isSpeaking, isActive, updateData]);

  // Disattiva quando si lascia la pagina (cleanup)
  useEffect(() => {
    return () => {
      if (wasActivatedByAionRef.current) {
        console.log('[AION-DI] 🚪 Leaving page - Disattivo Dynamic Island');
        deactivate();
        wasActivatedByAionRef.current = false;
      }
    };
  }, [deactivate]);

  // Disattiva se il pannello viene chiuso
  useEffect(() => {
    if (!isPanelOpen && wasActivatedByAionRef.current && isActive) {
      console.log('[AION-DI] 📴 Pannello chiuso - Disattivo Dynamic Island');
      deactivate();
      wasActivatedByAionRef.current = false;
    }
  }, [isPanelOpen, isActive, deactivate]);

  return {
    isDynamicIslandActive: isActive && wasActivatedByAionRef.current
  };
};

export default useAionDynamicIsland;

