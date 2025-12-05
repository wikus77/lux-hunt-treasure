/**
 * TRON BATTLE - Accept Battle
 * Opponent accepts the battle challenge and enters ready state
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { withCors } from "../_shared/cors.ts";

serve(withCors(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { battle_id } = await req.json();

    if (!battle_id) {
      return jsonResponse({ error: 'Missing battle_id' }, 400);
    }

    // Get battle
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battle_id)
      .single();

    if (battleError || !battle) {
      return jsonResponse({ error: 'Battle not found' }, 404);
    }

    // Validate opponent
    if (battle.opponent_id !== user.id) {
      return jsonResponse({ error: 'You are not the opponent' }, 403);
    }

    if (battle.status !== 'pending') {
      return jsonResponse({ error: `Battle is ${battle.status}, cannot accept` }, 400);
    }

    // Check ghost mode
    const { data: ghostMode } = await supabase
      .from('battle_ghost_mode')
      .select('ghost_mode_active, ghost_until')
      .eq('user_id', user.id)
      .single();

    if (ghostMode?.ghost_mode_active && ghostMode?.ghost_until && new Date(ghostMode.ghost_until) > new Date()) {
      return jsonResponse({ error: 'You are in ghost mode', ghost_until: ghostMode.ghost_until }, 403);
    }

    // Check opponent has sufficient resources
    const { data: profile } = await supabase
      .from('profiles')
      .select('energy_fragments, buzz_count, clues_found')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return jsonResponse({ error: 'Profile not found' }, 404);
    }

    let availableAmount = 0;
    if (battle.stake_type === 'energy') availableAmount = profile.energy_fragments || 0;
    else if (battle.stake_type === 'buzz') availableAmount = profile.buzz_count || 0;
    else if (battle.stake_type === 'clue') availableAmount = profile.clues_found || 0;

    const requiredStake = parseFloat(battle.stake_amount);

    if (availableAmount < requiredStake) {
      return jsonResponse({ error: `Insufficient ${battle.stake_type} balance` }, 400);
    }

    // Update battle to accepted
    const { error: updateError } = await supabase
      .from('battles')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', battle_id);

    if (updateError) {
      console.error('Battle update error:', updateError);
      return jsonResponse({ error: 'Failed to accept battle' }, 500);
    }

    // Log audit
    await supabase.from('battle_audit').insert({
      battle_id: battle.id,
      event_type: 'battle_accepted',
      user_id: user.id,
      payload: { accepted_at: new Date().toISOString() },
    });

    console.log(`✅ Battle accepted: ${battle_id} by ${user.id}`);

    return jsonResponse({ success: true, battle_id, status: 'accepted' }, 200);

  } catch (error) {
    console.error('Unexpected error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}));

// Helper function for JSON responses (CORS handled by withCors wrapper)
function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { 
    status, 
    headers: { 'Content-Type': 'application/json' }
  });
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
