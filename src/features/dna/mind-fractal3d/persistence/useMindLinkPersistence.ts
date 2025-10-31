// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { NodeTheme } from '../nodes/NodeLayer';

interface LinkResult {
  total_links: number;
  theme_links: number;
  milestone_added: boolean;
  milestone_level: number;
}

interface LoadedLink {
  node_a: number;
  node_b: number;
  theme: NodeTheme;
  intensity: number;
}

export function useMindLinkPersistence() {
  /**
   * Track link creation and check for milestone
   */
  const trackLink = useCallback(async (
    nodeA: number,
    nodeB: number,
    theme: NodeTheme,
    seed: number,
    intensity: number = 1.0
  ): Promise<LinkResult | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.rpc('upsert_dna_mind_link', {
        p_user_id: user.id,
        p_seed: BigInt(seed),
        p_node_a: nodeA,
        p_node_b: nodeB,
        p_theme: theme,
        p_intensity: intensity
      } as any);

      if (error) {
        console.warn('[MF3D][Link] Failed to track:', error);
        return null;
      }

      console.info('[MF3D][Link] Tracked:', { nodeA, nodeB, theme, result: data });
      return data[0] as LinkResult;
    } catch (error) {
      console.warn('[MF3D][Link] Exception:', error);
      return null;
    }
  }, []);

  /**
   * Load user's links for a given seed
   */
  const loadLinks = useCallback(async (seed: number): Promise<LoadedLink[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: links } = await supabase
        .from('dna_mind_links' as any)
        .select('node_a, node_b, theme, intensity')
        .eq('user_id', user.id)
        .eq('seed', seed);

      return (links || []) as unknown as LoadedLink[];
    } catch (error) {
      console.warn('[MF3D][Link] Failed to load:', error);
      return [];
    }
  }, []);

  return {
    trackLink,
    loadLinks
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
