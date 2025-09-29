// © 2025 M1SSION™ – Handle BUZZ Payment Success Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'
import { getBuzzLevelFromCount } from '../_shared/buzzMapPricing.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('💳 [HANDLE-BUZZ-PAYMENT-SUCCESS] Function started');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('👤 [HANDLE-BUZZ-PAYMENT-SUCCESS] User authenticated:', user.id);

    // Parse request body
    const body = await req.json();
    const { paymentIntentId, isBuzzMap, coordinates } = body;

    if (!paymentIntentId) {
      throw new Error('Missing paymentIntentId');
    }

    console.log('💳 [HANDLE-BUZZ-PAYMENT-SUCCESS] Processing payment:', paymentIntentId, 'isBuzzMap:', isBuzzMap);
    
    // Handle BUZZ MAP payment success
    if (isBuzzMap && coordinates) {
      console.log('🗺️ [HANDLE-BUZZ-PAYMENT-SUCCESS] Processing BUZZ MAP payment');
      
      // Count existing buzz map areas to determine level (server-side validation)
      const { count, error: countError } = await supabase
        .from('user_map_areas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('source', 'buzz_map');
        
      if (countError) {
        console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Error counting map areas:', countError);
        throw new Error('Failed to count existing areas');
      }
      
      const currentCount = count ?? 0;
      const level = Math.min(currentCount + 1, 60);
      
      if (level > 60) {
        throw new Error('Maximum BUZZ MAP levels reached');
      }
      
      const buzzLevel = getBuzzLevelFromCount(currentCount);
      
      console.log('🗺️ [HANDLE-BUZZ-PAYMENT-SUCCESS] Creating BUZZ MAP area after payment:', {
        level,
        radiusKm: buzzLevel.radiusKm,
        priceCents: buzzLevel.priceCents,
        coordinates
      });
      
      // Create the map area
      const { data: mapArea, error: mapError } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: user.id,
          lat: coordinates.lat,
          lng: coordinates.lng,
          center_lat: coordinates.lat,
          center_lng: coordinates.lng,
          radius_km: buzzLevel.radiusKm,
          source: 'buzz_map',
          level: level,
          price_eur: buzzLevel.priceCents / 100,
          week: Math.ceil(Date.now() / (7 * 24 * 60 * 60 * 1000))
        })
        .select()
        .single();
        
      if (mapError) {
        console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Error creating map area:', mapError);
        throw new Error('Failed to create map area');
      }
      
      // Log the action
      const { error: actionError } = await supabase
        .from('buzz_map_actions')
        .insert({
          user_id: user.id,
          clue_count: level,
          cost_eur: buzzLevel.priceCents / 100,
          radius_generated: buzzLevel.radiusKm
        });
        
      if (actionError) {
        console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Error logging action:', actionError);
      }
      
      // Create success notification
      const { error: notificationError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: user.id,
          type: 'buzz_map',
          title: '🗺️ BUZZ MAP Creata!',
          message: `Area BUZZ MAP livello ${level} creata con raggio ${buzzLevel.radiusKm}km`,
          metadata: {
            level: level,
            radius_km: buzzLevel.radiusKm,
            price_eur: buzzLevel.priceCents / 100,
            payment_intent_id: paymentIntentId
          }
        });
        
      if (notificationError) {
        console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Notification error:', notificationError);
      }
      
      const response = {
        success: true,
        level: level,
        radius_km: buzzLevel.radiusKm,
        price_eur: buzzLevel.priceCents / 100,
        coordinates: coordinates,
        area_id: mapArea.id,
        message: 'BUZZ MAP area created successfully after payment',
        payment_intent_id: paymentIntentId
      };
      
      console.log('🎉 [HANDLE-BUZZ-PAYMENT-SUCCESS] BUZZ MAP payment completed:', response);
      
      return new Response(
        JSON.stringify(response),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 200
        }
      );
    }

    // Generate random clue text for paid BUZZ
    const premiumClueTexts = [
      "Il segreto più prezioso si nasconde dove l'eccellenza italiana brilla...",
      "Segui il sentiero dorato dell'innovazione premium...",
      "Nell'epicentro del lusso tecnologico troverai l'indizio supremo...",
      "Dove l'arte incontra la perfezione, là si cela il mistero...",
      "Il tesoro più ambito attende nel tempio dell'innovazione...",
      "Tra le creazioni più raffinate si nasconde la chiave del successo...",
      "Nel regno dell'eccellenza italiana scoprirai il segreto finale..."
    ];
    
    const clueText = premiumClueTexts[Math.floor(Math.random() * premiumClueTexts.length)];

    // Log the payment BUZZ action
    const { error: logError } = await supabase
      .from('buzz_logs')
      .insert({
        user_id: user.id,
        action: 'buzz_payment_success',
        metadata: {
          clue_text: clueText,
          payment_intent_id: paymentIntentId,
          source: 'buzz_purchase',
          timestamp: new Date().toISOString()
        }
      });

    if (logError) {
      console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Log error:', logError);
    } else {
      console.log('✅ [HANDLE-BUZZ-PAYMENT-SUCCESS] Payment BUZZ logged successfully');
    }

    // Create premium notification
    const { error: notificationError } = await supabase
      .from('user_notifications')
      .insert({
        user_id: user.id,
        type: 'buzz',
        title: '🎯 Nuovo Indizio BUZZ Premium!',
        message: clueText,
        metadata: {
          clue_text: clueText,
          source: 'buzz_purchase',
          payment_intent_id: paymentIntentId,
          premium: true
        }
      });

    if (notificationError) {
      console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Notification error:', notificationError);
    } else {
      console.log('✅ [HANDLE-BUZZ-PAYMENT-SUCCESS] Premium notification created successfully');
    }

    const response = {
      success: true,
      clue_text: clueText,
      message: 'Premium BUZZ processed successfully',
      payment_intent_id: paymentIntentId
    };

    console.log('🎉 [HANDLE-BUZZ-PAYMENT-SUCCESS] Function completed successfully:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});