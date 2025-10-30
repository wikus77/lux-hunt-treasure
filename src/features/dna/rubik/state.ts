/**
 * Supabase state adapter for Rubik's Cube 4×4
 * Handles loading and saving cube state to database
 */

import { supabase } from '@/integrations/supabase/client';
import type { RubikState, Move } from './types';
import { createSolvedState, applyMove, generateScramble } from './Rubik4Core';

/**
 * Load user's cube state from Supabase
 * Returns null if no state exists (first time)
 */
export async function loadRubikState(): Promise<RubikState | null> {
  try {
    const { data, error } = await supabase.rpc('dna_get_rubik_state');
    
    if (error) {
      console.error('[Rubik] Error loading state:', error);
      return null;
    }

    if (!data || typeof data !== 'object') {
      return null;
    }

    // Parse saved state
    const parsedData = data as any;
    return {
      size: 4,
      cubies: parsedData?.state?.cubies || [],
      history: []
    };
  } catch (err) {
    console.error('[Rubik] Failed to load state:', err);
    return null;
  }
}

/**
 * Save cube state to Supabase
 */
export async function saveRubikState(
  state: RubikState,
  solved: boolean,
  scrambleSeed: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc('dna_set_rubik_state', {
      p_state: JSON.parse(JSON.stringify({ cubies: state.cubies })),
      p_solved: solved,
      p_scramble_seed: scrambleSeed
    });

    if (error) {
      console.error('[Rubik] Error saving state:', error);
      throw error;
    }
  } catch (err) {
    console.error('[Rubik] Failed to save state:', err);
    throw err;
  }
}

/**
 * Log a move to database
 */
export async function logMove(move: Move): Promise<void> {
  try {
    const { error } = await supabase.rpc('dna_log_rubik_move', {
      p_move: move
    });

    if (error) {
      console.error('[Rubik] Error logging move:', error);
    }
  } catch (err) {
    console.error('[Rubik] Failed to log move:', err);
  }
}

/**
 * Initialize state (load or create new scrambled state)
 */
export async function initializeRubikState(): Promise<{
  state: RubikState;
  scrambleSeed: string;
}> {
  // Try to load existing state
  const saved = await loadRubikState();
  
  if (saved && saved.cubies.length === 64) {
    return {
      state: saved,
      scrambleSeed: 'loaded'
    };
  }

  // Create new scrambled cube
  const scrambleSeed = Date.now().toString();
  const moves = generateScramble(30);
  
  let state = createSolvedState();
  for (const move of moves) {
    state = applyMove(state, move);
  }

  // Save initial state
  await saveRubikState(state, false, scrambleSeed);

  return {
    state,
    scrambleSeed
  };
}

/**
 * Debounced save helper
 */
let saveTimeout: NodeJS.Timeout | null = null;

export function debouncedSave(
  state: RubikState,
  solved: boolean,
  scrambleSeed: string,
  delay: number = 2000
): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveRubikState(state, solved, scrambleSeed).catch(console.error);
  }, delay);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
