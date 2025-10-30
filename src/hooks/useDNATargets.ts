// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DNAScores } from '@/features/dna/dnaTypes';

export interface DNATarget {
  x: number;
  y: number;
  z: number;
}

export interface DNATargets {
  ETICA: DNATarget;
  INTUITO: DNATarget;
  AUDACIA: DNATarget;
  VIBRAZIONE: DNATarget;
  RISCHIO: DNATarget;
}

export interface DNAVisualData {
  dna: DNAScores;
  targets: DNATargets;
  seed: string;
}

export function useDNATargets(userId: string | null) {
  const [data, setData] = useState<DNAVisualData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchDNAVisual = async () => {
      try {
        setLoading(true);
        const { data: result, error: rpcError } = await supabase
          .rpc('get_agent_dna_visual', { user_id: userId });

        if (rpcError) throw rpcError;
        
        setData(result as DNAVisualData);
        setError(null);
      } catch (err) {
        console.error('❌ Failed to fetch DNA visual data:', err);
        setError(err as Error);
        // Fallback data
        setData({
          dna: { intuito: 50, audacia: 50, etica: 50, rischio: 50, vibrazione: 50 },
          targets: {
            ETICA: { x: -1, y: 1, z: 0 },
            INTUITO: { x: 0, y: 1, z: 1 },
            AUDACIA: { x: 1, y: 0, z: -1 },
            VIBRAZIONE: { x: -1, y: -1, z: 1 },
            RISCHIO: { x: 1, y: -1, z: 0 }
          },
          seed: userId
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDNAVisual();
  }, [userId]);

  return { data, loading, error };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
