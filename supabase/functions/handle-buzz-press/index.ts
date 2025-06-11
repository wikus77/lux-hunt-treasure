
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { RateLimiter } from "../_shared/rateLimiter.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BuzzRequest {
  userId: string;
  generateMap: boolean;
  prizeId?: string;
  coordinates?: { lat: number; lng: number };
  sessionId?: string;
}

interface BuzzResponse {
  success: boolean;
  clue_text: string;
  buzz_cost: number;
  radius_km?: number;
  lat?: number;
  lng?: number;
  generation_number?: number;
  error?: boolean;
  errorMessage?: string;
}

const applySecureOffset = (lat: number, lng: number) => {
  const offset = () => (Math.random() - 0.5) * 0.1;
  return {
    lat: lat + offset(),
    lng: lng + offset()
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let requestData: any;
  
  try {
    requestData = await req.json();
    const { userId, generateMap, coordinates, prizeId, sessionId } = requestData as BuzzRequest;
    
    console.log(`🔥 FIX 1 – BUZZ REQUEST START - userId: ${userId}, generateMap: ${generateMap}`);
    console.log(`📡 Coordinates received:`, coordinates);
    
    // STEP 1 - LOG IN BUZZ_LOGS: START
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    await supabase.from('buzz_logs').insert({
      user_id: userId,
      step: 'start',
      details: { generateMap, coordinates, timestamp: new Date().toISOString() }
    });

    if (!userId || typeof userId !== 'string') {
      console.error("❌ FIX 1 ERROR - Invalid userId:", userId);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "ID utente non valido" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("❌ FIX 1 ERROR - Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Token di autorizzazione mancante" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user || user.id !== userId) {
      console.error("❌ FIX 1 ERROR - Auth validation failed");
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Autorizzazione non valida" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ FIX 1 SUCCESS - Auth validation passed for user: ${userId}`);

    // STEP 2 - PAYMENT CHECK WITH LOGGING
    console.log(`🔥 FIX 1 – PAYMENT CHECK START`);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_end, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("❌ FIX 1 ERROR - Error fetching user profile:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Profilo utente non trovato" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('status, tier, end_date')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const hasActiveSubscription = subscription && 
      new Date(subscription.end_date || '') > new Date();
    
    const subscriptionTier = profile?.subscription_tier || 'Free';
    const paymentStatus = hasActiveSubscription ? 'active' : 'inactive';
    const stripe_customer_id = profile?.stripe_customer_id;

    // CRITICAL LOGGING - ALL VALUES
    console.log(`🔍 CRITICAL DEBUG VALUES:`, {
      user_id: userId,
      paymentStatus: paymentStatus,
      stripe_customer_id: stripe_customer_id,
      hasActiveSubscription: hasActiveSubscription,
      subscriptionTier: subscriptionTier,
      profile: profile,
      subscription: subscription
    });

    // STEP 3 - LOG IN BUZZ_LOGS: PAYMENT CHECK
    await supabase.from('buzz_logs').insert({
      user_id: userId,
      step: 'payment_check',
      details: { 
        paymentStatus, 
        stripe_customer_id, 
        hasActiveSubscription, 
        subscriptionTier,
        timestamp: new Date().toISOString() 
      }
    });

    // PAYMENT VERIFICATION - BLOCK IF NOT ACTIVE
    if (paymentStatus !== 'active' || !stripe_customer_id) {
      console.error(`❌ FIX 1 ERROR - Payment check failed:`, {
        paymentStatus,
        stripe_customer_id,
        hasActiveSubscription
      });
      
      await supabase.from('abuse_logs').insert({
        user_id: userId,
        event_type: 'buzz_no_payment',
        meta: {
          access_type: 'buzz_no_payment',
          paymentStatus,
          stripe_customer_id,
          hasActiveSubscription,
          timestamp: new Date().toISOString()
        }
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: true, 
          errorMessage: "Pagamento richiesto. Questa funzione è disponibile solo per utenti con abbonamento attivo." 
        }),
        { status: 402, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ FIX 1 SUCCESS - Payment verification passed`);

    const rateLimiter = new RateLimiter(supabaseUrl, supabaseServiceKey);
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    const rateLimitResult = await rateLimiter.checkRateLimit(userId, ipAddress, {
      maxRequests: 5,
      windowSeconds: 30,
      functionName: 'handle-buzz-press'
    });

    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limit exceeded for user: ${userId}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: true, 
          errorMessage: "Troppe richieste. Riprova tra qualche secondo." 
        }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json", 
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toISOString(),
            ...corsHeaders 
          } 
        }
      );
    }

    const { data: weekData, error: weekError } = await supabase.rpc('get_current_mission_week');
    if (weekError) {
      console.error("❌ FIX 1 ERROR - Error getting current week:", weekError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Errore nel recupero settimana" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const currentWeek = weekData || 1;
    console.log(`📍 Current mission week: ${currentWeek}`);

    const { data: buzzCount, error: buzzCountError } = await supabase.rpc('increment_buzz_counter', {
      p_user_id: userId
    });

    if (buzzCountError) {
      console.error("❌ FIX 1 ERROR - Error incrementing buzz counter:", buzzCountError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Errore contatore buzz" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`📍 Updated buzz count: ${buzzCount}`);

    let clueText = `🔒 Indizio generato per settimana ${currentWeek}`;
    console.log(`📍 Generated clue: ${clueText}`);
    
    const { data: clueData, error: clueError } = await supabase
      .from('user_clues')
      .insert({
        user_id: userId,
        title_it: `Indizio Premium #${buzzCount}`,
        description_it: clueText,
        title_en: `Premium Clue #${buzzCount}`,
        description_en: translateToEnglish(clueText),
        clue_type: 'premium',
        buzz_cost: 0
      })
      .select('clue_id')
      .single();

    if (clueError) {
      console.error("❌ FIX 1 ERROR - Error saving clue:", clueError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Errore salvataggio indizio" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ FIX 1 SUCCESS - Clue saved with ID: ${clueData.clue_id}`);

    let response: BuzzResponse = {
      success: true,
      clue_text: clueText,
      buzz_cost: 0
    };

    if (generateMap) {
      console.log(`🔥 FIX 1 – BUZZ MAPPA GENERATION START for user ${userId}`);
      
      let baseCenter = { lat: 41.9028, lng: 12.4964 };
      
      if (coordinates) {
        baseCenter = { lat: coordinates.lat, lng: coordinates.lng };
        console.log(`📍 Setting new base center: ${baseCenter.lat}, ${baseCenter.lng}`);
      }
      
      const secureCenter = applySecureOffset(baseCenter.lat, baseCenter.lng);
      console.log(`🔒 Applied secure offset: ${secureCenter.lat}, ${secureCenter.lng}`);
      
      // STEP 4 - GET GENERATION FROM DB WITH LOGGING
      console.log(`🔥 FIX 1 – GET CURRENT GENERATION FROM DB`);
      
      const { data: counterData, error: counterError } = await supabase
        .from('user_buzz_map_counter')
        .select('buzz_map_count')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      let currentGeneration = (counterData?.buzz_map_count || 0) + 1;
      console.log(`🔥 FIX 1 – GENERATION FROM DB: ${currentGeneration}`);
      
      // STEP 5 - CALCULATE RADIUS WITH LOGGING
      let radius_km;
      if (currentGeneration === 1) {
        radius_km = 500;
        console.log("🔥 FIX 1 – FIRST GENERATION: 500km");
      } else {
        radius_km = Math.max(5, 500 * Math.pow(0.95, currentGeneration - 1));
        console.log(`🔥 FIX 1 – RADIUS CALCULATION: Generation ${currentGeneration} = ${radius_km}km`);
      }
      
      // CRITICAL LOGGING - RADIUS CALCULATION
      console.log(`🔍 CRITICAL RADIUS DEBUG:`, {
        generation: currentGeneration,
        radius_km: radius_km,
        calculation: `500 * 0.95^(${currentGeneration} - 1) = ${500 * Math.pow(0.95, currentGeneration - 1)}`,
        final_radius: Math.max(5, 500 * Math.pow(0.95, currentGeneration - 1))
      });

      // STEP 6 - LOG IN BUZZ_LOGS: GENERATION CALCULATED
      await supabase.from('buzz_logs').insert({
        user_id: userId,
        step: 'generation_calculated',
        details: { 
          generation: currentGeneration, 
          radius_km: radius_km,
          calculation: `500 * 0.95^(${currentGeneration} - 1)`,
          timestamp: new Date().toISOString() 
        }
      });
      
      // Atomic upsert del contatore
      const { data: updatedCounter, error: updateError } = await supabase
        .from('user_buzz_map_counter')
        .upsert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          buzz_map_count: currentGeneration
        }, {
          onConflict: 'user_id,date'
        })
        .select('buzz_map_count')
        .single();

      if (updateError) {
        console.error("❌ FIX 1 ERROR - Error updating counter:", updateError);
        currentGeneration = 1; // Fallback
      } else {
        currentGeneration = updatedCounter.buzz_map_count;
        console.log(`✅ FIX 1 SUCCESS - Counter updated: generation ${currentGeneration}`);
      }

      // Clear existing areas
      console.log(`🔥 FIX 1 – CLEARING EXISTING AREAS`);
      const { error: deleteError, count: deletedCount } = await supabase
        .from('user_map_areas')
        .delete({ count: 'exact' })
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error("❌ FIX 1 ERROR - Could not clear existing areas:", deleteError);
      } else {
        console.log(`✅ FIX 1 SUCCESS - Cleared ${deletedCount} existing areas`);
      }
      
      // STEP 7 - INSERT NEW AREA WITH EXTENSIVE LOGGING
      console.log(`🔥 FIX 1 – INSERTING NEW AREA:`, {
        user_id: userId,
        lat: secureCenter.lat,
        lng: secureCenter.lng,
        radius_km: radius_km,
        week: currentWeek
      });
      
      const { data: insertedArea, error: mapError } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: userId,
          lat: secureCenter.lat,
          lng: secureCenter.lng,
          radius_km: radius_km,
          week: currentWeek
        })
        .select()
        .single();
        
      if (mapError) {
        console.error("❌ FIX 1 ERROR - Map area insert failed:", {
          error: mapError,
          user_id: userId,
          radius: radius_km,
          coordinates: secureCenter
        });
        
        // STEP 8 - LOG IN BUZZ_LOGS: AREA INSERT FAILED
        await supabase.from('buzz_logs').insert({
          user_id: userId,
          step: 'area_insert_failed',
          details: { 
            error: mapError.message,
            radius_km: radius_km,
            coordinates: secureCenter,
            timestamp: new Date().toISOString() 
          }
        });
        
        response.error = true;
        response.errorMessage = "Errore salvataggio area mappa";
      } else {
        console.log(`✅ FIX 1 SUCCESS - Map area inserted:`, insertedArea);
        
        // STEP 9 - LOG IN BUZZ_LOGS: AREA INSERT SUCCESS
        await supabase.from('buzz_logs').insert({
          user_id: userId,
          step: 'area_insert_success',
          details: { 
            area_id: insertedArea.id,
            radius_km: radius_km,
            coordinates: secureCenter,
            timestamp: new Date().toISOString() 
          }
        });
        
        // STEP 10 - INSERT NOTIFICATION WITH ENHANCED LOGGING
        console.log(`🔥 FIX 1 – INSERTING NOTIFICATION`);
        console.log(`📬 Notification data to insert:`, {
          user_id: userId,
          title: "NUOVA AREA GENERATA",
          message: `Area BUZZ MISSION attiva! Raggio attuale: ${radius_km}km`,
          type: "buzz_generated",
          is_read: false
        });
        
        const { data: notificationData, error: notificationError } = await supabase
          .from('user_notifications')
          .insert({
            user_id: userId,
            title: "NUOVA AREA GENERATA",
            message: `Area BUZZ MISSION attiva! Raggio attuale: ${radius_km}km`,
            type: "buzz_generated",
            is_read: false
          })
          .select('id')
          .single();

        if (notificationError) {
          console.error("❌ FIX 1 ERROR - Notification insert failed:", notificationError);
          console.error("RLS BLOCKED:", notificationError.message);
          
          // STEP 11 - LOG IN BUZZ_LOGS: NOTIFICATION INSERT FAILED
          await supabase.from('buzz_logs').insert({
            user_id: userId,
            step: 'notification_insert_failed',
            details: { 
              error: notificationError.message,
              rls_blocked: true,
              timestamp: new Date().toISOString() 
            }
          });
        } else {
          console.log(`✅ FIX 1 SUCCESS - Notification inserted: ${notificationData.id}`);
          console.log("NOTIFICA INSERITA", notificationData);
          
          // STEP 12 - LOG IN BUZZ_LOGS: NOTIFICATION INSERT SUCCESS
          await supabase.from('buzz_logs').insert({
            user_id: userId,
            step: 'notification_insert_success',
            details: { 
              notification_id: notificationData.id,
              timestamp: new Date().toISOString() 
            }
          });
        }

        response.radius_km = radius_km;
        response.lat = secureCenter.lat;
        response.lng = secureCenter.lng;
        response.generation_number = currentGeneration;
        
        console.log(`✅ BUZZ #${currentGeneration} – Raggio: ${radius_km}km – ID area: ${insertedArea.id} – user: ${user.email || userId}`);
      }
    }

    // STEP 13 - LOG IN BUZZ_LOGS: END
    await supabase.from('buzz_logs').insert({
      user_id: userId,
      step: 'end',
      details: { 
        success: response.success,
        error: response.error,
        radius_km: response.radius_km,
        timestamp: new Date().toISOString() 
      }
    });

    console.log(`✅ BUZZ RESPONSE:`, response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("❌ FIX 1 ERROR - General error in BUZZ handling:", error);
    
    // LOG GENERAL ERROR IN BUZZ_LOGS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    await supabase.from('buzz_logs').insert({
      user_id: requestData?.userId || 'unknown',
      step: 'general_error',
      details: { 
        error: error.message || String(error),
        timestamp: new Date().toISOString() 
      }
    });
    
    return new Response(
      JSON.stringify({ success: false, error: true, errorMessage: error.message || "Errore del server" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

function translateToEnglish(italianClue: string): string {
  const translations: Record<string, string> = {
    "Cerca dove splende il sole sul metallo lucente": "Look where the sun shines on gleaming metal"
  };
  
  return translations[italianClue] || italianClue;
}
