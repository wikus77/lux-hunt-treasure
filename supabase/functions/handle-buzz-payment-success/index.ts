/**
 * © 2025 M1SSION™ — Handle Buzz Payment Success Edge Function
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';
import { getBuzzLevelFromCount } from '../_shared/buzzMapPricing.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('💳[HBPS] Function started');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('💳[HBPS] Missing authorization header');
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.log('💳[HBPS] Authentication failed:', userError?.message);
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('💳[HBPS] User authenticated:', user.id);

    // Parse request body - handle both camelCase and snake_case formats
    const body = await req.json();
    const pid = body.payment_intent_id ?? body.paymentIntentId;
    const isMap = body.is_buzz_map ?? body.isBuzzMap ?? false;
    const coords = body.coordinates ?? body.coords ?? null;
    const amount = body.amount || 0;

    console.log('💳[HBPS] Normalized payload:', {
      payment_intent_id: pid,
      is_buzz_map: isMap,
      coordinates: coords,
      amount: amount,
      user_id: user.id
    });

    if (!pid) {
      throw new Error('Missing payment_intent_id');
    }
    
    // Handle BUZZ MAP payment success
    if (isMap === true) {
      console.log('💳[HBPS] Processing BUZZ MAP payment');
      
      if (!coords || !coords.lat || !coords.lng) {
        // Log missing coordinates but isMap is true
        const { error: logError } = await supabase
          .from('buzz_logs')
          .insert({
            user_id: user.id,
            action: 'buzz_map_area_failed',
            step: 'payment_completed',
            details: {
              payment_intent_id: pid,
              reason: 'missing_coordinates',
              coordinates: coords,
              timestamp: new Date().toISOString()
            }
          });
          
        console.error('💳[HBPS] BUZZ MAP payment but missing coordinates:', coords);
        return new Response(JSON.stringify({
          success: false,
          error: 'BUZZ MAP payment requires valid coordinates'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Count existing buzz map areas to determine level
      const { count: buzzMapAreaCount } = await supabase
        .from('user_map_areas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('source', 'buzz_map');
      
      const currentCount = buzzMapAreaCount || 0;
      console.log('💳[HBPS] Current buzz map area count:', currentCount);
      
      // Get BUZZ level pricing from shared module
      const buzzLevel = getBuzzLevelFromCount(currentCount);
      const price_eur = amount ? amount / 100 : buzzLevel.priceCents / 100;
      
      console.log('💳[HBPS] BUZZ level data:', {
        count: currentCount,
        level: buzzLevel.level,
        radiusKm: buzzLevel.radiusKm,
        priceEur: price_eur
      });
      
      // Create map area in user_map_areas
      const { data: mapArea, error: mapAreaError } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: user.id,
          source: 'buzz_map',
          center_lat: coords.lat,
          center_lng: coords.lng,
          radius_km: buzzLevel.radiusKm,
          level_index: buzzLevel.level
        })
        .select()
        .single();
        
      if (mapAreaError) {
        console.error('💳[HBPS] Error creating map area:', mapAreaError);
        
        // Log the failure
        await supabase
          .from('buzz_logs')
          .insert({
            user_id: user.id,
            action: 'buzz_map_area_failed',
            step: 'payment_completed',
            details: {
              level: buzzLevel.level,
              radius_km: buzzLevel.radiusKm,
              price_eur: price_eur,
              payment_intent_id: pid,
              coordinates: coords,
              error: mapAreaError.message,
              timestamp: new Date().toISOString()
            }
          });
          
        throw new Error('Failed to create map area');
      }
      
      console.log('💳[HBPS] Map area created:', mapArea.id);
      
      // Log the action in buzz_map_actions
      const { data: actionData, error: actionError } = await supabase
        .from('buzz_map_actions')
        .insert({
          user_id: user.id,
          clue_count: 1,
          cost_eur: price_eur,
          radius_generated: buzzLevel.radiusKm,
          payment_intent_id: pid
        })
        .select()
        .single();
        
      if (actionError) {
        console.error('💳[HBPS] Error logging buzz_map_actions:', actionError);
      } else {
        console.log('💳[HBPS] Buzz map action logged:', actionData.id);
      }
      
      // Log in buzz_logs for comprehensive tracking
      const { error: buzzLogError } = await supabase
        .from('buzz_logs')
        .insert({
          user_id: user.id,
          action: 'buzz_map_area_created',
          step: 'payment_completed',
          details: {
            level: buzzLevel.level,
            radius_km: buzzLevel.radiusKm,
            price_eur: price_eur,
            payment_intent_id: pid,
            coordinates: coords,
            area_id: mapArea.id,
            timestamp: new Date().toISOString()
          }
        });
        
      if (buzzLogError) {
        console.error('💳[HBPS] Error logging buzz_logs:', buzzLogError);
      } else {
        console.log('💳[HBPS] Buzz log created successfully');
      }
      
      console.log('💳[HBPS] BUZZ MAP processing completed successfully');
      
      const response = {
        success: true,
        message: 'Buzz Map area created',
        payment_intent_id: pid,
        radius_km: buzzLevel.radiusKm,
        price_eur: price_eur
      };
      
      console.log('💳[HBPS] Function completed successfully:', response);
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Handle regular BUZZ payment (existing logic unchanged)
    console.log('💳[HBPS] Processing regular BUZZ payment');
    
    const response = {
      success: true,
      type: "buzz",
      message: "Regular BUZZ processed successfully",
      payment_intent_id: pid
    };
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💳[HBPS] Function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
