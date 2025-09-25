// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let user: any = null;
  let step = 'init';

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get JWT token
    step = 'auth';
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 401, code: 'not_authenticated', user_id: null, step, error: 'Auth session missing!' });
      return new Response(
        JSON.stringify({ success: false, code: 'not_authenticated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create user client for RLS operations
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate user authentication
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 401, code: 'not_authenticated', user_id: null, step, error: userError?.message || 'Auth session missing!' });
      return new Response(
        JSON.stringify({ success: false, code: 'not_authenticated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    user = userData.user;
    console.info('[BUZZ] auth-success', { user_id: user.id });

    // Parse request body
    step = 'parse';
    const body = await req.json();
    console.info('[BUZZ] body-received', { 
      lat: body.coordinates?.lat, 
      lng: body.coordinates?.lng, 
      generateMap: body.generateMap,
      hasSessionId: !!body.sessionId,
      hasPrizeId: !!body.prizeId
    });

    const { userId, generateMap, coordinates } = body;

    // Validate required fields
    if (!userId || userId !== user.id) {
      console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 403, code: 'user_mismatch', user_id: user.id, step });
      return new Response(
        JSON.stringify({ success: false, code: 'user_mismatch' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Check daily quota FIRST (before any other logic)
    step = 'daily-quota-check';
    const { data: todayCount, error: countError } = await userClient.rpc('buzz_today_count', { p_user_id: user.id });
    
    if (countError) {
      console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 500, code: 'internal_error', user_id: user.id, step, error: countError.message });
      return new Response(
        JSON.stringify({ success: false, code: 'internal_error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (todayCount >= 5) {
      // Calculate next reset time (midnight Europe/Rome) - DST-aware  
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(now.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      
      // Apply Europe/Rome offset dynamically (UTC+1 winter, UTC+2 summer)
      const tempDate = new Date(tomorrow);
      tempDate.setMonth(6); // July to check DST
      const isDST = tempDate.getTimezoneOffset() < now.getTimezoneOffset();
      const romeOffset = isDST ? -2 : -1; // Negative because we need to subtract from UTC
      
      const resetAt = new Date(tomorrow.getTime() + (romeOffset * 60 * 60 * 1000));
      
      console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 429, code: 'daily_quota_exceeded', user_id: user.id, step, count: todayCount });
      return new Response(
        JSON.stringify({ 
          success: false, 
          code: 'daily_quota_exceeded',
          reset_at_iso: resetAt.toISOString(),
          current_count: todayCount,
          max_daily: 5
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Check if this is a bypass attempt (no payment info provided)
    // NOW WE REQUIRE PAYMENT INFO - NO MORE FREE PATH
    if (!body.sessionId && !body.prizeId) {
      console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 403, code: 'payment_required', user_id: user.id, step });
      return new Response(
        JSON.stringify({ success: false, code: 'payment_required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    let result: any;
    
    if (generateMap) {
      // Handle BUZZ MAP generation - PAID ONLY
      step = 'map-generation-paid';
      
      // TODO: Validate payment (sessionId/prizeId) here for PAID flow
      // For now, continuing as if payment is valid

      // Generate map area using NEW PRICING TABLE logic
      step = 'create-area';
      const mapCenter = coordinates || { lat: 41.9028, lng: 12.4964 }; // Default to Rome
      
      // Calculate generation based on existing areas
      const { count: existingAreas, error: countError } = await userClient
        .from('user_map_areas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('source', 'buzz_map');
      
      if (countError) {
        console.error('[HANDLE-BUZZ-PRESS] Error counting existing areas:', countError);
        throw new Error('Error counting existing areas');
      }
      
      const generation = existingAreas || 0;
      
      // Apply 60-level pricing table - Official BUZZ MAP pricing
      // Import pricing table constants (local copy to avoid dependencies)
      const BUZZ_MAP_LEVELS = [
        { level: 1, radiusKm: 500, priceCents: 499 },
        { level: 2, radiusKm: 450, priceCents: 599 },
        { level: 3, radiusKm: 405, priceCents: 699 },
        { level: 4, radiusKm: 365, priceCents: 799 },
        { level: 5, radiusKm: 328, priceCents: 899 },
        { level: 6, radiusKm: 295, priceCents: 999 },
        { level: 7, radiusKm: 266, priceCents: 999 },
        { level: 8, radiusKm: 239, priceCents: 999 },
        { level: 9, radiusKm: 215, priceCents: 999 },
        { level: 10, radiusKm: 194, priceCents: 999 },
        { level: 11, radiusKm: 174, priceCents: 1499 },
        { level: 12, radiusKm: 157, priceCents: 1599 },
        { level: 13, radiusKm: 141, priceCents: 1699 },
        { level: 14, radiusKm: 127, priceCents: 1799 },
        { level: 15, radiusKm: 114, priceCents: 1899 },
        { level: 16, radiusKm: 103, priceCents: 1999 },
        { level: 17, radiusKm: 93, priceCents: 2999 },
        { level: 18, radiusKm: 83, priceCents: 3099 },
        { level: 19, radiusKm: 75, priceCents: 3199 },
        { level: 20, radiusKm: 68, priceCents: 3299 },
        { level: 21, radiusKm: 61, priceCents: 3399 },
        { level: 22, radiusKm: 55, priceCents: 3499 },
        { level: 23, radiusKm: 49, priceCents: 4999 },
        { level: 24, radiusKm: 44, priceCents: 5099 },
        { level: 25, radiusKm: 40, priceCents: 5599 },
        { level: 26, radiusKm: 36, priceCents: 5999 },
        { level: 27, radiusKm: 32, priceCents: 6999 },
        { level: 28, radiusKm: 29, priceCents: 7999 },
        { level: 29, radiusKm: 26, priceCents: 8999 },
        { level: 30, radiusKm: 24, priceCents: 9999 },
        { level: 31, radiusKm: 21, priceCents: 11999 },
        { level: 32, radiusKm: 19, priceCents: 19999 },
        { level: 33, radiusKm: 17, priceCents: 24999 },
        { level: 34, radiusKm: 15, priceCents: 29999 },
        { level: 35, radiusKm: 14, priceCents: 34999 },
        { level: 36, radiusKm: 13, priceCents: 39999 },
        { level: 37, radiusKm: 11, priceCents: 44999 },
        { level: 38, radiusKm: 10, priceCents: 49999 },
        { level: 39, radiusKm: 9, priceCents: 54999 },
        { level: 40, radiusKm: 8, priceCents: 59999 },
        { level: 41, radiusKm: 6.5, priceCents: 69999 },
        { level: 42, radiusKm: 5.8, priceCents: 79999 },
        { level: 43, radiusKm: 5.25, priceCents: 89999 },
        { level: 44, radiusKm: 4.7, priceCents: 99999 },
        { level: 45, radiusKm: 4.25, priceCents: 109999 },
        { level: 46, radiusKm: 3.8, priceCents: 119999 },
        { level: 47, radiusKm: 3.45, priceCents: 129999 },
        { level: 48, radiusKm: 3.1, priceCents: 139999 },
        { level: 49, radiusKm: 2.8, priceCents: 149999 },
        { level: 50, radiusKm: 2.5, priceCents: 159999 },
        { level: 51, radiusKm: 2.25, priceCents: 179999 },
        { level: 52, radiusKm: 2.0, priceCents: 199999 },
        { level: 53, radiusKm: 1.8, priceCents: 249999 },
        { level: 54, radiusKm: 1.65, priceCents: 299999 },
        { level: 55, radiusKm: 1.5, priceCents: 349999 },
        { level: 56, radiusKm: 1.3, priceCents: 399999 },
        { level: 57, radiusKm: 1.2, priceCents: 499999 },
        { level: 58, radiusKm: 1.08, priceCents: 699999 },
        { level: 59, radiusKm: 1.0, priceCents: 899999 },
        { level: 60, radiusKm: 0.5, priceCents: 1499999 },
      ];
      
      // Calculate level (1-60) based on existing areas count
      const level = Math.min(generation + 1, 60);
      const pricing = BUZZ_MAP_LEVELS[level - 1];
      
      const radiusKm = Math.max(0.5, pricing.radiusKm); // Enforce minimum 0.5km radius
      const priceCents = pricing.priceCents;
      
      // Use service role for guaranteed write (same as paid flow)
      const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
      const { data: area, error: insErr } = await serviceClient
        .from('user_map_areas')
        .insert({
          user_id: user.id,
          center_lat: mapCenter.lat,
          center_lng: mapCenter.lng,
          radius_km: radiusKm,
          source: 'buzz_map',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insErr) {
        console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 500, code: 'internal_error', user_id: user.id, step, error: insErr.message });
        return new Response(
          JSON.stringify({ success: false, code: 'internal_error' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      console.info('[BUZZ] area-created', { user_id: user.id, area_id: area.id, mode: 'paid' });

      // PAID FLOW RESPONSE SHAPE
      result = {
        success: true,
        type: 'buzz_map',
        mode: 'paid',
        area: {
          id: area.id,
          center_lat: area.center_lat,
          center_lng: area.center_lng,
          radius_km: area.radius_km
        },
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        radius_km: radiusKm,
        level: level,
        price_cents: priceCents,
        price_eur: priceCents / 100,
        generation_number: generation + 1,
        daily_presses: todayCount + 1  // Optional field showing current daily count
      };

    } else {
      // Handle normal BUZZ clue generation - PAID ONLY
      step = 'clue-generation-paid';
      
      // TODO: Validate payment (sessionId/prizeId) here for PAID flow
      // For now, continuing as if payment is valid

      // Generate clue (simplified for now - TODO: integrate with actual clue generation)
      const sampleClues = [
        "Cerca vicino alle antiche mura della città",
        "Il tesoro si nasconde dove l'acqua scorre",
        "Guarda verso il cielo, ma non dimenticare la terra",
        "Tra le pietre del passato si cela il futuro"
      ];
      
      const randomClue = sampleClues[Math.floor(Math.random() * sampleClues.length)];
      
      // PAID RESPONSE SHAPE
      result = {
        success: true,
        clue_text: randomClue,
        buzz_cost: 1.99,
        mode: 'paid',
        daily_presses: todayCount + 1  // Optional field showing current daily count
      };
    }

    // Increment daily counter AFTER successful operation
    step = 'increment-daily-count';
    const { data: newCount, error: incError } = await userClient.rpc('inc_buzz_today', { p_user_id: user.id });
    
    if (incError) {
      console.error('[HANDLE-BUZZ-PRESS] WARNING: Failed to increment daily count', { user_id: user.id, error: incError.message });
      // Don't fail the request, just log the warning
    } else {
      console.info('[BUZZ] daily-count-incremented', { user_id: user.id, new_count: newCount });
      // Update the result with the actual new count
      result.daily_presses = newCount;
    }

    console.info('[BUZZ] success', { user_id: user.id, generateMap, mode: 'paid' });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 500, code: 'internal_error', user_id: user?.id, step, error: String(error?.message || error) });
    return new Response(
      JSON.stringify({ success: false, code: 'internal_error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})