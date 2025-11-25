// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// BUZZ MAP RESOLVE - SERVER-AUTHORITATIVE EDGE FUNCTION

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'
import { withCors } from '../_shared/cors.ts'

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

serve(withCors(async (req: Request): Promise<Response> => {
  try {
    console.log('🗺️ [BUZZ-MAP-RESOLVE] Function started');
    console.log('[DEPLOY] buzz-map-resolve build:', new Date().toISOString());

    // Initialize Supabase client (same pattern as handle-buzz-press)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT (same pattern as handle-buzz-press)
    const authHeader = req.headers.get('Authorization');
    
    // 🔍 DIAGNOSTIC TRACE (as requested in task)
    console.log('BUZZ_MAP_AUTH_TRACE', {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 20),
      authHeaderLength: authHeader?.length,
      supabaseUrl,
      usingServiceRole: !!supabaseKey,
      serviceRoleKeyPrefix: supabaseKey?.substring(0, 20)
    });
    
    if (!authHeader) {
      console.error('❌ [BUZZ-MAP-RESOLVE] Missing authorization header');
      throw new Error('Missing authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    
    console.log('BUZZ_MAP_JWT_EXTRACTED', {
      jwtLength: jwt.length,
      jwtPrefix: jwt.substring(0, 20),
      jwtSuffix: jwt.substring(jwt.length - 20)
    });
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    // 🔍 DIAGNOSTIC TRACE (as requested in task)
    console.log('BUZZ_MAP_AUTH_USER_RESULT', {
      hasUser: !!user,
      userId: user?.id,
      hasError: !!userError,
      errorMessage: userError?.message,
      errorName: userError?.name
    });
    
    if (userError || !user) {
      console.error('❌ [BUZZ-MAP-RESOLVE] Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('👤 [BUZZ-MAP-RESOLVE] User authenticated:', user.id);

    // Parse request body
    const body: BuzzMapRequest = await req.json();
    const { lat, lng, debug = false } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      console.error('❌ [BUZZ-MAP-RESOLVE] Invalid coordinates:', { lat, lng });
      throw new Error('Invalid lat/lng coordinates');
    }

    console.log('📍 [BUZZ-MAP-RESOLVE] Processing request:', { user_id: user.id, lat, lng });

    // Step 1: Get next level from SERVER (authoritative pricing) - same pattern as handle-buzz-press
    console.log('🔄 [BUZZ-MAP-RESOLVE] Calling RPC m1_get_next_buzz_level...');
    const { data: nextLevelData, error: levelError } = await supabase
      .rpc('m1_get_next_buzz_level', { p_user_id: user.id })
      .single();

    if (levelError || !nextLevelData) {
      console.error('❌ [BUZZ-MAP-RESOLVE] RPC m1_get_next_buzz_level error:', levelError);
      throw new Error('Failed to compute next level: ' + (levelError?.message || 'No data'));
    }

    const level = nextLevelData.level;
    const radiusKm = nextLevelData.radius_km;
    const costM1U = nextLevelData.cost_m1u;
    
    // Calculate current week (RPC doesn't return it)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - startOfYear.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const currentWeek = Math.ceil(diff / oneWeek);

    console.log('📊 [BUZZ-MAP-RESOLVE] Server-calculated pricing:', { level, radiusKm, costM1U, currentWeek });

    // Step 2: Spend M1U using SERVER RPC (authoritative payment) - same pattern as handle-buzz-press
    console.log('💎 [BUZZ-MAP-RESOLVE] Calling RPC to spend M1U...');
    const { data: spendResult, error: spendError } = await supabase.rpc('buzz_map_spend_m1u', {
      p_user_id: user.id,
      p_cost_m1u: costM1U,
      p_latitude: lat,
      p_longitude: lng,
      p_radius_km: radiusKm
    });
    
    if (spendError) {
      console.error('❌ [BUZZ-MAP-RESOLVE] M1U payment error:', spendError);
      throw new Error('M1U payment failed: ' + spendError.message);
    }
    
    if (!spendResult?.success) {
      const errorType = spendResult?.error || 'unknown';
      console.error('❌ [BUZZ-MAP-RESOLVE] M1U payment rejected:', { error: errorType });
      throw new Error('M1U payment rejected: ' + errorType);
    }
    
    console.log('✅ [BUZZ-MAP-RESOLVE] M1U spent successfully:', {
      spent: spendResult.spent,
      newBalance: spendResult.new_balance
    });

    // Step 3: Create the map area with weekly counter (using RPC values) - same pattern as handle-buzz-press
    const { data: mapArea, error: mapError } = await supabase
      .from('user_map_areas')
      .insert({
        user_id: user.id,
        lat,
        lng,
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        source: 'buzz_map',
        level: level,
        price_eur: costM1U / 100, // M1U to EUR conversion
        week: currentWeek
      })
      .select()
      .single();
      
    if (mapError) {
      console.error('❌ [BUZZ-MAP-RESOLVE] Error creating map area:', mapError);
      throw new Error('Failed to create map area');
    }
    
    console.log('[BUZZ-MAP] area created', { 
      area_id: mapArea?.id, 
      level, 
      radius_km: radiusKm, 
      week: currentWeek 
    });
    
    // Step 4: Log the action (using RPC values)
    const { error: actionError } = await supabase
      .from('buzz_map_actions')
      .insert({
        user_id: user.id,
        clue_count: level,
        cost_eur: costM1U / 100, // M1U to EUR conversion
        radius_generated: radiusKm
      });
      
    if (actionError) {
      console.error('❌ [BUZZ-MAP-RESOLVE] Error logging action:', actionError);
    }
    
    // Step 5: Return success response (same format as handle-buzz-press)
    const response = {
      success: true,
      mode: 'map',
      area: {
        id: mapArea.id,
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      area_id: mapArea.id,
      level: level,
      radius_km: radiusKm,
      price_eur: costM1U / 100, // M1U to EUR conversion
      cost_m1u: costM1U,
      new_balance: spendResult.new_balance,
      week: currentWeek
    };

    console.log('🎉 [BUZZ-MAP-RESOLVE] Function completed successfully:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ [BUZZ-MAP-RESOLVE] Function error:', error);
    
    const errorResponse = { 
      success: false, 
      error: 'Internal error', 
      detail: String(error?.message || error) 
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}));

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
