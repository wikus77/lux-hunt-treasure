// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'
import { withCors } from '../_shared/cors.ts';

// 🔍 Debug switch (controlled by ENV)
const DEBUG = Deno.env.get('DEBUG_BUZZ_MAP') === '1';
const dlog = (...args: unknown[]) => { if (DEBUG) console.log(...args); };

serve(withCors(async (req: Request): Promise<Response> => {
  // Debug/trace flags
  const wantsDebug = req.headers.get('x-m1-debug') === '1' || Deno.env.get('DEBUG_PANELS') === 'true';
  const wantsTrace = req.headers.get('x-debug') === '1';
  const origin = req.headers.get('origin') || null;

  try {
    console.log('🗺️ [HANDLE-BUZZ-MAP] Function started');
    console.log('[DEPLOY] handle-buzz-map build:', new Date().toISOString());

    // TRACE: Request metadata
    if (wantsTrace) {
      console.log('[TRACE] Origin:', origin);
      console.log('[TRACE] Method:', req.method);
      console.log('[TRACE] Headers:', {
        authorization: !!req.headers.get('Authorization'),
        'x-client-info': req.headers.get('x-client-info'),
        'content-type': req.headers.get('content-type')
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    const sawAuth = !!authHeader;
    const jwtLen = sawAuth ? authHeader!.replace('Bearer ', '').length : 0;
    
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error('❌ [HANDLE-BUZZ-MAP] Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('👤 [HANDLE-BUZZ-MAP] User authenticated:', user.id);

    // Parse request body with detailed logging
    let rawBody: any;
    try {
      // 🔥 CRITICAL FIX: Read body as text first to debug
      const bodyText = await req.text();
      console.log('📦 [HANDLE-BUZZ-MAP] Raw body text:', bodyText.substring(0, 500));
      
      if (!bodyText || bodyText.trim() === '') {
        console.error('❌ [HANDLE-BUZZ-MAP] Empty request body');
        return jsonResponse({ 
          success: false, 
          error: true,
          errorMessage: 'Request body is empty' 
        }, 400);
      }

      rawBody = JSON.parse(bodyText);
      console.log('✅ [HANDLE-BUZZ-MAP] Body parsed successfully:', {
        keys: Object.keys(rawBody),
        hasCoordinates: !!rawBody.coordinates,
        hasUserId: !!(rawBody.userId || rawBody.user_id)
      });
    } catch (parseError: any) {
      console.error('❌ [HANDLE-BUZZ-MAP] JSON parse error:', parseError.message);
      return jsonResponse({ 
        success: false, 
        error: true,
        errorMessage: 'Invalid JSON in request body: ' + parseError.message 
      }, 400);
    }

    const userId = rawBody.userId ?? rawBody.user_id ?? user.id;
    const body = { ...rawBody, userId };
    const { coordinates: rawCoordinates } = body;
    
    console.log('🔍 [HANDLE-BUZZ-MAP] Parsed coordinates:', rawCoordinates);
    
    // 🔥 FIX: Normalize coordinates with strict validation
    function normalizeCoordinates(c: any): { lat: number; lng: number } | null {
      if (!c) return null;
      const lat = Number(Array.isArray(c) ? c[0] : c.lat);
      const lng = Number(Array.isArray(c) ? c[1] : c.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
      return { lat, lng };
    }
    
    const coordinates = normalizeCoordinates(rawCoordinates);
    
    if (!coordinates) {
      console.error('❌ [HANDLE-BUZZ-MAP] Invalid or missing coordinates:', {
        raw: rawCoordinates,
        normalized: coordinates
      });
      return jsonResponse({ 
        success: false, 
        error: true,
        errorMessage: 'Valid coordinates are required for BUZZ MAP. Please ensure lat/lng are provided.' 
      }, 400);
    }
    
    // TRACE: Payload
    if (wantsTrace) {
      console.log('[TRACE] userId:', userId);
      console.log('[TRACE] rawCoordinates:', rawCoordinates);
      console.log('[TRACE] normalizedCoordinates:', coordinates);
    }
    
    dlog('[DBG] Processing BUZZ MAP request', {
      hasCoords: !!coordinates,
      coords: coordinates
    });
    
    console.log('🗺️ [HANDLE-BUZZ-MAP] Processing BUZZ MAP generation (SERVER-AUTHORITATIVE)');
    
    // 🔥 SERVER-AUTHORITATIVE: Use RPC to get next level
    dlog('[DBG] Calling RPC m1_get_next_buzz_level...');
    const { data: nextLevel, error: levelError } = await supabase
      .rpc('m1_get_next_buzz_level', { p_user_id: user.id })
      .single();

    if (levelError || !nextLevel) {
      console.error('❌ [HANDLE-BUZZ-MAP] RPC m1_get_next_buzz_level error:', levelError);
      throw new Error('Failed to compute next level: ' + (levelError?.message || 'No data'));
    }

    const level = nextLevel.level;
    const radius_km = nextLevel.radius_km;
    const costM1U = nextLevel.m1u;
    const currentWeek = nextLevel.current_week;

    dlog('[DBG] SERVER-CALCULATED pricing (RPC):', {
      source: 'rpc_server',
      currentWeek: nextLevel.current_week,
      currentCount: nextLevel.current_count,
      nextLevel: level,
      radiusKm: radius_km,
      costM1U: costM1U
    });
    
    // 🔥 SERVER-AUTHORITATIVE: Spend M1U using server-calculated cost
    console.log('💎 [HANDLE-BUZZ-MAP] Calling RPC to spend M1U...');
    const { data: spendResult, error: spendError } = await supabase.rpc('buzz_map_spend_m1u', {
      p_user_id: user.id,
      p_cost_m1u: costM1U,
      p_latitude: coordinates.lat,
      p_longitude: coordinates.lng,
      p_radius_km: radius_km
    });
    
    if (spendError) {
      console.error('❌ [HANDLE-BUZZ-MAP] M1U payment error:', spendError);
      throw new Error('M1U payment failed: ' + spendError.message);
    }
    
    if (!spendResult?.success) {
      const errorType = spendResult?.error || 'unknown';
      console.error('❌ [HANDLE-BUZZ-MAP] M1U payment rejected:', { error: errorType });
      throw new Error('M1U payment rejected: ' + errorType);
    }
    
    console.log('✅ [HANDLE-BUZZ-MAP] M1U spent successfully:', {
      spent: spendResult.spent,
      newBalance: spendResult.new_balance
    });
    
    // Create the map area with weekly counter (using RPC values)
    const { data: mapArea, error: mapError } = await supabase
      .from('user_map_areas')
      .insert({
        user_id: user.id,
        lat: coordinates.lat,
        lng: coordinates.lng,
        center_lat: coordinates.lat,
        center_lng: coordinates.lng,
        radius_km: radius_km,
        source: 'buzz_map',
        level: level,
        price_eur: costM1U / 10,
        week: currentWeek
      })
      .select()
      .single();
      
    if (mapError) {
      console.error('❌ [HANDLE-BUZZ-MAP] Error creating map area:', mapError);
      throw new Error('Failed to create map area');
    }
    
    // ✅ Stable log: MAP area created successfully
    console.log('[BUZZ-MAP] area created', { 
      area_id: mapArea?.id, 
      level, 
      radius_km, 
      week: currentWeek 
    });
    
    // Log the action (using RPC values)
    const { error: actionError } = await supabase
      .from('buzz_map_actions')
      .insert({
        user_id: user.id,
        clue_count: level,
        cost_eur: costM1U / 10,
        radius_generated: radius_km
      });
      
    if (actionError) {
      console.error('❌ [HANDLE-BUZZ-MAP] Error logging action:', actionError);
    }
    
    const response = {
      success: true,
      mode: 'map',
      area: {
        id: mapArea.id,
        center_lat: coordinates.lat,
        center_lng: coordinates.lng,
        radius_km: radius_km,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      area_id: mapArea.id,
      level: level,
      radius_km: radius_km,
      price_eur: costM1U / 10,
      cost_m1u: costM1U,
      new_balance: spendResult.new_balance,
      week: currentWeek
    };

    // Add debug block if requested
    const debugBlock = wantsDebug ? {
      sawAuthorizationHeader: sawAuth,
      jwtLen,
      requestOrigin: origin,
      allowedOrigin: origin,
      userId: user.id.substring(0, 8) + '...',
      flow: 'BUZZ_MAP'
    } : undefined;

    const responseBody = wantsDebug ? { ...response, __debug: debugBlock } : response;
    
    console.log('🎉 [HANDLE-BUZZ-MAP] Function completed successfully');
    
    return jsonResponse(responseBody, 200);

  } catch (error: any) {
    console.error('❌ [HANDLE-BUZZ-MAP] Function error:', error);
    console.error('❌ [HANDLE-BUZZ-MAP] Error stack:', error.stack);
    
    const debugBlock = wantsDebug ? {
      sawAuthorizationHeader: !!req.headers.get('Authorization'),
      requestOrigin: origin,
      error: error.message,
      errorType: error.name
    } : undefined;

    const errorResponse = {
      success: false, 
      error: true,
      errorMessage: error.message || 'Internal server error',
      ...(wantsDebug && { __debug: debugBlock })
    };

    const statusCode = error.message?.includes('Unauthorized') ? 401 : 
                       error.message?.includes('insufficient') ? 402 : 
                       error.message?.includes('coordinates') ? 400 : 500;

    return jsonResponse(errorResponse, statusCode);
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
