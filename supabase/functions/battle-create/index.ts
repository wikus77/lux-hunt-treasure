/**
 * TRON BATTLE - Create Battle
 * Creates a new PvP battle with stake escrow validation
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateBattleRequest {
  opponent_id?: string;
  opponent_handle?: string;
  stake_type: 'buzz' | 'clue' | 'energy';
  stake_percentage: 25 | 50 | 75;
  arena_lat?: number;
  arena_lng?: number;
}

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

    const body: CreateBattleRequest = await req.json();
    let { opponent_id, opponent_handle, stake_type, stake_percentage, arena_lat, arena_lng } = body;

    // Validation: must have opponent_id OR opponent_handle
    if (!opponent_id && !opponent_handle) {
      return Response.json(
        { 
          code: 'MISSING_OPPONENT',
          error: 'Provide opponent_id or opponent_handle',
          success: false 
        },
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!stake_type || !stake_percentage) {
      return Response.json(
        { 
          code: 'MISSING_FIELDS',
          error: 'Missing required fields: stake_type, stake_percentage',
          success: false 
        },
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve opponent_handle to opponent_id if needed
    if (!opponent_id && opponent_handle) {
      const { data: opponentProfile } = await supabase
        .from('profiles')
        .select('id')
        .or(`agent_code.ilike.${opponent_handle},display_name.ilike.${opponent_handle}`)
        .single();

      if (!opponentProfile) {
        return Response.json(
          { 
            code: 'OPPONENT_NOT_FOUND',
            error: `Opponent "${opponent_handle}" not found`,
            success: false 
          },
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      opponent_id = opponentProfile.id;
    }

    if (opponent_id === user.id) {
      return Response.json(
        { 
          code: 'SELF_BATTLE',
          error: 'Cannot battle yourself',
          success: false 
        },
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Get creator profile for stake calculation
    const { data: profile } = await supabase
      .from('profiles')
      .select('energy_fragments, buzz_count, clues_found')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return Response.json(
        { 
          code: 'PROFILE_NOT_FOUND',
          error: 'Profile not found',
          success: false 
        },
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate stake amount
    let availableAmount = 0;
    if (stake_type === 'energy') availableAmount = profile.energy_fragments || 0;
    else if (stake_type === 'buzz') availableAmount = profile.buzz_count || 0;
    else if (stake_type === 'clue') availableAmount = profile.clues_found || 0;

    const stakeAmount = Math.floor((availableAmount * stake_percentage) / 100);

    if (stakeAmount <= 0) {
      return Response.json(
        { 
          code: 'INSUFFICIENT_BALANCE',
          error: `Insufficient ${stake_type} balance. You have ${availableAmount}, need at least ${stake_percentage}% for stake.`,
          success: false 
        },
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate arena name if GPS provided
    let arenaName = 'TRON Arena';
    if (arena_lat && arena_lng) {
      const arenaId = Math.floor(Math.random() * 999);
      arenaName = `M1-Arena-${arenaId.toString().padStart(3, '0')}`;
    }

    // Create battle
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .insert({
        creator_id: user.id,
        opponent_id,
        stake_type,
        stake_amount: stakeAmount,
        stake_percentage,
        arena_name: arenaName,
        arena_lat,
        arena_lng,
        status: 'pending',
      })
      .select()
      .single();

    if (battleError) {
      console.error('Battle creation error:', battleError);
      return Response.json(
        { 
          code: 'DATABASE_ERROR',
          error: 'Failed to create battle',
          details: battleError.message,
          success: false 
        },
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log audit
    await supabase.from('battle_audit').insert({
      battle_id: battle.id,
      event_type: 'battle_created',
      user_id: user.id,
      payload: { stake_type, stake_amount: stakeAmount, stake_percentage },
    });

    console.log(`✅ Battle created: ${battle.id} by ${user.id}`);

    return Response.json(
      {
        success: true,
        battle_id: battle.id,
        arena_name: arenaName,
        stake_amount: stakeAmount,
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return Response.json(
      { 
        code: 'INTERNAL_ERROR',
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
