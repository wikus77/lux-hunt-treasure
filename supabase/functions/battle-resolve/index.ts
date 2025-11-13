/**
 * TRON BATTLE - Resolve Battle
 * Determines winner, executes atomic transfer, updates ghost mode
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

    if (battle.status === 'resolved') {
      return Response.json({ error: 'Battle already resolved' }, { status: 400, headers: corsHeaders });
    }

    // Check if both players tapped
    if (!battle.creator_tap_at || !battle.opponent_tap_at) {
      return Response.json(
        { error: 'Waiting for both players to tap' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Determine winner (lowest reaction time wins)
    let winnerId: string;
    let loserId: string;
    let winnerReaction: number;
    let loserReaction: number;

    if (battle.creator_reaction_ms < battle.opponent_reaction_ms) {
      winnerId = battle.creator_id;
      loserId = battle.opponent_id;
      winnerReaction = battle.creator_reaction_ms;
      loserReaction = battle.opponent_reaction_ms;
    } else {
      winnerId = battle.opponent_id;
      loserId = battle.creator_id;
      winnerReaction = battle.opponent_reaction_ms;
      loserReaction = battle.creator_reaction_ms;
    }

    // Atomic transfer
    const stakeAmount = parseFloat(battle.stake_amount);

    const { error: transferError } = await supabase
      .from('battle_transfers')
      .insert({
        battle_id,
        from_user_id: loserId,
        to_user_id: winnerId,
        transfer_type: battle.stake_type,
        amount: stakeAmount,
        metadata: {
          winner_reaction_ms: winnerReaction,
          loser_reaction_ms: loserReaction,
        },
      });

    if (transferError) {
      console.error('Transfer error:', transferError);
      return Response.json(
        { error: 'Failed to execute transfer' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Update battle as resolved
    const { error: updateError } = await supabase
      .from('battles')
      .update({
        status: 'resolved',
        winner_id: winnerId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', battle_id);

    if (updateError) {
      console.error('Battle resolve error:', updateError);
    }

    // Update participants with winner flag
    await supabase
      .from('battle_participants')
      .update({ is_winner: true })
      .eq('battle_id', battle_id)
      .eq('user_id', winnerId);

    // Phase 1.1: Update ghost mode for loser
    const { data: ghostMode } = await supabase
      .from('battle_ghost_mode')
      .select('*')
      .eq('user_id', loserId)
      .single();

    if (ghostMode) {
      const newLosses = (ghostMode.consecutive_losses || 0) + 1;
      const updates: any = {
        consecutive_losses: newLosses,
        last_loss_at: new Date().toISOString(),
      };

      if (newLosses >= 3) {
        const ghostUntil = new Date();
        ghostUntil.setHours(ghostUntil.getHours() + 24);
        updates.ghost_mode_active = true;
        updates.ghost_until = ghostUntil.toISOString();
      }

      await supabase
        .from('battle_ghost_mode')
        .update(updates)
        .eq('user_id', loserId);
    } else {
      await supabase.from('battle_ghost_mode').insert({
        user_id: loserId,
        consecutive_losses: 1,
        last_loss_at: new Date().toISOString(),
      });
    }

    // Reset winner's ghost mode losses
    await supabase
      .from('battle_ghost_mode')
      .upsert({
        user_id: winnerId,
        consecutive_losses: 0,
        ghost_mode_active: false,
        ghost_until: null,
      });

    // Phase 1.1: Create energy trace on map
    if (battle.arena_lat && battle.arena_lng) {
      await supabase.from('battle_energy_traces').insert({
        battle_id,
        winner_id: winnerId,
        start_lat: battle.arena_lat,
        start_lng: battle.arena_lng,
        end_lat: battle.arena_lat + (Math.random() * 0.001 - 0.0005),
        end_lng: battle.arena_lng + (Math.random() * 0.001 - 0.0005),
        intensity: 1.0,
      });
    }

    // Log audit
    await supabase.from('battle_audit').insert({
      battle_id,
      event_type: 'battle_resolved',
      user_id: winnerId,
      payload: {
        winner_id: winnerId,
        loser_id: loserId,
        winner_reaction_ms: winnerReaction,
        loser_reaction_ms: loserReaction,
        stake_transferred: stakeAmount,
      },
    });

    console.log(`🏆 Battle resolved: ${battle_id} - Winner: ${winnerId} (${winnerReaction}ms)`);

    // Phase 5: Send battle_resolved notifications to both participants
    try {
      const { data: winnerProfile } = await supabase
        .from('profiles')
        .select('agent_code, display_name')
        .eq('id', winnerId)
        .single();

      const { data: loserProfile } = await supabase
        .from('profiles')
        .select('agent_code, display_name')
        .eq('id', loserId)
        .single();

      const winnerName = winnerProfile?.agent_code || winnerProfile?.display_name || 'Winner';
      const loserName = loserProfile?.agent_code || loserProfile?.display_name || 'Loser';

      // Notification for winner
      await supabase.from('battle_notifications').insert({
        user_id_target: winnerId,
        type: 'battle_resolved',
        payload: {
          title: '🏆 Vittoria!',
          body: `Hai battuto ${loserName} - +${stakeAmount} ${battle.stake_type}`,
          url: '/map-3d-tiler',
          battle_id,
          result: 'win',
          role: battle.creator_id === winnerId ? 'creator' : 'opponent',
          reaction_ms: winnerReaction,
          stake_won: stakeAmount,
          stake_type: battle.stake_type,
        },
        dedupe_key: `${battle_id}_resolved_winner`,
      });

      // Notification for loser
      await supabase.from('battle_notifications').insert({
        user_id_target: loserId,
        type: 'battle_resolved',
        payload: {
          title: '⚔️ Battle conclusa',
          body: `${winnerName} ha vinto - -${stakeAmount} ${battle.stake_type}`,
          url: '/map-3d-tiler',
          battle_id,
          result: 'loss',
          role: battle.creator_id === loserId ? 'creator' : 'opponent',
          reaction_ms: loserReaction,
          stake_lost: stakeAmount,
          stake_type: battle.stake_type,
        },
        dedupe_key: `${battle_id}_resolved_loser`,
      });

      console.log(`📬 Battle resolved notifications queued for winner ${winnerId} and loser ${loserId}`);
    } catch (notifError) {
      console.error('⚠️ Failed to queue battle resolved notifications:', notifError);
      // Non-blocking error - battle resolution succeeded
    }

    return Response.json(
      {
        success: true,
        battle_id,
        winner_id: winnerId,
        winner_reaction_ms: winnerReaction,
        loser_reaction_ms: loserReaction,
        stake_transferred: stakeAmount,
      },
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
