// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// @ts-nocheck

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useDNA } from '@/hooks/useDNA';
import { toast } from 'sonner';

/**
 * Hook to handle DNA attribute rewards when solving the Rubik Cube
 */
export function useRubikDNA() {
  const { getCurrentUser } = useUnifiedAuth();
  const { dnaProfile } = useDNA();

  /**
   * Called when the Rubik Cube is solved
   * Awards +1 to the lowest DNA attribute
   */
  const onCubeSolved = useCallback(async () => {
    const user = getCurrentUser();
    if (!user || !dnaProfile) {
      console.warn('[RubikDNA] User or DNA profile not available');
      return;
    }

    try {
      // Find the lowest attribute
      const attributes = {
        intuito: dnaProfile.intuito,
        audacia: dnaProfile.audacia,
        etica: dnaProfile.etica,
        rischio: dnaProfile.rischio,
        vibrazione: dnaProfile.vibrazione
      };

      const lowestAttribute = Object.entries(attributes).reduce((lowest, current) => {
        return current[1] < lowest[1] ? current : lowest;
      })[0];

      console.log('[RubikDNA] Incrementing attribute:', lowestAttribute);

      // Call Supabase function to increment (capped at 100)
      const { data, error } = await supabase.rpc('increment_dna_attribute', {
        p_user: user.id,
        p_attribute: lowestAttribute
      });

      if (error) throw error;

      // Show success toast
      toast.success('🧬 DNA Evoluto!', {
        description: `${lowestAttribute.toUpperCase()} +1 per aver risolto il cubo`
      });

      console.log('[RubikDNA] DNA attribute incremented successfully');
      
      // The DNA profile will auto-refresh via the useDNA hook
    } catch (error) {
      console.error('[RubikDNA] Error incrementing DNA:', error);
      toast.error('Errore durante l\'evoluzione del DNA');
    }
  }, [getCurrentUser, dnaProfile]);

  return {
    onCubeSolved,
    currentDNA: dnaProfile
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
