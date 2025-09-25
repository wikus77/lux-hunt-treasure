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
    // KILL-SWITCH per FREE override system
    const ENABLE = Deno.env.get("FREE_OVERRIDE_ENABLE") === "1";
    console.info('[FREE-OVERRIDE-SECURITY]', { enable: ENABLE, dryRun: false });

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

    // Check for FREE override
    step = 'free-check';
    console.info('[BUZZ] free-check', { user_id: user.id, enable: ENABLE });
    
    let freeOverride = null;
    if (ENABLE) {
      const { data: overrideData, error: overrideError } = await userClient.rpc('get_buzz_override');
      if (!overrideError && overrideData && overrideData.free_remaining > 0) {
        freeOverride = overrideData;
        console.info('[BUZZ] free-available', { user_id: user.id, remaining: freeOverride.free_remaining });
      }
    }

    // Determine if this is FREE or PAID request
    const isFreeRequest = !body.sessionId && !body.prizeId;
    const shouldUseFree = freeOverride && isFreeRequest && ENABLE;

    if (!shouldUseFree) {
      console.info('[BUZZ] no-free-override', { user_id: user.id, enable: ENABLE, hasOverride: !!freeOverride, isFreeRequest });
      
      // Check if this is a bypass attempt (no payment info provided)
      if (isFreeRequest) {
        const errorCode = !freeOverride || (freeOverride.free_remaining === 0) ? 'no_free_remaining' : 'bypass_rejected';
        console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 403, code: errorCode, user_id: user.id, step });
        return new Response(
          JSON.stringify({ success: false, code: errorCode }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
      
      // TODO: Validate payment (sessionId/prizeId) here for PAID flow
      // For now, continuing as if payment is valid
    }

    let result: any;
    
    if (generateMap) {
      // Handle BUZZ MAP generation
      step = 'map-generation';
      
      if (shouldUseFree) {
        // Consume FREE buzz
        step = 'free-consume';
        const { data: consumeResult, error: consumeError } = await userClient.rpc('consume_free_buzz');
        
        if (consumeError || !consumeResult?.success) {
          console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 409, code: 'consume_failed', user_id: user.id, step, error: consumeError?.message });
          return new Response(
            JSON.stringify({ success: false, code: 'consume_failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
          );
        }

        if (consumeResult.remaining === 0) {
          console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 403, code: 'no_free_remaining', user_id: user.id, step });
          return new Response(
            JSON.stringify({ success: false, code: 'no_free_remaining' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          );
        }
        
        console.info('[BUZZ] free-consumed', { user_id: user.id, left: consumeResult.remaining });
      }

      // RIUSA LA STESSA ROUTINE DEL PAID - Generate map area
      step = 'create-area';
      const mapCenter = coordinates || { lat: 41.9028, lng: 12.4964 }; // Default to Rome
      const radiusKm = Math.max(5, 500 * Math.pow(0.7, 0)); // Start with 500km radius
      
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

      console.info('[BUZZ] area-created', { user_id: user.id, area_id: area.id, mode: shouldUseFree ? 'free' : 'paid' });

      // ESATTAMENTE LO STESSO SHAPE DEL PAID FLOW
      result = {
        success: true,
        type: 'buzz_map',
        mode: shouldUseFree ? 'free' : 'paid',
        area: {
          id: area.id,
          center_lat: area.center_lat,
          center_lng: area.center_lng,
          radius_km: area.radius_km
        },
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        radius_km: radiusKm,
        generation_number: 1
      };

      // Add free_remaining if this is a free request
      if (shouldUseFree) {
        const { data: updatedOverride } = await userClient.rpc('get_buzz_override');
        if (updatedOverride) {
          result.free_remaining = updatedOverride.free_remaining;
        }
      }

    } else {
      // Handle normal BUZZ clue generation
      step = 'clue-generation';
      
      if (shouldUseFree) {
        // Consume FREE buzz
        step = 'free-consume';
        const { data: consumeResult, error: consumeError } = await userClient.rpc('consume_free_buzz');
        
        if (consumeError || !consumeResult?.success) {
          console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 409, code: 'consume_failed', user_id: user.id, step, error: consumeError?.message });
          return new Response(
            JSON.stringify({ success: false, code: 'consume_failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
          );
        }

        if (consumeResult.remaining === 0) {
          console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 403, code: 'no_free_remaining', user_id: user.id, step });
          return new Response(
            JSON.stringify({ success: false, code: 'no_free_remaining' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          );
        }
        
        console.info('[BUZZ] free-consumed', { user_id: user.id, left: consumeResult.remaining });
      }

      // Generate clue (simplified for now - TODO: integrate with actual clue generation)
      const sampleClues = [
        "Cerca vicino alle antiche mura della città",
        "Il tesoro si nasconde dove l'acqua scorre",
        "Guarda verso il cielo, ma non dimenticare la terra",
        "Tra le pietre del passato si cela il futuro"
      ];
      
      const randomClue = sampleClues[Math.floor(Math.random() * sampleClues.length)];
      
      // STESSA RESPONSE SHAPE DEL PAID
      result = {
        success: true,
        clue_text: randomClue,
        buzz_cost: shouldUseFree ? 0 : 1.99,
        mode: shouldUseFree ? 'free' : 'paid' // Solo aggiunta, non rimuove campi
      };
    }

    console.info('[BUZZ] success', { user_id: user.id, generateMap, mode: shouldUseFree ? 'free' : 'paid' });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[HANDLE-BUZZ-PRESS] FAIL', { status: 500, code: 'internal_error', user_id: user?.id, step, error: String(error?.message || error) });
    return new Response(
      JSON.stringify({ success: false, code: 'internal_error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})