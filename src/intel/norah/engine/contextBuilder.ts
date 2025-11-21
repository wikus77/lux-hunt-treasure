// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Context Builder - Fetches game state from Supabase with localStorage caching

import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = 'norah_agent_cache';
const CACHE_TTL = 6 * 60 * 60 * 1000; // v6.2: 6 hours TTL

export interface NorahContext {
  agent: {
    code: string;
    username: string | null;
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
  username: string | null;
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

function setCachedAgent(code: string, username: string | null) {
  try {
    const data: CachedAgent = {
      code,
      username,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('[Norah] Failed to cache agent:', error);
  }
}

export async function buildNorahContext(): Promise<NorahContext> {
  // Try cache first for fast fallback
  const cached = getCachedAgent();
  
  try {
    // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
    // v6.6: Pass auth token to fix "missing sub claim" error
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
      console.warn('[Norah] No session token available');
      if (cached) {
        return {
          agent: { code: cached.code, username: cached.username },
          mission: null,
          stats: { clues: 0, buzz_today: 0, finalshot_today: 0 },
          clues: [],
          finalshot_recent: [],
          recent_msgs: []
        };
      }
      throw new Error('No authentication token');
    }
    
    const { data, error } = await supabase.functions.invoke('get-norah-context', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-client-version': 'norah-v6.6'
      }
    });

    if (error) {
      console.warn('[Norah] Edge function error:', error);
      
      // Use cache if available on 401/403/500
      if (cached) {
        console.log('[Norah] Using cached agent due to edge error');
        return {
          agent: { code: cached.code, username: cached.username },
          mission: null,
          stats: { clues: 0, buzz_today: 0, finalshot_today: 0 },
          clues: [],
          finalshot_recent: [],
          recent_msgs: []
        };
      }
      
      throw error;
    }

    // Normalize and ensure no undefined fields
    const normalized: NorahContext = {
      agent: {
        code: data?.agent?.code || cached?.code || 'AG-UNKNOWN',
        username: data?.agent?.username || cached?.username || null
      },
      mission: data?.mission || null,
      stats: {
        clues: data?.stats?.clues || 0,
        buzz_today: data?.stats?.buzz_today || 0,
        finalshot_today: data?.stats?.finalshot_today || 0
      },
      clues: data?.clues || [],
      finalshot_recent: data?.finalshot_recent || [],
      recent_msgs: data?.recent_msgs || []
    };

    // Cache agent code for future fast access
    if (normalized.agent.code && normalized.agent.code !== 'AG-UNKNOWN') {
      setCachedAgent(normalized.agent.code, normalized.agent.username);
    }

    return normalized;
  } catch (error) {
    console.error('[Norah] Context build failed:', error);
    
    // Fallback to cache or safe defaults
    return {
      agent: cached 
        ? { code: cached.code, username: cached.username }
        : { code: 'AG-UNKNOWN', username: null },
      mission: null,
      stats: { clues: 0, buzz_today: 0, finalshot_today: 0 },
      clues: [],
      finalshot_recent: [],
      recent_msgs: []
    };
  }
}
