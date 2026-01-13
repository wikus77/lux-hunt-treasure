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
import { unblockMediaSessionForAion, blockMediaSession } from '@/lib/media/MediaSessionBlocker';

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
      // AION sta parlando - SBLOCCA MediaSession e attiva DI
      console.log('[AION-DI] 🎙️ AION sta parlando - Sblocco MediaSession e attivo Dynamic Island');
      unblockMediaSessionForAion(); // 🔓 Sblocca MediaSession SOLO per AION
      activate({
        aionStatus: 'active'
      }).then(() => {
        wasActivatedByAionRef.current = true;
        setPage('intelligence', { aionStatus: 'active' });
      }).catch(err => {
        console.warn('[AION-DI] Activation failed:', err);
        blockMediaSession(); // 🔒 Ri-blocca se fallisce
      });
    } else if (!isAionTalking && wasActivatedByAionRef.current && isActive) {
      // AION ha smesso di parlare - BLOCCA MediaSession e disattiva DI
      console.log('[AION-DI] 🔇 AION ha smesso di parlare - Blocco MediaSession e disattivo Dynamic Island');
      blockMediaSession(); // 🔒 Ri-blocca MediaSession
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
        console.log('[AION-DI] 🚪 Leaving page - Blocco MediaSession e disattivo Dynamic Island');
        blockMediaSession(); // 🔒 Ri-blocca MediaSession
        deactivate();
        wasActivatedByAionRef.current = false;
      }
    };
  }, [deactivate]);

  // Disattiva se il pannello viene chiuso
  useEffect(() => {
    if (!isPanelOpen && wasActivatedByAionRef.current && isActive) {
      console.log('[AION-DI] 📴 Pannello chiuso - Blocco MediaSession e disattivo Dynamic Island');
      blockMediaSession(); // 🔒 Ri-blocca MediaSession
      deactivate();
      wasActivatedByAionRef.current = false;
    }
  }, [isPanelOpen, isActive, deactivate]);

  return {
    isDynamicIslandActive: isActive && wasActivatedByAionRef.current
  };
};

export default useAionDynamicIsland;

