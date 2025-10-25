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

interface ErrorResponse {
  code?: string;
  error?: string;
  hint?: string;
  details?: string;
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
    console.error('❌ Edge function error:', error);
    
    // Try to extract error details from response
    const errorData = (error as any).context?.body as ErrorResponse | undefined;
    const status = (error as any).status || (error as any).context?.status || 'n/a';
    const code = errorData?.code || (error as any).code || error.name || 'EDGE_ERROR';
    const hint = errorData?.hint || errorData?.error || error.message || 'Edge function returned non-2xx status';
    
    // Surface backend error with explicit context
    throw new Error(`${code} [${status}]: ${hint}`);
  }

  if (!data) {
    throw new Error('EMPTY_RESPONSE [500]: No data returned from edge function');
  }

  if (!data.success) {
    const errorCode = (data as any).code || 'BATTLE_FAILED';
    const errorHint = (data as any).error || (data as any).hint || 'Battle creation failed';
    throw new Error(`${errorCode}: ${errorHint}`);
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
    const errorData = (error as any).context?.body as ErrorResponse | undefined;
    const status = (error as any).status || 'n/a';
    const code = errorData?.code || (error as any).code || error.name || 'EDGE_ERROR';
    const hint = errorData?.hint || errorData?.error || error.message || 'Unknown error';
    throw new Error(`${code} [${status}]: ${hint}`);
  }

  if (!data?.success) {
    const errorCode = (data as any).code || 'ACCEPT_FAILED';
    const errorHint = (data as any).error || (data as any).hint || 'Battle accept failed';
    throw new Error(`${errorCode}: ${errorHint}`);
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
    const errorData = (error as any).context?.body as ErrorResponse | undefined;
    const status = (error as any).status || 'n/a';
    const code = errorData?.code || (error as any).code || error.name || 'EDGE_ERROR';
    const hint = errorData?.hint || errorData?.error || error.message || 'Unknown error';
    throw new Error(`${code} [${status}]: ${hint}`);
  }

  if (!data || !data.opponent_id) {
    const errorCode = (data as any)?.code || 'NO_OPPONENT_FOUND';
    const errorHint = (data as any)?.error || 'No eligible opponents available';
    throw new Error(`${errorCode}: ${errorHint}`);
  }

  return data;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
