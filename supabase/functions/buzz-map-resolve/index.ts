// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// BUZZ MAP RESOLVE - NEW CUSTOM EDGE FUNCTION (SERVER-AUTHORITATIVE)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BuzzMapRequest {
  lat: number;
  lng: number;
  debug?: boolean;
}

interface NextLevelResult {
  level: number;
  radius_km: number;
  cost_m1u: number;
}

interface SpendResult {
  success: boolean;
  spent: number;
  new_balance: number;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🗺️ buzz-map-resolve: Request received');
    console.log('🌍 SUPABASE_URL:', Deno.env.get('SUPABASE_URL'));
    console.log('🔑 SUPABASE_ANON_KEY present:', !!Deno.env.get('SUPABASE_ANON_KEY'));

    // Get Supabase client with SERVICE_ROLE_KEY (same pattern as handle-buzz-press)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from JWT (same pattern as handle-buzz-press)
    const authHeader = req.headers.get('Authorization');
    console.log('🔐 Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'unauthorized', message: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');
    console.log('🔑 JWT length:', jwt.length);
    
    // Get authenticated user with explicit JWT (same as handle-buzz-press)
    console.log('👤 Attempting to get user with JWT...');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    console.log('👤 getUser result:', { user: !!user, error: userError?.message });
    
    if (userError || !user) {
      console.error('❌ Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'unauthorized', message: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Parse request body
    const body: BuzzMapRequest = await req.json();
    const { lat, lng, debug = false } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      console.error('❌ Invalid coordinates:', { lat, lng });
      return new Response(
        JSON.stringify({ error: 'invalid_params', message: 'Invalid lat/lng coordinates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📍 Buzz Map request:', { user_id: user.id, lat, lng });

    // Step 1: Get next level from SERVER (authoritative pricing)
    const { data: nextLevelData, error: levelError } = await supabase.rpc('m1_get_next_buzz_level', {
      p_user_id: user.id,
    });

    if (levelError) {
      console.error('❌ Failed to get next level:', levelError);
      return new Response(
        JSON.stringify({ error: 'level_calculation_failed', message: levelError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const nextLevel = (Array.isArray(nextLevelData) ? nextLevelData[0] : nextLevelData) as NextLevelResult;
    
    // 🎯 CRITICAL FIX: Use cost_m1u instead of m1u (bug fix from legacy handle-buzz-map)
    const costM1U = nextLevel.cost_m1u;
    const radiusKm = nextLevel.radius_km;
    const level = nextLevel.level;

    console.log('📊 Next level calculated (server-authoritative):', { level, radiusKm, costM1U });

    // Step 2: Spend M1U using SERVER RPC (authoritative payment)
    const { data: spendData, error: spendError } = await supabase.rpc('buzz_map_spend_m1u', {
      p_user_id: user.id,
      p_cost_m1u: costM1U,
      p_latitude: lat,
      p_longitude: lng,
      p_radius_km: radiusKm,
    });

    if (spendError) {
      console.error('❌ Failed to spend M1U:', spendError);
      return new Response(
        JSON.stringify({ error: 'payment_failed', message: spendError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const spendResult = (Array.isArray(spendData) ? spendData[0] : spendData) as SpendResult;

    if (!spendResult.success) {
      console.error('❌ Insufficient M1U:', spendResult.error);
      return new Response(
        JSON.stringify({ 
          error: 'insufficient_m1u', 
          message: 'Saldo M1U insufficiente',
          required: costM1U,
          current: spendResult.new_balance
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ M1U spent successfully:', { spent: spendResult.spent, new_balance: spendResult.new_balance });

    // Step 3: Calculate current week
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - startOfYear.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const currentWeek = Math.ceil(diff / oneWeek);

    // Step 4: Insert into user_map_areas
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now
    
    const { data: areaData, error: areaError } = await supabase
      .from('user_map_areas')
      .insert({
        user_id: user.id,
        lat,
        lng,
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        level,
        price_eur: costM1U / 100, // Convert cents to EUR (M1U is in cents)
        source: 'buzz_map',
        week: currentWeek,
        active: true,
      })
      .select()
      .single();

    if (areaError) {
      console.error('❌ Failed to insert area:', areaError);
      return new Response(
        JSON.stringify({ error: 'area_creation_failed', message: areaError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Area created:', areaData.id);

    // Step 5: Log action in buzz_map_actions
    const { error: actionError } = await supabase
      .from('buzz_map_actions')
      .insert({
        user_id: user.id,
        cost_m1u: costM1U,
        cost_eur: costM1U / 100,
        radius_generated: radiusKm,
        clue_count: 0, // No clues generated in this flow
      });

    if (actionError) {
      console.warn('⚠️ Failed to log action (non-critical):', actionError);
    }

    // Step 6: Return success response with exact frontend-expected format
    const response = {
      success: true,
      mode: 'map',
      area: {
        id: areaData.id,
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        expires_at: expiresAt,
      },
      area_id: areaData.id,
      level,
      radius_km: radiusKm,
      price_eur: costM1U / 100,
      cost_m1u: costM1U,
      new_balance: spendResult.new_balance,
      week: currentWeek,
    };

    console.log('✅ buzz-map-resolve: Success', response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ buzz-map-resolve: Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'internal_error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
