/**
 * TRON BATTLE - Tap Commit
 * Records player tap timestamp (server-side) for anti-cheat
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TapCommitRequest {
  battle_id: string;
  client_tap_at: string; // ISO timestamp from client
  ping_ms: number;
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

    const body: TapCommitRequest = await req.json();
    const { battle_id, client_tap_at, ping_ms } = body;

    if (!battle_id || !client_tap_at || ping_ms === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
    }

    // Server receives tap → record server timestamp
    const serverTapAt = new Date();

    // Get battle
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battle_id)
      .single();

    if (battleError || !battle) {
      return Response.json({ error: 'Battle not found' }, { status: 404, headers: corsHeaders });
    }

    // Validate participant
    if (battle.creator_id !== user.id && battle.opponent_id !== user.id) {
      return Response.json({ error: 'Not a participant' }, { status: 403, headers: corsHeaders });
    }

    if (battle.status !== 'active') {
      return Response.json(
        { error: `Battle is ${battle.status}, cannot tap` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Determine role
    const isCreator = battle.creator_id === user.id;

    // Check if already tapped
    if (isCreator && battle.creator_tap_at) {
      return Response.json({ error: 'Already tapped' }, { status: 400, headers: corsHeaders });
    }
    if (!isCreator && battle.opponent_tap_at) {
      return Response.json({ error: 'Already tapped' }, { status: 400, headers: corsHeaders });
    }

    // Calculate reaction time (server-side, compensated for ping)
    const flashTime = new Date(battle.flash_at);
    const reactionRaw = serverTapAt.getTime() - flashTime.getTime();
    const reactionCompensated = Math.max(0, reactionRaw - (ping_ms / 2)); // Median ping compensation

    // Update battle
    const updates: any = {};
    if (isCreator) {
      updates.creator_tap_at = serverTapAt.toISOString();
      updates.creator_reaction_ms = reactionCompensated;
      updates.creator_ping_ms = ping_ms;
    } else {
      updates.opponent_tap_at = serverTapAt.toISOString();
      updates.opponent_reaction_ms = reactionCompensated;
      updates.opponent_ping_ms = ping_ms;
    }

    const { error: updateError } = await supabase
      .from('battles')
      .update(updates)
      .eq('id', battle_id);

    if (updateError) {
      console.error('Tap commit error:', updateError);
      return Response.json(
        { error: 'Failed to record tap' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Insert participant record
    await supabase.from('battle_participants').insert({
      battle_id,
      user_id: user.id,
      role: isCreator ? 'creator' : 'opponent',
      tap_timestamp: serverTapAt.toISOString(),
      reaction_ms: reactionCompensated,
      ping_ms,
    });

    // Log audit
    await supabase.from('battle_audit').insert({
      battle_id,
      event_type: 'tap_commit',
      user_id: user.id,
      payload: {
        server_tap_at: serverTapAt.toISOString(),
        client_tap_at,
        reaction_ms: reactionCompensated,
        ping_ms,
      },
    });

    console.log(`⚡ Tap recorded: ${battle_id} - ${user.id} - ${reactionCompensated}ms`);

    return Response.json(
      {
        success: true,
        battle_id,
        reaction_ms: reactionCompensated,
        server_tap_at: serverTapAt.toISOString(),
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
