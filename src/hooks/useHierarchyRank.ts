/**
 * M1SSION™ — Hierarchy Rank Hook
 * Hook per gestire la gerarchia agenti basata su PE
 * Controlla anche se l'utente ha raggiunto un nuovo rank per mostrare il popup
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import {
  HIERARCHY_LEVELS,
  getCurrentLevel,
  getNextLevel,
  calculateProgress,
  getPEToNextLevel,
  HierarchyLevel,
} from '@/config/hierarchyConfig';

// Storage key per il livello già visto
const LAST_SEEN_RANK_KEY = 'M1SSION_last_seen_rank_level';

export interface HierarchyRankState {
  pulseEnergy: number;
  currentLevel: HierarchyLevel;
  nextLevel: HierarchyLevel | null;
  progressPercent: number;        // 0-100% nel livello corrente
  peInCurrentLevel: number;       // PE accumulati in questo livello
  peNeededForLevel: number;       // PE necessari per completare il livello
  peToNextLevel: number;          // PE mancanti per il prossimo livello
  isMaxLevel: boolean;
}

export interface UseHierarchyRankReturn {
  state: HierarchyRankState | null;
  isLoading: boolean;
  error: Error | null;
  pendingRankUp: HierarchyLevel | null;  // Rank da mostrare nel popup
  dismissRankUp: () => void;              // Chiude il popup e salva
  refetch: () => Promise<void>;
}

export const useHierarchyRank = (): UseHierarchyRankReturn => {
  const { user } = useAuth();
  const [state, setState] = useState<HierarchyRankState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pendingRankUp, setPendingRankUp] = useState<HierarchyLevel | null>(null);
  const hasCheckedRankUp = useRef(false);
  const previousPE = useRef<number>(0);

  // Ottieni l'ultimo livello visto da localStorage
  const getLastSeenLevel = useCallback((): number => {
    if (!user?.id) return 0;
    const key = `${LAST_SEEN_RANK_KEY}_${user.id}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
  }, [user?.id]);

  // Salva l'ultimo livello visto
  const saveLastSeenLevel = useCallback((level: number) => {
    if (!user?.id) return;
    const key = `${LAST_SEEN_RANK_KEY}_${user.id}`;
    localStorage.setItem(key, level.toString());
  }, [user?.id]);

  // Fetch PE da Supabase
  const fetchEnergy = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('pulse_energy')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const currentPE = profile?.pulse_energy || 0;
      const currentLevel = getCurrentLevel(currentPE);
      const nextLevel = getNextLevel(currentLevel);
      const progressPercent = calculateProgress(currentPE, currentLevel, nextLevel);
      const peToNext = getPEToNextLevel(currentPE, nextLevel);
      
      // Calcola PE nel livello corrente
      const peInCurrentLevel = currentPE - currentLevel.peThreshold;
      const peNeededForLevel = nextLevel 
        ? nextLevel.peThreshold - currentLevel.peThreshold 
        : 0;

      setState({
        pulseEnergy: currentPE,
        currentLevel,
        nextLevel,
        progressPercent,
        peInCurrentLevel,
        peNeededForLevel,
        peToNextLevel: peToNext,
        isMaxLevel: !nextLevel || nextLevel.code === 'MCP',
      });

      // 🎯 CONTROLLO RANK UP per utenti esistenti (solo al primo caricamento)
      if (!hasCheckedRankUp.current && currentLevel.level > 0) {
        const lastSeenLevel = getLastSeenLevel();
        
        console.log(`[HierarchyRank] Check rank up: currentLevel=${currentLevel.level}, lastSeen=${lastSeenLevel}`);
        
        // 🆕 FIX 16/01/2026: Se lastSeenLevel è 0 (mai salvato), salva il livello corrente
        // senza mostrare il popup. Questo evita che utenti esistenti vedano il popup ogni login.
        if (lastSeenLevel === 0 && currentLevel.level > 0) {
          console.log(`[HierarchyRank] 🔧 First time check - saving current level ${currentLevel.level} without popup`);
          saveLastSeenLevel(currentLevel.level);
        } else if (currentLevel.level > lastSeenLevel) {
          // L'utente ha VERAMENTE raggiunto un nuovo livello (non è il primo check)
          console.log(`🎖️ [HierarchyRank] NEW RANK DETECTED! ${currentLevel.name} (level ${currentLevel.level})`);
          setPendingRankUp(currentLevel);
        }
        
        hasCheckedRankUp.current = true;
      }

      // Controlla se PE è aumentato durante la sessione (per rank up in tempo reale)
      if (previousPE.current > 0 && currentPE > previousPE.current) {
        const prevLevel = getCurrentLevel(previousPE.current);
        if (currentLevel.level > prevLevel.level) {
          // Rank up in tempo reale!
          console.log(`🎖️ [HierarchyRank] REALTIME RANK UP! ${prevLevel.name} → ${currentLevel.name}`);
          setPendingRankUp(currentLevel);
        }
      }
      
      previousPE.current = currentPE;

    } catch (err) {
      console.error('❌ [HierarchyRank] Error:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getLastSeenLevel]);

  // Chiude il popup e salva il livello visto
  const dismissRankUp = useCallback(() => {
    if (pendingRankUp) {
      saveLastSeenLevel(pendingRankUp.level);
      console.log(`✅ [HierarchyRank] Rank ${pendingRankUp.name} marked as seen`);
    }
    setPendingRankUp(null);
  }, [pendingRankUp, saveLastSeenLevel]);

  // Fetch iniziale
  useEffect(() => {
    fetchEnergy();
  }, [fetchEnergy]);

  // Realtime subscription per PE changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`hierarchy_rank_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newPE = payload.new.pulse_energy;
          const oldPE = previousPE.current;
          
          if (newPE !== oldPE) {
            console.log(`⚡ [HierarchyRank] PE Update: ${oldPE} → ${newPE}`);
            fetchEnergy();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, fetchEnergy]);

  return {
    state,
    isLoading,
    error,
    pendingRankUp,
    dismissRankUp,
    refetch: fetchEnergy,
  };
};

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

