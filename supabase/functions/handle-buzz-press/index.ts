
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
    
    console.log(`🔥 BUZZ FUNCTION START - userId: ${userId}, generateMap: ${generateMap}`);
    console.log(`📡 COORDINATES:`, coordinates);
    
    // STEP 1 - USER VALIDATION
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    await supabase.from('buzz_logs').insert({
      user_id: userId,
      step: 'start',
      details: { generateMap, coordinates, timestamp: new Date().toISOString() }
    });

    // Enhanced user validation
    console.log(`🔍 USER VALIDATION: Validating userId: ${userId}`);
    if (!userId || typeof userId !== 'string') {
      console.error("❌ ERRORE: Nessun utente rilevato - Invalid userId:", userId);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "ID utente non valido" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authHeader = req.headers.get("authorization");
    console.log(`🔍 AUTH HEADER: ${authHeader ? 'Present' : 'Missing'}`);
    if (!authHeader) {
      console.error("❌ ERRORE: Token di autorizzazione mancante");
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Token di autorizzazione mancante" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log(`🔍 TOKEN: Token length: ${token.length}`);

    console.log(`🔍 USER AUTH: Validating token for user: ${userId}`);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    console.log(`🔍 USER AUTH RESULT:`, {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
      userIdMatch: user?.id === userId
    });
    
    if (authError || !user || user.id !== userId) {
      console.error("❌ ERRORE: Autorizzazione non valida:", {
        authError: authError?.message,
        hasUser: !!user,
        userIdMatch: user?.id === userId
      });
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Autorizzazione non valida" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ USER VALIDATION SUCCESS for user: ${userId}`);

    // STEP 2 - SUBSCRIPTION CHECK
    console.log(`🔥 SUBSCRIPTION CHECK START`);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_end, stripe_customer_id, email')
      .eq('id', userId)
      .single();

    console.log(`🔍 PROFILE FETCH:`, {
      hasProfile: !!profile,
      profileError: profileError?.message,
      tier: profile?.subscription_tier,
      stripeId: profile?.stripe_customer_id,
      email: profile?.email
    });

    if (profileError) {
      console.error("❌ ERRORE: Error fetching user profile:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Profilo utente non trovato" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Developer bypass
    const isDeveloperUser = profile?.email === 'wikus77@hotmail.it';
    if (isDeveloperUser) {
      console.log('🔧 DEVELOPER USER: Bypassing all checks for wikus77@hotmail.it');
    } else {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('status, tier, end_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      console.log(`🔍 SUBSCRIPTION FETCH:`, {
        hasSubscription: !!subscription,
        subError: subError?.message,
        status: subscription?.status,
        tier: subscription?.tier,
        endDate: subscription?.end_date
      });

      const hasActiveSubscription = subscription && 
        new Date(subscription.end_date || '') > new Date();
      
      const subscriptionTier = profile?.subscription_tier || 'Free';
      const paymentStatus = hasActiveSubscription ? 'active' : 'inactive';
      const stripe_customer_id = profile?.stripe_customer_id;

      console.log(`🔍 PAYMENT STATUS:`, {
        user_id: userId,
        paymentStatus: paymentStatus,
        stripe_customer_id: stripe_customer_id,
        hasActiveSubscription: hasActiveSubscription,
        subscriptionTier: subscriptionTier
      });

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

      // PAYMENT VERIFICATION
      if (paymentStatus !== 'active' || !stripe_customer_id) {
        console.error(`❌ ERRORE: Nessun piano attivo:`, {
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
    }

    console.log(`✅ SUBSCRIPTION CHECK SUCCESS`);

    // STEP 3 - RATE LIMITING
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

    // STEP 4 - GET CURRENT WEEK
    const { data: weekData, error: weekError } = await supabase.rpc('get_current_mission_week');
    if (weekError) {
      console.error("❌ ERRORE: Error getting current week:", weekError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Errore nel recupero settimana" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const currentWeek = weekData || 1;
    console.log(`📍 CURRENT WEEK: ${currentWeek}`);

    // STEP 5 - INCREMENT BUZZ COUNTER
    const { data: buzzCount, error: buzzCountError } = await supabase.rpc('increment_buzz_counter', {
      p_user_id: userId
    });

    if (buzzCountError) {
      console.error("❌ ERRORE: Error incrementing buzz counter:", buzzCountError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Errore contatore buzz" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`📍 BUZZ COUNT: ${buzzCount}`);

    // STEP 6 - GENERATE CLUE
    let clueText = `🔒 Indizio generato per settimana ${currentWeek}`;
    console.log(`📍 CLUE: ${clueText}`);
    
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
      console.error("❌ ERRORE: Error saving clue:", clueError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Errore salvataggio indizio" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ CLUE SAVED with ID: ${clueData.clue_id}`);

    let response: BuzzResponse = {
      success: true,
      clue_text: clueText,
      buzz_cost: 0
    };

    if (generateMap) {
      console.log(`🔥 BUZZ MAPPA GENERATION START for user ${userId}`);
      
      let baseCenter = { lat: 41.9028, lng: 12.4964 };
      
      if (coordinates) {
        baseCenter = { lat: coordinates.lat, lng: coordinates.lng };
        console.log(`📍 BASE CENTER: ${baseCenter.lat}, ${baseCenter.lng}`);
      }
      
      const secureCenter = applySecureOffset(baseCenter.lat, baseCenter.lng);
      console.log(`🔒 SECURE CENTER: ${secureCenter.lat}, ${secureCenter.lng}`);
      
      // STEP 7 - GET GENERATION COUNT
      console.log(`🔥 GET CURRENT GENERATION FROM DB`);
      
      const { data: counterData, error: counterError } = await supabase
        .from('user_buzz_map_counter')
        .select('buzz_map_count')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      console.log(`🔍 COUNTER FETCH:`, {
        hasCounterData: !!counterData,
        counterError: counterError?.message,
        currentCount: counterData?.buzz_map_count
      });

      let currentGeneration = (counterData?.buzz_map_count || 0) + 1;
      console.log(`🔥 GENERATION: ${currentGeneration}`);
      
      // STEP 8 - CALCULATE RADIUS
      let radius_km;
      if (currentGeneration === 1) {
        radius_km = 500;
        console.log("🔥 FIRST GENERATION: 500km");
      } else {
        radius_km = Math.max(5, 500 * Math.pow(0.95, currentGeneration - 1));
        console.log(`🔥 RADIUS CALCULATION: Generation ${currentGeneration} = ${radius_km}km`);
      }
      
      console.log(`RAGGIO USATO: ${radius_km}km`);

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
      
      // STEP 9 - UPDATE COUNTER
      console.log(`🔥 UPDATING COUNTER: Setting generation to ${currentGeneration}`);
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

      console.log(`🔍 COUNTER UPDATE:`, {
        success: !updateError,
        updateError: updateError?.message,
        updatedCount: updatedCounter?.buzz_map_count
      });

      if (updateError) {
        console.error("❌ ERRORE: Error updating counter:", updateError);
        currentGeneration = 1; // Fallback
      } else {
        currentGeneration = updatedCounter.buzz_map_count;
        console.log(`✅ COUNTER UPDATE SUCCESS: generation ${currentGeneration}`);
      }

      // STEP 10 - CLEAR EXISTING AREAS
      console.log(`🔥 CLEARING EXISTING AREAS`);
      const { error: deleteError, count: deletedCount } = await supabase
        .from('user_map_areas')
        .delete({ count: 'exact' })
        .eq('user_id', userId);
        
      console.log(`🔍 AREA DELETION:`, {
        success: !deleteError,
        deleteError: deleteError?.message,
        deletedCount: deletedCount
      });
        
      if (deleteError) {
        console.error("❌ ERRORE: Could not clear existing areas:", deleteError);
      } else {
        console.log(`✅ CLEARED ${deletedCount} existing areas`);
      }
      
      // STEP 11 - INSERT NEW AREA
      console.log(`🔥 INSERTING NEW AREA:`, {
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
        
      console.log(`🔍 AREA INSERT RESULT:`, {
        success: !mapError,
        mapError: mapError?.message,
        insertedAreaId: insertedArea?.id,
        insertedArea: insertedArea
      });
        
      if (mapError) {
        console.error("❌ ERRORE GENERAZIONE:", {
          error: mapError,
          user_id: userId,
          radius: radius_km,
          coordinates: secureCenter,
          rls_check: "user_map_areas RLS might be blocking"
        });
        
        console.log('INSERIMENTO AREA: FAIL');
        
        await supabase.from('buzz_logs').insert({
          user_id: userId,
          step: 'area_insert_failed',
          details: { 
            error: mapError.message,
            radius_km: radius_km,
            coordinates: secureCenter,
            rls_blocked: mapError.message.includes('row-level security'),
            timestamp: new Date().toISOString() 
          }
        });
        
        response.error = true;
        response.errorMessage = `Errore inserimento area: ${mapError.message}`;
      } else {
        console.log(`✅ MAP AREA INSERTED:`, insertedArea);
        console.log('INSERIMENTO AREA: SUCCESS');
        
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
        
        // STEP 12 - INSERT NOTIFICATION
        console.log(`🔥 INSERTING NOTIFICATION`);
        console.log(`📬 NOTIFICATION DATA:`, {
          user_id: userId,
          title: "Area BUZZ generata",
          message: `Hai sbloccato una nuova zona di ricerca.`,
          type: "buzz",
          is_read: false
        });
        
        const { data: notificationData, error: notificationError } = await supabase
          .from('user_notifications')
          .insert({
            user_id: userId,
            title: "Area BUZZ generata",
            message: `Hai sbloccato una nuova zona di ricerca.`,
            type: "buzz",
            is_read: false
          })
          .select('id')
          .single();

        console.log(`🔍 NOTIFICATION INSERT RESULT:`, {
          success: !notificationError,
          notificationError: notificationError?.message,
          notificationId: notificationData?.id,
          rls_blocked: notificationError?.message?.includes('row-level security')
        });

        if (notificationError) {
          console.error("❌ ERRORE: Notification insert failed:", notificationError);
          console.error("RLS BLOCKED:", notificationError.message);
          console.log('INSERIMENTO NOTIFICA: FAIL');
          
          await supabase.from('buzz_logs').insert({
            user_id: userId,
            step: 'notification_insert_failed',
            details: { 
              error: notificationError.message,
              rls_blocked: notificationError.message.includes('row-level security'),
              timestamp: new Date().toISOString() 
            }
          });
        } else {
          console.log(`✅ NOTIFICATION INSERTED: ${notificationData.id}`);
          console.log("NOTIFICA INSERITA");
          console.log('INSERIMENTO NOTIFICA: SUCCESS');
          
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

    // STEP 13 - FINAL LOG
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

    console.log(`✅ FINAL RESPONSE:`, response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("❌ ERRORE GENERAZIONE:", error);
    console.log('INSERIMENTO AREA: FAIL');
    console.log('INSERIMENTO NOTIFICA: FAIL');
    
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
      JSON.stringify({ 
        success: false, 
        error: true, 
        errorMessage: `Errore del server: ${error.message || "Errore sconosciuto"}` 
      }),
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
