/**
 * TRON BATTLE - Ready Signal
 * Both players signal ready → triggers countdown → flash
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

    // Validate participant
    if (battle.creator_id !== user.id && battle.opponent_id !== user.id) {
      return Response.json({ error: 'Not a participant' }, { status: 403, headers: corsHeaders });
    }

    if (battle.status !== 'accepted') {
      return Response.json(
        { error: `Battle is ${battle.status}, cannot ready` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Transition to countdown → active (server-controlled timing)
    const countdownDuration = 3000; // 3 seconds
    const flashDelay = Math.floor(Math.random() * 2000) + 2000; // 2-4 seconds after countdown

    const now = new Date();
    const countdownStart = new Date(now.getTime() + 500); // Start in 500ms
    const flashTime = new Date(countdownStart.getTime() + countdownDuration + flashDelay);

    const { error: updateError } = await supabase
      .from('battles')
      .update({
        status: 'countdown',
        countdown_start_at: countdownStart.toISOString(),
        flash_at: flashTime.toISOString(),
      })
      .eq('id', battle_id);

    if (updateError) {
      console.error('Battle ready update error:', updateError);
      return Response.json(
        { error: 'Failed to start countdown' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Auto-transition to active after countdown
    setTimeout(async () => {
      await supabase
        .from('battles')
        .update({ status: 'active' })
        .eq('id', battle_id);
      
      console.log(`⚡ Battle ${battle_id} is now ACTIVE (flash at ${flashTime.toISOString()})`);
    }, countdownDuration + 500);

    // Log audit
    await supabase.from('battle_audit').insert({
      battle_id: battle.id,
      event_type: 'battle_ready',
      user_id: user.id,
      payload: {
        countdown_start_at: countdownStart.toISOString(),
        flash_at: flashTime.toISOString(),
      },
    });

    console.log(`✅ Battle ready: ${battle_id} - countdown starts at ${countdownStart.toISOString()}`);

    return Response.json(
      {
        success: true,
        battle_id,
        status: 'countdown',
        countdown_start_at: countdownStart.toISOString(),
        flash_at: flashTime.toISOString(),
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
