// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { supabase } from '@/integrations/supabase/client';

/**
 * Mind Fractal Session Type
 */
export interface MindFractalSession {
  id: string;
  user_id: string;
  seed: number;
  moves: number;
  time_spent: number;
  completion_ratio: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch the current user's Mind Fractal session
 */
export async function fetchMindFractalSession(): Promise<MindFractalSession | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.warn('[useMindFractalSession] No authenticated user');
    return null;
  }
  
  // Using raw query as types may not be regenerated yet
  const { data, error } = await supabase
    .from('dna_mind_fractal_sessions' as any)
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('[useMindFractalSession] Error fetching session:', error);
    return null;
  }
  
  return (data || null) as unknown as MindFractalSession | null;
}

/**
 * Upsert Mind Fractal session via RPC
 * 
 * Example payload:
 * {
 *   p_seed: 42069,
 *   p_moves: 150,
 *   p_time_spent: 3600,
 *   p_completion_ratio: 0.75
 * }
 */
export async function upsertMindFractalSession(params: {
  seed: number;
  moves: number;
  time_spent: number;
  completion_ratio: number;
}): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'No authenticated user' };
  }
  
  // Clamp values
  const clampedParams = {
    p_seed: params.seed,
    p_moves: Math.max(0, params.moves),
    p_time_spent: Math.max(0, params.time_spent),
    p_completion_ratio: Math.max(0, Math.min(1, params.completion_ratio))
  };
  
  // Using raw RPC call as types may not be regenerated yet
  const { error } = await (supabase.rpc as any)('upsert_dna_mind_fractal_session', clampedParams);
  
  if (error) {
    console.error('[useMindFractalSession] Error upserting session:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
