/**
 * © 2025 Joseph MULÉ – M1SSION™ – Supabase Client for Mind Fractal
 */

import { supabase } from '@/integrations/supabase/client';

export interface MindFractalSession {
  id: string;
  user_id: string;
  seed: number;
  moves: number;
  time_spent: number;
  completion_ratio: number;
  created_at: string;
  updated_at: string;
}

export async function saveSession(
  seed: number,
  moves: number,
  timeSpent: number,
  completionRatio: number
): Promise<void> {
  const { error } = await supabase.rpc('upsert_dna_mind_fractal_session', {
    p_seed: seed,
    p_moves: moves,
    p_time_spent: Math.floor(timeSpent / 1000),
    p_completion_ratio: completionRatio
  });

  if (error) {
    console.error('Failed to save Mind Fractal session:', error);
    throw error;
  }
}

export async function loadUserSessions(userId: string): Promise<MindFractalSession[]> {
  const { data, error } = await supabase
    .from('dna_mind_fractal_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Failed to load Mind Fractal sessions:', error);
    return [];
  }

  return data || [];
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
