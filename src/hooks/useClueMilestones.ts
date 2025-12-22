/**
 * CLUE MILESTONES™ — Hook per milestone indizi trovati
 * Gestisce le ricompense M1U al raggiungimento delle soglie
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONE CONFIGURATION (SINGLE SOURCE OF TRUTH)
// ═══════════════════════════════════════════════════════════════════════════
export interface ClueMilestone {
  threshold: number;
  m1u: number;
  title: string | null; // null = no popup
  key: string;
}

export const CLUE_MILESTONES: ClueMilestone[] = [
  { threshold: 10,  m1u: 10,   title: 'AGENT 1 RANG', key: 'clues_10' },
  { threshold: 25,  m1u: 50,   title: 'AGENT 2 RANG', key: 'clues_25' },
  { threshold: 50,  m1u: 100,  title: 'AGENT 3 RANG', key: 'clues_50' },
  { threshold: 75,  m1u: 125,  title: 'WRESTLER',     key: 'clues_75' },
  { threshold: 100, m1u: 150,  title: 'FIGHTER',      key: 'clues_100' },
  { threshold: 125, m1u: 175,  title: null,           key: 'clues_125' },
  { threshold: 150, m1u: 200,  title: 'WARRIOR',      key: 'clues_150' },
  { threshold: 175, m1u: 250,  title: null,           key: 'clues_175' },
  { threshold: 200, m1u: 300,  title: 'CHAMPION',     key: 'clues_200' },
  { threshold: 225, m1u: 400,  title: null,           key: 'clues_225' },
  { threshold: 250, m1u: 500,  title: 'LEGEND',       key: 'clues_250' },
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

  // Fetch claimed milestones from DB (with fallback to localStorage if RPC doesn't exist)
  const fetchClaimedMilestones = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Try RPC first
      const { data, error } = await supabase.rpc('get_claimed_clue_milestones');
      
      if (error) {
        // 🔧 FIX: If RPC doesn't exist, fall back to localStorage
        if (error.message?.includes('function') || error.code === '42883' || error.code === 'PGRST202') {
          console.warn('[CLUE_MILESTONE] RPC not found, using localStorage fallback');
          const localKey = `clue_milestones_${user.id}`;
          try {
            const local = localStorage.getItem(localKey);
            if (local) {
              const parsed = JSON.parse(local) as string[];
              setClaimedKeys(new Set(parsed));
              if (import.meta.env.DEV) {
                console.log('[CLUE_MILESTONE] Loaded from localStorage:', parsed);
              }
            }
          } catch {}
          setIsLoading(false);
          return;
        }
        console.error('[CLUE_MILESTONE] Fetch error:', error);
        setIsLoading(false);
        return;
      }

      const claimed = data as ClaimedMilestone[] || [];
      const keys = new Set(claimed.map(m => m.key));
      
      if (import.meta.env.DEV) {
        console.log('[CLUE_MILESTONE] Loaded claimed milestones:', Array.from(keys));
      }
      
      setClaimedKeys(keys);
    } catch (err) {
      console.error('[CLUE_MILESTONE] Exception:', err);
    } finally {
      setIsLoading(false);
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

  // Claim a single milestone
  const claimMilestone = useCallback(async (milestone: ClueMilestone): Promise<MilestoneClaimResult> => {
    if (!user?.id) {
      return { success: false, milestone, error: 'Not authenticated' };
    }

    if (claimedKeys.has(milestone.key)) {
      return { success: false, milestone, alreadyClaimed: true };
    }

    try {
      if (import.meta.env.DEV) {
        console.log('[CLUE_MILESTONE] Claiming:', {
          milestone: milestone.key,
          m1u: milestone.m1u,
          title: milestone.title
        });
      }

      // Try RPC first
      const { data, error } = await supabase.rpc('claim_clue_milestone', {
        p_milestone_key: milestone.key,
        p_m1u_amount: milestone.m1u
      });

      // 🔧 FIX: If RPC doesn't exist, use fallback (localStorage + direct M1U update)
      if (error && (error.message?.includes('function') || error.code === '42883' || error.code === 'PGRST202')) {
        console.warn('[CLUE_MILESTONE] RPC not found, using fallback');
        
        // Save to localStorage
        const localKey = `clue_milestones_${user.id}`;
        try {
          const existing = localStorage.getItem(localKey);
          const claimed = existing ? JSON.parse(existing) as string[] : [];
          if (!claimed.includes(milestone.key)) {
            claimed.push(milestone.key);
            localStorage.setItem(localKey, JSON.stringify(claimed));
          }
        } catch {}

        // Grant M1U directly (best effort)
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('m1_units')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            const newBalance = (profile.m1_units || 0) + milestone.m1u;
            await supabase
              .from('profiles')
              .update({ m1_units: newBalance, updated_at: new Date().toISOString() })
              .eq('id', user.id);
            
            if (import.meta.env.DEV) {
              console.log('[CLUE_MILESTONE] ✅ Fallback M1U granted:', milestone.m1u, 'new balance:', newBalance);
            }
            
            // Update local state
            setClaimedKeys(prev => new Set([...prev, milestone.key]));
            window.dispatchEvent(new CustomEvent('m1u-balance-updated'));
            
            return { success: true, milestone, newBalance };
          }
        } catch (e) {
          console.error('[CLUE_MILESTONE] Fallback M1U grant failed:', e);
        }
        
        // Still mark as claimed locally
        setClaimedKeys(prev => new Set([...prev, milestone.key]));
        return { success: true, milestone };
      }

      if (error) {
        console.error('[CLUE_MILESTONE] RPC error:', error);
        return { success: false, milestone, error: error.message };
      }

      const result = data as { success: boolean; new_balance?: number; already_claimed?: boolean; error?: string };

      if (result.success) {
        // Update local state
        setClaimedKeys(prev => new Set([...prev, milestone.key]));
        
        // Trigger M1U refresh
        window.dispatchEvent(new CustomEvent('m1u-balance-updated'));

        if (import.meta.env.DEV) {
          console.log('[CLUE_MILESTONE] ✅ Claimed successfully:', {
            milestone: milestone.key,
            grantedM1U: milestone.m1u,
            newBalance: result.new_balance
          });
        }

        return {
          success: true,
          milestone,
          newBalance: result.new_balance
        };
      } else {
        return {
          success: false,
          milestone,
          error: result.error,
          alreadyClaimed: result.already_claimed
        };
      }
    } catch (err) {
      console.error('[CLUE_MILESTONE] Exception claiming:', err);
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

