/**
 * TRON BATTLE - Edge Function Invocation Helper
 * Handles JWT auth and explicit error surfacing
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { supabase } from '@/integrations/supabase/client';

interface CreateBattlePayload {
  opponent_handle?: string;
  opponent_id?: string;
  stake_type: 'energy' | 'buzz' | 'clue';
  stake_percentage: 25 | 50 | 75;
  arena_lat?: number;
  arena_lng?: number;
}

interface BattleResponse {
  success: boolean;
  battle_id: string;
  arena_name: string;
  stake_amount: number;
}

/**
 * Creates a new battle with JWT authentication and explicit error handling
 */
export async function createBattle(payload: CreateBattlePayload): Promise<BattleResponse> {
  // Get JWT token for authentication
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    throw new Error('Authentication required - please sign in');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const { data, error } = await supabase.functions.invoke('battle-create', {
    body: payload,
    headers,
  });

  // Supabase Functions returns {data, error}. If status is not 2xx, error is populated.
  if (error) {
    // Extract status code and message for explicit error reporting
    const status = (error as any).status || 'n/a';
    const code = (error as any).code || error.name || 'EdgeError';
    const message = error.message || 'Unknown error';
    
    // Surface backend error with full context
    throw new Error(`${code} [${status}]: ${message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Battle creation failed');
  }

  return data;
}

/**
 * Accepts a battle challenge
 */
export async function acceptBattle(battleId: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    throw new Error('Authentication required - please sign in');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const { data, error } = await supabase.functions.invoke('battle-accept', {
    body: { battle_id: battleId },
    headers,
  });

  if (error) {
    const status = (error as any).status || 'n/a';
    const code = (error as any).code || error.name || 'EdgeError';
    const message = error.message || 'Unknown error';
    throw new Error(`${code} [${status}]: ${message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Battle accept failed');
  }
}

/**
 * Gets a random eligible opponent for quick match
 */
export async function getRandomOpponent(): Promise<{ opponent_id: string; opponent_name: string }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    throw new Error('Authentication required - please sign in');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const { data, error } = await supabase.functions.invoke('battle-random-opponent', {
    headers,
  });

  if (error) {
    const status = (error as any).status || 'n/a';
    const code = (error as any).code || error.name || 'EdgeError';
    const message = error.message || 'Unknown error';
    throw new Error(`${code} [${status}]: ${message}`);
  }

  if (!data?.opponent_id) {
    throw new Error('No opponent found');
  }

  return data;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
