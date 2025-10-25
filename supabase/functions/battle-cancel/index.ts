/**
 * TRON BATTLE - Cancel Battle
 * Allows creator to cancel pending battles (no stakes transferred)
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

    // Only creator can cancel
    if (battle.creator_id !== user.id) {
      return Response.json({ error: 'Only creator can cancel' }, { status: 403, headers: corsHeaders });
    }

    // Can only cancel pending or accepted (before countdown)
    if (!['pending', 'accepted'].includes(battle.status)) {
      return Response.json(
        { error: `Cannot cancel battle with status: ${battle.status}` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Update battle status
    const { error: updateError } = await supabase
      .from('battles')
      .update({ status: 'cancelled' })
      .eq('id', battle_id);

    if (updateError) {
      console.error('Cancel error:', updateError);
      return Response.json(
        { error: 'Failed to cancel battle' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Log audit
    await supabase.from('battle_audit').insert({
      battle_id,
      event_type: 'battle_cancelled',
      user_id: user.id,
      payload: { cancelled_at: new Date().toISOString() },
    });

    console.log(`❌ Battle cancelled: ${battle_id} by ${user.id}`);

    return Response.json(
      { success: true, battle_id, status: 'cancelled' },
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
