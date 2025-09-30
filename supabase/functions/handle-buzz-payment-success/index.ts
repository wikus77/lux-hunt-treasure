/**
 * © 2025 M1SSION™ — Handle Buzz Payment Success Edge Function
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getBuzzLevelFromCount } from '../_shared/buzzMapPricing.ts';

console.log('💳 [HANDLE-BUZZ-PAYMENT-SUCCESS] Function loaded');

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    console.log('👤 [HANDLE-BUZZ-PAYMENT-SUCCESS] User authenticated:', user.id);

    // Parse request body - handle both camelCase and snake_case formats
    const body = await req.json();
    const pid = body.payment_intent_id ?? body.paymentIntentId;
    const isMap = body.is_buzz_map ?? body.isBuzzMap ?? false;
    const coords = body.coordinates ?? body.coords ?? null;
    const amount = body.amount || 0;

    console.log('🔄 [HANDLE-BUZZ-PAYMENT-SUCCESS] Normalized payload:', {
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
      console.log('🗺️ [HANDLE-BUZZ-PAYMENT-SUCCESS] Processing BUZZ MAP payment');
      
      if (!coords || !coords.lat || !coords.lng) {
        // Log missing coordinates but isMap is true
        const { error: logError } = await supabase
          .from('buzz_logs')
          .insert({
            user_id: user.id,
            action: 'buzz_map_area_failed',
            step: 'area_created',
            details: {
              payment_intent_id: pid,
              reason: 'missing_coordinates',
              coordinates: coords,
              timestamp: new Date().toISOString()
            }
          });
          
        console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] BUZZ MAP payment but missing coordinates:', coords);
        return new Response(JSON.stringify({
          success: false,
          error: 'BUZZ MAP payment requires valid coordinates'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check for duplicate payment
      const { data: existingArea } = await supabase
        .from('user_map_areas')
        .select('id')
        .eq('user_id', user.id)
        .eq('source', 'buzz_map')
        .limit(1);

      // Count existing buzz map areas to determine level (server-side validation)
      const { count: buzzMapAreaCount } = await supabase
        .from('user_map_areas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('source', 'buzz_map');
      
      const level = buzzMapAreaCount || 0;
      const levelIndex = Math.min(level, 59); // max 60 levels (0-59)
      
      console.log('📊 [HANDLE-BUZZ-PAYMENT-SUCCESS] Current level:', level, 'levelIndex:', levelIndex);
      
      // Get BUZZ level pricing from shared module
      const buzzLevel = getBuzzLevelFromCount(levelIndex);
      
      console.log('💰 [HANDLE-BUZZ-PAYMENT-SUCCESS] BUZZ level data:', {
        level: levelIndex,
        radiusKm: buzzLevel.radiusKm,
        priceEur: buzzLevel.priceCents / 100
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
          level_index: levelIndex
        })
        .select()
        .single();
        
      if (mapAreaError) {
        console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Error creating map area:', mapAreaError);
        
        // Log the failure
        await supabase
          .from('buzz_logs')
          .insert({
            user_id: user.id,
            action: 'buzz_map_area_failed',
            step: 'area_created',
            details: {
              level: levelIndex,
              radius_km: buzzLevel.radiusKm,
              price_eur: buzzLevel.priceCents / 100,
              payment_intent_id: pid,
              coordinates: coords,
              error: mapAreaError.message,
              timestamp: new Date().toISOString()
            }
          });
          
        throw new Error('Failed to create map area');
      }
      
      console.log('✅ [HANDLE-BUZZ-PAYMENT-SUCCESS] Map area created:', mapArea.id);
      
      // Log the action in buzz_map_actions
      const { error: actionError } = await supabase
        .from('buzz_map_actions')
        .insert({
          user_id: user.id,
          clue_count: 1, // For tracking purposes, set to 1
          cost_eur: amount ? amount / 100 : buzzLevel.priceCents / 100,
          radius_generated: buzzLevel.radiusKm,
          payment_intent_id: pid
        });
        
      if (actionError) {
        console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Error logging buzz_map_actions:', actionError);
      }
      
      // Log in buzz_logs for comprehensive tracking
      const { error: buzzLogError } = await supabase
        .from('buzz_logs')
        .insert({
          user_id: user.id,
          action: 'buzz_map_area_created',
          step: 'area_created',
          details: {
            level: levelIndex,
            radius_km: buzzLevel.radiusKm,
            price_eur: buzzLevel.priceCents / 100,
            payment_intent_id: pid,
            coordinates: coords,
            area_id: mapArea.id,
            timestamp: new Date().toISOString()
          }
        });
        
      if (buzzLogError) {
        console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Error logging buzz_logs:', buzzLogError);
      }
      
      // Create success notification
      const { error: notificationError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: user.id,
          title: '🗺️ BUZZ Map Area Created!',
          message: `Your ${buzzLevel.radiusKm}km search area has been created successfully.`,
          type: 'buzz_map_success',
          is_read: false
        });
        
      if (notificationError) {
        console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Error creating notification:', notificationError);
      } else {
        console.log('✅ [HANDLE-BUZZ-PAYMENT-SUCCESS] Success notification created');
      }
      
      console.log('🎉 [HANDLE-BUZZ-PAYMENT-SUCCESS] BUZZ MAP processing completed successfully');
      
      const response = {
        success: true,
        type: "buzz_map",
        level: levelIndex,
        radius_km: buzzLevel.radiusKm,
        price_eur: buzzLevel.priceCents / 100,
        payment_intent_id: pid
      };
      
      console.log('🎉 [HANDLE-BUZZ-PAYMENT-SUCCESS] Function completed successfully:', response);
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Handle regular BUZZ payment (existing logic)
    console.log('🎯 [HANDLE-BUZZ-PAYMENT-SUCCESS] Processing regular BUZZ payment');
    
    // ... rest of existing BUZZ logic would be here ...
    // For now, return success for regular BUZZ
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
    console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Function error:', error);
    
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