/**
 * © 2025 M1SSION™ — Handle Buzz Payment Success Edge Function
 */ import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';
// Helper: calculate ISO week number (UTC)
function isoWeekUTC(d = new Date()) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    console.log('💳[HBPS] Function started');
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('💳[HBPS] Missing authorization header');
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) {
      console.log('💳[HBPS] Authentication failed:', userError?.message);
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
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
        await supabase.from('buzz_logs').insert({
          user_id: user.id,
          action: 'buzz_map_area_failed',
          step: 'missing_coordinates',
          details: {
            payment_intent_id: pid
          }
        });
        return new Response(JSON.stringify({
          success: false,
          error: 'missing_coordinates'
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      const radiusKm = 500; // fallback sicuro (mantieni la tua logica se già presente)
      const priceEur = amount != null ? Math.round(amount) / 100 : 4.99;
      const week = isoWeekUTC(); // richiesto dal tuo schema NOT NULL
      console.log('💳[HBPS] BUZZ MAP data:', {
        radiusKm,
        priceEur,
        week,
        coordinates: coords
      });
      // primo tentativo: includi anche center_lat/center_lng (se la tabella li ha, ok; se no, ritentiamo senza)
      const areaInsertBase = {
        user_id: user.id,
        source: 'buzz_map',
        lat: Number(coords.lat),
        lng: Number(coords.lng),
        radius_km: radiusKm,
        week
      };
      const withCenter = {
        ...areaInsertBase,
        center_lat: Number(coords.lat),
        center_lng: Number(coords.lng)
      };
      let areaId = null;
      // try 1: con center_*
      let ins1 = await supabase.from('user_map_areas').insert(withCenter).select('id').single();
      if (ins1.error) {
        const msg = `${ins1.error.message || ''}`.toLowerCase();
        const isUndefinedCenterCols = msg.includes('column') && (msg.includes('center_lat') || msg.includes('center_lng')) && msg.includes('does not exist');
        if (isUndefinedCenterCols) {
          console.log('💳[HBPS] center_* columns do not exist, retrying without them');
          // try 2: senza center_*
          const ins2 = await supabase.from('user_map_areas').insert(areaInsertBase).select('id').single();
          if (ins2.error) {
            console.error('💳[HBPS] user_map_areas insert error:', ins2.error);
            await supabase.from('buzz_logs').insert({
              user_id: user.id,
              action: 'buzz_map_area_failed',
              step: 'insert_error',
              details: {
                payment_intent_id: pid,
                error: ins2.error.message,
                attempted_insert: areaInsertBase
              }
            });
            return new Response(JSON.stringify({
              success: false,
              error: 'area_insert_failed'
            }), {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          areaId = ins2.data?.id ?? null;
        } else {
          console.error('💳[HBPS] user_map_areas insert error:', ins1.error);
          await supabase.from('buzz_logs').insert({
            user_id: user.id,
            action: 'buzz_map_area_failed',
            step: 'insert_error',
            details: {
              payment_intent_id: pid,
              error: ins1.error.message,
              attempted_insert: withCenter
            }
          });
          return new Response(JSON.stringify({
            success: false,
            error: 'area_insert_failed'
          }), {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
      } else {
        areaId = ins1.data?.id ?? null;
      }
      console.log('💳[HBPS] Map area created with ID:', areaId);
      // azione storica (non vincolante)
      const actionInsert = {
        user_id: user.id,
        cost_eur: priceEur,
        clue_count: 1,
        radius_generated: radiusKm,
        payment_intent_id: pid
      };
      const act = await supabase.from('buzz_map_actions').insert(actionInsert);
      if (act.error && `${act.error.message}`.includes('does not exist')) {
        console.log('💳[HBPS] payment_intent_id column does not exist in buzz_map_actions, retrying without it');
        // best-effort: ritenta senza payment_intent_id
        await supabase.from('buzz_map_actions').insert({
          user_id: user.id,
          cost_eur: priceEur,
          clue_count: 1,
          radius_generated: radiusKm
        });
      } else if (act.error) {
        console.error('💳[HBPS] buzz_map_actions insert error:', act.error);
      } else {
        console.log('💳[HBPS] buzz_map_actions insert successful');
      }
      await supabase.from('buzz_logs').insert({
        user_id: user.id,
        action: 'buzz_map_area_created',
        step: 'payment_completed',
        details: {
          payment_intent_id: pid,
          area_id: areaId,
          radius_km: radiusKm,
          price_eur: priceEur,
          coordinates: coords
        }
      });
      console.log('💳[HBPS] BUZZ MAP processing completed successfully');
      return new Response(JSON.stringify({
        success: true,
        message: 'Buzz Map area created',
        payment_intent_id: pid,
        area_id: areaId,
        radius_km: radiusKm,
        price_eur: priceEur
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
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
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('💳[HBPS] Function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
