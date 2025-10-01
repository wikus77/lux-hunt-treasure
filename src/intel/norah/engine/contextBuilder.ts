// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Context Builder - Fetches game state from Supabase with localStorage caching

import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = 'norah_agent_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

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

interface CachedAgent {
  code: string;
  nickname: string | null;
  timestamp: number;
}

function getCachedAgent(): CachedAgent | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedAgent = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (1h TTL)
    if (now - data.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

function setCachedAgent(code: string, nickname: string | null) {
  try {
    const data: CachedAgent = {
      code,
      nickname,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('[Norah] Failed to cache agent:', error);
  }
}

export async function buildNorahContext(): Promise<NorahContext> {
  try {
    const { data, error } = await supabase.functions.invoke('get-norah-context', {
      method: 'GET'
    });

    if (error) throw error;

    // Cache agent code for future fast access
    if (data?.agent?.code && data.agent.code !== 'AG-UNKNOWN') {
      setCachedAgent(data.agent.code, data.agent.nickname);
    }

    return data as NorahContext;
  } catch (error) {
    console.error('[Norah] Context build failed:', error);
    
    // Try to use cached agent if available
    const cached = getCachedAgent();
    
    return {
      agent: cached 
        ? { code: cached.code, nickname: cached.nickname }
        : { code: 'AG-UNKNOWN', nickname: null },
      mission: null,
      stats: { clues: 0, buzz_today: 0, finalshot_today: 0 },
      clues: [],
      finalshot_recent: [],
      recent_msgs: []
    };
  }
}
