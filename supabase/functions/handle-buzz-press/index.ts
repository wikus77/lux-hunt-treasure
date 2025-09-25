// © 2025 Joseph MULÉ – M1SSION™ – Handle BUZZ Press Edge Function
// Supports both normal BUZZ and BUZZ FREE override system

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BuzzRequest {
  userId: string;
  generateMap: boolean;
  coordinates?: { lat: number; lng: number };
  prizeId?: string;
  sessionId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security controls for FREE Override system
    const ENABLE_FREE_OVERRIDE = Deno.env.get("FREE_OVERRIDE_ENABLE") === "1";
    const url = new URL(req.url);
    const DRY_RUN = url.searchParams.get("dryRun") === "true";
    
    console.log('[FREE-OVERRIDE-SECURITY]', { enable: ENABLE_FREE_OVERRIDE, dryRun: DRY_RUN });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get JWT token and validate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[BUZZ-PRESS] No authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create client with user's JWT for RLS policies
    const supabaseAnon = createClient(
      supabaseUrl, 
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Parse request body
    let body: BuzzRequest;
    try {
      body = await req.json();
    } catch (error) {
      console.error('[BUZZ-PRESS] Invalid JSON body:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { userId, generateMap, coordinates } = body;

    console.log('[BUZZ-PRESS] Processing request:', {
      userId,
      generateMap,
      hasCoordinates: !!coordinates,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing userId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check for BUZZ FREE override using user context
    console.log('[BUZZ-PRESS] Checking for FREE override...');
    const { data: overrideData, error: overrideError } = await supabaseAnon
      .rpc('get_buzz_override');

    let hasFreeOverride = false;
    let freeRemaining = 0;
    const isFreeRequest = !body.sessionId && !body.prizeId && userId === '495246c1-9154-4f01-a428-7f37fe230180';

    // Security check: Se richiesta FREE ma feature disabilitata → forza flusso paid
    if (isFreeRequest && !ENABLE_FREE_OVERRIDE) {
      console.log('[FREE-OVERRIDE-SECURITY] FREE request detected but feature disabled, forcing paid flow');
      // Comportati come flusso paid normale - nessun bypass, nessun errore speciale
      hasFreeOverride = false;
    } else if (!overrideError && overrideData && ENABLE_FREE_OVERRIDE) {
      console.log('[BUZZ-PRESS] Override RPC result:', overrideData);
      if (overrideData.free_remaining > 0) {
        hasFreeOverride = true;
        freeRemaining = overrideData.free_remaining;
        console.log('[FREE-OVERRIDE] Active override found:', { 
          freeRemaining, 
          cooldownDisabled: overrideData.cooldown_disabled,
          enableFlag: ENABLE_FREE_OVERRIDE,
          dryRun: DRY_RUN
        });
      }
    } else {
      console.log('[BUZZ-PRESS] No override or error:', overrideError);
    }

    // If no FREE override, require payment validation (paid flow)
    if (!hasFreeOverride) {
      console.log('[BUZZ-PRESS] No FREE override, payment validation required');
      
      // Check if this is a bypass attempt (no payment tokens provided)
      if (!body.sessionId && !body.prizeId) {
        console.error('[BUZZ-PRESS] Bypass attempt rejected - no payment info provided');
        return new Response(
          JSON.stringify({ success: false, error: 'bypass_rejected', code: 'PAYMENT_REQUIRED' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    }

    let result;
    
    if (generateMap) {
      // Handle BUZZ MAP generation
      console.log('[BUZZ-PRESS] Processing BUZZ MAP generation');
      
      if (hasFreeOverride) {
        // DRY RUN: test senza scrivere su DB
        if (DRY_RUN) {
          console.log('[FREE-OVERRIDE] DRY RUN mode - not consuming free buzz or creating map area');
          return new Response(
            JSON.stringify({ 
              success: true, 
              mode: "free", 
              dryRun: true,
              freeRemaining: freeRemaining,
              message: "Dry run successful - enable FREE_OVERRIDE_ENABLE and remove dryRun to activate"
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Consume FREE buzz using user context
        console.log('[FREE-OVERRIDE] Consuming free buzz...');
        const { data: consumeResult, error: consumeError } = await supabaseAnon
          .rpc('consume_free_buzz');
          
        if (consumeError || !consumeResult?.success) {
          console.error('[FREE-OVERRIDE] Failed to consume free buzz:', consumeError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to consume free buzz' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        console.log('[FREE-OVERRIDE] Successfully consumed free buzz, remaining:', consumeResult.remaining);
      }

      // Generate map area
      const mapCenter = coordinates || { lat: 41.9028, lng: 12.4964 }; // Default to Rome
      const radius = Math.max(5, 500 * Math.pow(0.7, 0)); // Start with 500km radius
      const currentWeek = Math.ceil((Date.now() - new Date('2025-01-20').getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      // Insert user_map_areas record using service role for guaranteed write
      const { data: mapAreaData, error: mapAreaError } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: userId,
          center_lat: mapCenter.lat,
          center_lng: mapCenter.lng,
          radius_km: radius,
          week_number: currentWeek
        })
        .select()
        .single();

      if (mapAreaError) {
        console.error('[BUZZ-PRESS] Error creating map area:', mapAreaError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create map area' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      console.log('[BUZZ-PRESS] Map area created successfully:', mapAreaData);

      result = {
        success: true,
        map_area: {
          lat: mapCenter.lat,
          lng: mapCenter.lng,
          radius_km: radius,
          week: currentWeek
        },
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        radius_km: radius,
        generation_number: 1
      };

    } else {
      // Handle normal BUZZ clue generation
      console.log('[BUZZ-PRESS] Processing normal BUZZ clue generation');
      
      if (hasFreeOverride) {
        // DRY RUN: test senza scrivere su DB
        if (DRY_RUN) {
          console.log('[FREE-OVERRIDE] DRY RUN mode - not consuming free buzz');
          return new Response(
            JSON.stringify({ 
              success: true, 
              mode: "free", 
              dryRun: true,
              freeRemaining: freeRemaining,
              clue_text: "DRY RUN - Cerca vicino alle antiche mura della città",
              message: "Dry run successful - enable FREE_OVERRIDE_ENABLE and remove dryRun to activate"
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Consume FREE buzz using user context
        console.log('[FREE-OVERRIDE] Consuming free buzz...');
        const { data: consumeResult, error: consumeError } = await supabaseAnon
          .rpc('consume_free_buzz');
          
        if (consumeError || !consumeResult?.success) {
          console.error('[FREE-OVERRIDE] Failed to consume free buzz:', consumeError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to consume free buzz' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        console.log('[FREE-OVERRIDE] Successfully consumed free buzz, remaining:', consumeResult.remaining);
      }

      // Generate clue (simplified for now)
      const sampleClues = [
        "Cerca vicino alle antiche mura della città",
        "Il tesoro si nasconde dove l'acqua scorre",
        "Guarda verso il cielo, ma non dimenticare la terra",
        "Tra le pietre del passato si cela il futuro"
      ];
      
      const randomClue = sampleClues[Math.floor(Math.random() * sampleClues.length)];
      
      result = {
        success: true,
        clue_text: randomClue,
        buzz_cost: hasFreeOverride ? 0 : 1.99
      };
    }

    console.log('[BUZZ-PRESS] Operation completed successfully:', { 
      generateMap, 
      hasFreeOverride,
      userId: userId.substring(0, 8) + '...' // Log partial ID for privacy
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[BUZZ-PRESS] Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});