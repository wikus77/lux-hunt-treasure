/**
 * TRON BATTLE - Random Opponent Picker
 * Returns a random eligible opponent for quick match
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract JWT from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ code: 'AUTH_REQUIRED', error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');

    // Create Supabase client with user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: `Bearer ${jwt}` },
      },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ Auth error:', userError);
      return new Response(
        JSON.stringify({ code: 'AUTH_REQUIRED', error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Call RPC to pick random opponent
    const { data: opponent, error: rpcError } = await supabase
      .rpc('pick_random_opponent', { p_me: user.id });

    if (rpcError) {
      console.error('❌ RPC error:', rpcError);
      return new Response(
        JSON.stringify({ code: 'NO_OPPONENT_FOUND', error: 'No eligible opponents available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!opponent || opponent.length === 0) {
      return new Response(
        JSON.stringify({ code: 'NO_OPPONENT_FOUND', error: 'No eligible opponents available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const selectedOpponent = Array.isArray(opponent) ? opponent[0] : opponent;

    console.log('✅ Random opponent selected:', selectedOpponent.id);

    return new Response(
      JSON.stringify({
        success: true,
        opponent_id: selectedOpponent.id,
        opponent_name: selectedOpponent.username || selectedOpponent.agent_code || 'Agent',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ code: 'INTERNAL_ERROR', error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
