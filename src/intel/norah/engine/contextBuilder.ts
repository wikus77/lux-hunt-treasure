// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Context Builder - Fetches game state from Supabase

import { supabase } from '@/integrations/supabase/client';

export interface NorahContext {
  agent: {
    code: string;
    nickname: string | null;
  };
  mission: {
    id: string;
    progress: any;
  } | null;
  stats: {
    clues: number;
    buzz_today: number;
    finalshot_today: number;
  };
  clues: Array<{
    clue_id: string;
    meta: any;
    created_at: string;
  }>;
  finalshot_recent: Array<{
    result: string;
    created_at: string;
  }>;
  recent_msgs: Array<{
    role: string;
    content: string;
    intent?: string;
  }>;
}

export async function buildNorahContext(): Promise<NorahContext> {
  try {
    const { data, error } = await supabase.functions.invoke('get-norah-context', {
      method: 'GET'
    });

    if (error) throw error;

    return data as NorahContext;
  } catch (error) {
    console.error('[Norah] Context build failed:', error);
    
    // Fallback context
    return {
      agent: { code: 'AG-UNKNOWN', nickname: null },
      mission: null,
      stats: { clues: 0, buzz_today: 0, finalshot_today: 0 },
      clues: [],
      finalshot_recent: [],
      recent_msgs: []
    };
  }
}
