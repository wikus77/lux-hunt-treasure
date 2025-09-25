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
      
      // Apply pricing table - Official BUZZ MAP pricing table
      const pricingTable = [
        { generation: 0, radiusKm: 500, priceEur: 4.99 },
        { generation: 1, radiusKm: 450, priceEur: 8.99 },
        { generation: 2, radiusKm: 405, priceEur: 8.99 },
        { generation: 3, radiusKm: 365, priceEur: 10.99 },
        { generation: 4, radiusKm: 329, priceEur: 12.99 },
        { generation: 5, radiusKm: 295, priceEur: 14.99 },
        { generation: 6, radiusKm: 265, priceEur: 16.99 },
        { generation: 7, radiusKm: 240, priceEur: 19.99 },
        { generation: 8, radiusKm: 216, priceEur: 29.99 },
        { generation: 9, radiusKm: 195, priceEur: 44.99 },
        { generation: 10, radiusKm: 175, priceEur: 69.99 },
        { generation: 11, radiusKm: 155, priceEur: 99.99 },
        { generation: 12, radiusKm: 140, priceEur: 129.99 },
        { generation: 13, radiusKm: 126, priceEur: 149.99 },
      ];
      
      // Get pricing for current generation (cap at max)
      const pricing = generation >= pricingTable.length 
        ? pricingTable[pricingTable.length - 1] 
        : pricingTable[generation];
      
      const radiusKm = Math.max(5, pricing.radiusKm); // Ensure minimum 5km
      
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