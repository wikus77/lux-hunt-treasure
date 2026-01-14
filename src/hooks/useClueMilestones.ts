/**
 * CLUE MILESTONES™ — Hook per milestone indizi trovati
 * Gestisce le ricompense M1U al raggiungimento delle soglie
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { emitGameEvent } from '@/gameplay/events';

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONE CONFIGURATION (SINGLE SOURCE OF TRUTH)
// ═══════════════════════════════════════════════════════════════════════════
export interface ClueMilestone {
  threshold: number;
  m1u: number;
  pe: number; // Pulse Energy reward
  title: string | null; // null = no popup
  key: string;
}

// ⚠️ NOTA: I titoli sono stati rimossi (title: null)
// L'avanzamento di grado ora avviene SOLO tramite il sistema PE (Pulse Energy)
// Queste milestone premiano SOLO M1U, senza popup di livello
export const CLUE_MILESTONES: ClueMilestone[] = [
  { threshold: 10,  m1u: 10,   pe: 10,  title: null,  key: 'clues_10' },
  { threshold: 25,  m1u: 25,   pe: 10,  title: null,  key: 'clues_25' },
  { threshold: 50,  m1u: 50,   pe: 15,  title: null,  key: 'clues_50' },
  { threshold: 75,  m1u: 75,   pe: 15,  title: null,  key: 'clues_75' },
  { threshold: 100, m1u: 100,  pe: 20,  title: null,  key: 'clues_100' },
  { threshold: 125, m1u: 125,  pe: 20,  title: null,  key: 'clues_125' },
  { threshold: 150, m1u: 150,  pe: 25,  title: null,  key: 'clues_150' },
  { threshold: 175, m1u: 175,  pe: 25,  title: null,  key: 'clues_175' },
  { threshold: 200, m1u: 200,  pe: 30,  title: null,  key: 'clues_200' },
  { threshold: 225, m1u: 250,  pe: 35,  title: null,  key: 'clues_225' },
  { threshold: 250, m1u: 500,  pe: 50,  title: null,  key: 'clues_250' },
];

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export interface ClaimedMilestone {
  key: string;
  m1u: number;
  claimed_at: string;
}

export interface MilestoneClaimResult {
  success: boolean;
  milestone: ClueMilestone;
  newBalance?: number;
  error?: string;
  alreadyClaimed?: boolean;
}

export interface UseClueMilestonesReturn {
  claimedKeys: Set<string>;
  isLoading: boolean;
  pendingMilestone: ClueMilestone | null;
  checkAndClaimMilestones: (clueCount: number) => Promise<MilestoneClaimResult | null>;
  dismissMilestone: () => void;
  getUnclaimedMilestones: (clueCount: number) => ClueMilestone[];
  refetch: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════
export const useClueMilestones = (): UseClueMilestonesReturn => {
  const { user } = useAuth();
  const [claimedKeys, setClaimedKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [pendingMilestone, setPendingMilestone] = useState<ClueMilestone | null>(null);
  const lastClueCount = useRef<number>(0);
  const isProcessing = useRef<boolean>(false);

  // 🔥 DEBUG LOG
  console.log('[CLUE_MILESTONE_HOOK] 🎯 Hook initialized - user:', user?.id?.slice(0, 8) || 'none');

  // ✅ FIX: Use ONLY localStorage - no RPC dependency
  const fetchClaimedMilestones = useCallback(async () => {
    console.log('[CLUE_MILESTONE_HOOK] 📥 fetchClaimedMilestones called');
    
    if (!user?.id) {
      console.log('[CLUE_MILESTONE_HOOK] ⚠️ No user, setting isLoading=false');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // ✅ DIRECT localStorage - no RPC!
      const localKey = `clue_milestones_${user.id}`;
      console.log('[CLUE_MILESTONE_HOOK] 📂 Reading localStorage key:', localKey);
      
      const local = localStorage.getItem(localKey);
      console.log('[CLUE_MILESTONE_HOOK] 📂 localStorage value:', local);
      
      if (local) {
        try {
          const parsed = JSON.parse(local) as string[];
          setClaimedKeys(new Set(parsed));
          console.log('[CLUE_MILESTONE_HOOK] ✅ Loaded claimed milestones:', parsed);
        } catch (parseErr) {
          console.error('[CLUE_MILESTONE_HOOK] ❌ JSON parse error:', parseErr);
          setClaimedKeys(new Set());
        }
      } else {
        console.log('[CLUE_MILESTONE_HOOK] 📂 No claimed milestones in localStorage (first time)');
        setClaimedKeys(new Set());
      }
    } catch (err) {
      console.error('[CLUE_MILESTONE_HOOK] ❌ Exception:', err);
      setClaimedKeys(new Set());
    } finally {
      setIsLoading(false);
      console.log('[CLUE_MILESTONE_HOOK] ✅ isLoading set to false');
    }
  }, [user?.id]);

  // Load on mount
  useEffect(() => {
    fetchClaimedMilestones();
  }, [fetchClaimedMilestones]);

  // Get unclaimed milestones for current clue count
  const getUnclaimedMilestones = useCallback((clueCount: number): ClueMilestone[] => {
    return CLUE_MILESTONES.filter(m => 
      clueCount >= m.threshold && !claimedKeys.has(m.key)
    );
  }, [claimedKeys]);

  // ✅ FIX: Claim a single milestone - DIRECT localStorage + Supabase (no RPC)
  const claimMilestone = useCallback(async (milestone: ClueMilestone): Promise<MilestoneClaimResult> => {
    console.log('[CLUE_MILESTONE_HOOK] 🎯 claimMilestone called:', milestone.key);
    
    if (!user?.id) {
      console.log('[CLUE_MILESTONE_HOOK] ❌ No user, cannot claim');
      return { success: false, milestone, error: 'Not authenticated' };
    }

    if (claimedKeys.has(milestone.key)) {
      console.log('[CLUE_MILESTONE_HOOK] ⚠️ Already claimed:', milestone.key);
      return { success: false, milestone, alreadyClaimed: true };
    }

    console.log('[CLUE_MILESTONE_HOOK] 🏆 Claiming milestone:', {
      key: milestone.key,
      m1u: milestone.m1u,
      pe: milestone.pe,
      title: milestone.title
    });

    try {
      // 1️⃣ SAVE TO LOCALSTORAGE FIRST
      const localKey = `clue_milestones_${user.id}`;
      const existing = localStorage.getItem(localKey);
      const claimed = existing ? JSON.parse(existing) as string[] : [];
      
      if (!claimed.includes(milestone.key)) {
        claimed.push(milestone.key);
        localStorage.setItem(localKey, JSON.stringify(claimed));
        console.log('[CLUE_MILESTONE_HOOK] 💾 Saved to localStorage:', claimed);
      }

      // 2️⃣ UPDATE LOCAL STATE IMMEDIATELY
      setClaimedKeys(prev => new Set([...prev, milestone.key]));
      console.log('[CLUE_MILESTONE_HOOK] 📊 Updated local state');

      // 3️⃣ GRANT M1U + PE via Supabase
      let newM1UBalance = 0;
      try {
        const { data: profile, error: fetchErr } = await supabase
          .from('profiles')
          .select('m1_units, pulse_energy')
          .eq('id', user.id)
          .single();
        
        if (fetchErr) {
          console.error('[CLUE_MILESTONE_HOOK] ❌ Error fetching profile:', fetchErr);
        } else if (profile) {
          newM1UBalance = (profile.m1_units || 0) + milestone.m1u;
          const newPEBalance = (profile.pulse_energy || 0) + milestone.pe;
          
          const { error: updateErr } = await supabase
            .from('profiles')
            .update({ 
              m1_units: newM1UBalance, 
              pulse_energy: newPEBalance,
              updated_at: new Date().toISOString() 
            })
            .eq('id', user.id);
          
          if (updateErr) {
            console.error('[CLUE_MILESTONE_HOOK] ❌ Error updating profile:', updateErr);
          } else {
            console.log('[CLUE_MILESTONE_HOOK] ✅ Supabase updated:', {
              m1u: milestone.m1u,
              pe: milestone.pe,
              newM1UBalance,
              newPEBalance
            });
          }
        }
      } catch (dbErr) {
        console.error('[CLUE_MILESTONE_HOOK] ❌ DB error:', dbErr);
      }

      // 4️⃣ NOTE: m1u-credited event will be dispatched by ClueMilestoneModal
      // after the animation completes (no double dispatch)

      console.log('[CLUE_MILESTONE_HOOK] ✅ Milestone claimed successfully:', milestone.key);
      
      // 🎉 Progress Feedback - Milestone reached event
      emitGameEvent('MILESTONE_REACHED', {
        title: milestone.title,
        threshold: milestone.threshold,
        m1u: milestone.m1u,
        pe: milestone.pe,
        key: milestone.key,
        nextThreshold: CLUE_MILESTONES.find(m => m.threshold > milestone.threshold)?.threshold,
      });
      
      return { success: true, milestone, newBalance: newM1UBalance };
      
    } catch (err) {
      console.error('[CLUE_MILESTONE_HOOK] ❌ Exception claiming:', err);
      return { success: false, milestone, error: String(err) };
    }
  }, [user?.id, claimedKeys]);

  // Check and claim milestones when clue count changes
  const checkAndClaimMilestones = useCallback(async (clueCount: number): Promise<MilestoneClaimResult | null> => {
    // Prevent concurrent processing
    if (isProcessing.current) return null;
    
    // Skip if count hasn't changed
    if (clueCount === lastClueCount.current && clueCount !== 0) return null;
    lastClueCount.current = clueCount;

    // Get unclaimed milestones that should be awarded
    const unclaimedMilestones = getUnclaimedMilestones(clueCount);
    
    if (unclaimedMilestones.length === 0) return null;

    isProcessing.current = true;

    try {
      // Process milestones one by one (in order)
      for (const milestone of unclaimedMilestones) {
        const result = await claimMilestone(milestone);
        
        if (result.success && milestone.title) {
          // Set pending milestone for popup (only if has title)
          setPendingMilestone(milestone);
          isProcessing.current = false;
          return result;
        } else if (result.success) {
          // Claimed but no popup needed, continue to next
          if (import.meta.env.DEV) {
            console.log('[CLUE_MILESTONE] Silent claim (no popup):', milestone.key);
          }
        }
      }
    } finally {
      isProcessing.current = false;
    }

    return null;
  }, [getUnclaimedMilestones, claimMilestone]);

  // Dismiss the current milestone popup
  const dismissMilestone = useCallback(() => {
    setPendingMilestone(null);
  }, []);

  return {
    claimedKeys,
    isLoading,
    pendingMilestone,
    checkAndClaimMilestones,
    dismissMilestone,
    getUnclaimedMilestones,
    refetch: fetchClaimedMilestones,
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

