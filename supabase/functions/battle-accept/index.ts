/**
 * TRON BATTLE - Accept Battle
 * Opponent accepts the battle challenge and enters ready state
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { battle_id } = await req.json();

    if (!battle_id) {
      return Response.json({ error: 'Missing battle_id' }, { status: 400, headers: corsHeaders });
    }

    // Get battle
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battle_id)
      .single();

    if (battleError || !battle) {
      return Response.json({ error: 'Battle not found' }, { status: 404, headers: corsHeaders });
    }

    // Validate opponent
    if (battle.opponent_id !== user.id) {
      return Response.json({ error: 'You are not the opponent' }, { status: 403, headers: corsHeaders });
    }

    if (battle.status !== 'pending') {
      return Response.json(
        { error: `Battle is ${battle.status}, cannot accept` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check ghost mode
    const { data: ghostMode } = await supabase
      .from('battle_ghost_mode')
      .select('ghost_mode_active, ghost_until')
      .eq('user_id', user.id)
      .single();

    if (ghostMode?.ghost_mode_active && ghostMode?.ghost_until && new Date(ghostMode.ghost_until) > new Date()) {
      return Response.json(
        { error: 'You are in ghost mode', ghost_until: ghostMode.ghost_until },
        { status: 403, headers: corsHeaders }
      );
    }

    // Check opponent has sufficient resources
    const { data: profile } = await supabase
      .from('profiles')
      .select('energy_fragments, buzz_count, clues_found')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404, headers: corsHeaders });
    }

    let availableAmount = 0;
    if (battle.stake_type === 'energy') availableAmount = profile.energy_fragments || 0;
    else if (battle.stake_type === 'buzz') availableAmount = profile.buzz_count || 0;
    else if (battle.stake_type === 'clue') availableAmount = profile.clues_found || 0;

    const requiredStake = parseFloat(battle.stake_amount);

    if (availableAmount < requiredStake) {
      return Response.json(
        { error: `Insufficient ${battle.stake_type} balance` },
        { status: 400, headers: corsHeaders }
      );
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
      return Response.json(
        { error: 'Failed to accept battle' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Log audit
    await supabase.from('battle_audit').insert({
      battle_id: battle.id,
      event_type: 'battle_accepted',
      user_id: user.id,
      payload: { accepted_at: new Date().toISOString() },
    });

    console.log(`✅ Battle accepted: ${battle_id} by ${user.id}`);

    return Response.json(
      { success: true, battle_id, status: 'accepted' },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
