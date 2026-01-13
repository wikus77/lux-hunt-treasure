/**
 * M1SSION™ Map Time Tracking Hook
 * Traccia il tempo di permanenza in mappa e assegna PE
 * +15 PE dopo 4 minuti (240 secondi)
 * +30 PE bonus dopo 10 minuti (600 secondi)
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAwardPE } from '@/features/pulse/hooks/useAwardPE';

const MILESTONE_4_MIN = 240; // 4 minuti in secondi
const MILESTONE_10_MIN = 600; // 10 minuti in secondi

interface UseMapTimeTrackingOptions {
  enabled?: boolean;
}

export function useMapTimeTracking({ enabled = true }: UseMapTimeTrackingOptions = {}) {
  const { awardPE } = useAwardPE();
  const startTimeRef = useRef<number | null>(null);
  const awarded4MinRef = useRef(false);
  const awarded10MinRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkMilestones = useCallback(() => {
    if (!startTimeRef.current) return;
    
    const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    // 🔋 4 minuti: +15 PE
    if (elapsedSeconds >= MILESTONE_4_MIN && !awarded4MinRef.current) {
      awarded4MinRef.current = true;
      console.log('[MapTimeTracking] 🗺️ 4 minuti raggiunti! Assegnazione +15 PE');
      awardPE('MAP_TIME_240S', undefined, {
        elapsedSeconds,
        milestone: '4min',
      }).catch(err => console.warn('[PE] Map 4min award failed:', err));
    }
    
    // 🔋 10 minuti: +30 PE (bonus)
    if (elapsedSeconds >= MILESTONE_10_MIN && !awarded10MinRef.current) {
      awarded10MinRef.current = true;
      console.log('[MapTimeTracking] 🗺️ 10 minuti raggiunti! Assegnazione +30 PE bonus');
      awardPE('MAP_TIME_600S', undefined, {
        elapsedSeconds,
        milestone: '10min',
      }).catch(err => console.warn('[PE] Map 10min award failed:', err));
      
      // Stop checking after 10 min milestone (all milestones reached)
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [awardPE]);

  useEffect(() => {
    if (!enabled) {
      // Cleanup if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start tracking
    startTimeRef.current = Date.now();
    awarded4MinRef.current = false;
    awarded10MinRef.current = false;

    console.log('[MapTimeTracking] 🗺️ Tracking started');

    // Check every 30 seconds
    intervalRef.current = setInterval(checkMilestones, 30 * 1000);

    return () => {
      console.log('[MapTimeTracking] 🗺️ Tracking stopped');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      startTimeRef.current = null;
    };
  }, [enabled, checkMilestones]);

  return {
    // Expose elapsed time if needed for UI
    getElapsedSeconds: useCallback(() => {
      if (!startTimeRef.current) return 0;
      return Math.floor((Date.now() - startTimeRef.current) / 1000);
    }, []),
    has4MinMilestone: awarded4MinRef.current,
    has10MinMilestone: awarded10MinRef.current,
  };
}

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

