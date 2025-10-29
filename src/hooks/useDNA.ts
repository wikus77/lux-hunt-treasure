// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
import { dnaClient } from '@/lib/dna/dnaClient';
import type { DNAScores, DNAProfile, Archetype } from '@/features/dna/dnaTypes';
import { calculateArchetype, getDefaultScores } from '@/features/dna/dnaTypes';

/**
 * Get today's date key in YYYY-MM-DD format (local timezone)
 */
const getTodayKey = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Hook for managing DNA profile
 */
export const useDNA = () => {
  const { isAuthenticated, getCurrentUser } = useUnifiedAuth();
  const [dnaProfile, setDnaProfile] = useState<DNAProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const user = getCurrentUser();
  const userId = user?.id ?? 'anon';

  // Load DNA profile
  useEffect(() => {
    const loadDNA = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to load from Supabase first
        const remoteDNA = await dnaClient.getDna(userId);
        
        if (remoteDNA) {
          // Use archetype from database if available, otherwise calculate
          const archetype = (remoteDNA.archetype as Archetype) || calculateArchetype({
            intuito: remoteDNA.intuito,
            audacia: remoteDNA.audacia,
            etica: remoteDNA.etica,
            rischio: remoteDNA.rischio,
            vibrazione: remoteDNA.vibrazione
          });

          const profile: DNAProfile = {
            intuito: remoteDNA.intuito,
            audacia: remoteDNA.audacia,
            etica: remoteDNA.etica,
            rischio: remoteDNA.rischio,
            vibrazione: remoteDNA.vibrazione,
            archetype,
            completedAt: remoteDNA.updated_at
          };

          setDnaProfile(profile);
          
          // Save to localStorage as backup
          localStorage.setItem(`dna:profile:${userId}`, JSON.stringify(profile));
          localStorage.setItem(`dna:completed:${userId}`, '1');
          
          setNeedsOnboarding(false);
          console.info('[DNA] Loaded from Supabase', { userId, archetype });
        } else {
          // Try localStorage fallback
          const localProfile = localStorage.getItem(`dna:profile:${userId}`);
          const completed = localStorage.getItem(`dna:completed:${userId}`) === '1';
          
          if (localProfile && completed) {
            const profile = JSON.parse(localProfile) as DNAProfile;
            setDnaProfile(profile);
            setNeedsOnboarding(false);
            console.info('[DNA] Loaded from localStorage', { userId, archetype: profile.archetype });
          } else {
            // Check if should show onboarding today
            const lastShown = localStorage.getItem(`dna:lastShown:${userId}`);
            const today = getTodayKey();
            
            if (lastShown !== today) {
              setNeedsOnboarding(true);
              console.info('[DNA] Onboarding needed', { userId, lastShown, today });
            } else {
              setNeedsOnboarding(false);
              console.info('[DNA] Onboarding blocked (same day)', { userId, today });
            }
          }
        }
      } catch (error) {
        console.error('[DNA] Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDNA();
  }, [isAuthenticated, user, userId]);

  /**
   * Save DNA profile
   */
  const saveDNA = async (scores: DNAScores): Promise<boolean> => {
    if (!user) return false;

    try {
      const archetype = calculateArchetype(scores);
      const profile: DNAProfile = {
        ...scores,
        archetype,
        completedAt: new Date().toISOString()
      };

      // Save to localStorage immediately
      localStorage.setItem(`dna:profile:${userId}`, JSON.stringify(profile));
      localStorage.setItem(`dna:completed:${userId}`, '1');
      localStorage.setItem(`dna:lastShown:${userId}`, getTodayKey());

      setDnaProfile(profile);
      setNeedsOnboarding(false);

      console.info('[DNA] Saved locally', { userId, archetype });

      // Try to save to Supabase (non-blocking)
      try {
        await dnaClient.updateDna(userId, scores);
        console.info('[DNA] Synced to Supabase', { userId });
      } catch (syncError) {
        console.warn('[DNA] Failed to sync to Supabase (non-fatal):', syncError);
      }

      return true;
    } catch (error) {
      console.error('[DNA] Error saving profile:', error);
      return false;
    }
  };

  /**
   * Record that onboarding was shown today (skip action)
   */
  const recordOnboardingShown = () => {
    localStorage.setItem(`dna:lastShown:${userId}`, getTodayKey());
    setNeedsOnboarding(false);
    console.info('[DNA] Onboarding skipped', { userId, date: getTodayKey() });
  };

  /**
   * Update specific DNA attributes (partial update)
   */
  const updateDNA = async (partial: Partial<DNAScores>): Promise<boolean> => {
    if (!dnaProfile) return false;

    const updatedScores: DNAScores = {
      intuito: partial.intuito ?? dnaProfile.intuito,
      audacia: partial.audacia ?? dnaProfile.audacia,
      etica: partial.etica ?? dnaProfile.etica,
      rischio: partial.rischio ?? dnaProfile.rischio,
      vibrazione: partial.vibrazione ?? dnaProfile.vibrazione
    };

    return saveDNA(updatedScores);
  };

  // Expose DNA helper for testing in dev
  useEffect(() => {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      (window as any).__dna = {
        simulateDelta: async (delta: Partial<DNAScores>) => {
          if (!user?.id) {
            console.warn('[DNA] No user logged in');
            return;
          }
          
          try {
            const { error } = await (await import('@/integrations/supabase/client')).supabase.rpc('fn_dna_apply_delta', {
              p_user: user.id,
              p_delta: delta,
              p_source: 'dev_simulation',
              p_note: 'Simulazione manuale da console'
            });
            
            if (error) throw error;
            console.log('[DNA] Delta applicato:', delta);
          } catch (error) {
            console.error('[DNA] Errore simulazione:', error);
          }
        },
        currentProfile: dnaProfile
      };
    }
  }, [user, dnaProfile]);

  return {
    dnaProfile,
    isLoading,
    needsOnboarding,
    saveDNA,
    updateDNA,
    recordOnboardingShown
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
