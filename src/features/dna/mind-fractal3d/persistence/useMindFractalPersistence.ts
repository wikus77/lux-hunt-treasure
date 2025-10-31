// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PersistPayload {
  seed: number;
  nodeId?: string;
  fromNode?: string;
  toNode?: string;
  linkLength?: number;
}

export function useMindFractalPersistence() {
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  /**
   * Track node discovery
   */
  const trackNodeSeen = useCallback(async (nodeId: string, seed: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('mf_upsert_seen', {
        p_node_ids: [nodeId],
        p_seed: BigInt(seed)
      } as any);

      console.info('[MF3D][Persist] Node seen:', nodeId);
    } catch (error) {
      console.warn('[MF3D][Persist] Failed to track node:', error);
    }
  }, []);

  /**
   * Track link creation between nodes
   */
  const trackLinkCreated = useCallback(async (
    fromNode: string,
    toNode: string,
    length: number,
    seed: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('mf_add_link', {
        p_from: fromNode,
        p_to: toNode,
        p_length: length,
        p_seed: BigInt(seed)
      } as any);

      console.info('[MF3D][Persist] Link created:', { fromNode, toNode, length });
    } catch (error) {
      console.warn('[MF3D][Persist] Failed to track link:', error);
    }
  }, []);

  /**
   * Load user's progress for a given seed
   */
  const loadProgress = useCallback(async (seed: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Load seen nodes
      const { data: seenNodes } = await supabase
        .from('dna_mf_nodes_seen' as any)
        .select('node_id')
        .eq('user_id', user.id)
        .eq('seed', seed);

      // Load links
      const { data: links } = await supabase
        .from('dna_mf_links' as any)
        .select('node_from, node_to, length')
        .eq('user_id', user.id)
        .eq('seed', seed);

      return {
        seenNodes: seenNodes?.map((n: any) => n.node_id) || [],
        links: links || []
      };
    } catch (error) {
      console.warn('[MF3D][Persist] Failed to load progress:', error);
      return null;
    }
  }, []);

  return {
    trackNodeSeen,
    trackLinkCreated,
    loadProgress
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
