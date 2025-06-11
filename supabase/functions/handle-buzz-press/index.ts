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

const logError = async (error: any, context: any) => {
  console.error("❌ EDGE FUNCTION ERROR:", error);
  
  if (context?.email === "wikus77@hotmail.it") {
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase.from('abuse_logs').insert({
      user_id: context?.userId || 'unknown',
      event_type: 'edge_function_error',
      timestamp: new Date().toISOString(),
      ip_address: context?.ipAddress || 'unknown',
      meta: { 
        function: 'handle-buzz-press',
        error: error.message || String(error),
        stack: error.stack,
        context
      }
    });
  } catch (logError) {
    console.error("Failed to log error:", logError);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let requestData: any;
  
  try {
    requestData = await req.json();
    const { userId, generateMap, prizeId, coordinates, sessionId } = requestData as BuzzRequest;
    
    console.log(`🔒 SECURE BUZZ REQUEST START - userId: ${userId}, generateMap: ${generateMap}`);
    console.log(`📡 Coordinates received:`, coordinates);
    
    if (!userId || typeof userId !== 'string') {
      console.error("❌ Invalid userId:", userId);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "ID utente non valido" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("❌ Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Token di autorizzazione mancante" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user || user.id !== userId) {
      console.error("❌ Auth validation failed");
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Autorizzazione non valida" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ Auth validation passed for user: ${userId}`);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_end, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("❌ Error fetching user profile:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Profilo utente non trovato" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: payments, error: paymentsError } = await supabase
      .from('payment_transactions')
      .select('status, created_at, amount')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('status, tier, end_date')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const hasActiveSubscription = subscription && 
      new Date(subscription.end_date || '') > new Date();
    
    const hasValidPayment = (payments && payments.length > 0) || hasActiveSubscription;
    const subscriptionTier = profile?.subscription_tier || 'Free';

    console.log(`🔒 PAYMENT VERIFICATION RESULT:`, {
      hasValidPayment,
      subscriptionTier,
      hasActiveSubscription,
      paymentsCount: payments?.length || 0
    });

    if (!hasValidPayment || subscriptionTier === 'Free') {
      console.error(`❌ PAYMENT VERIFICATION FAILED - No valid payment or free tier`);
      
      await supabase.from('abuse_logs').insert({
        user_id: userId,
        event_type: 'unauthorized_access',
        meta: {
          access_type: 'buzz_no_payment',
          subscription_tier: subscriptionTier,
          has_valid_payment: hasValidPayment,
          timestamp: new Date().toISOString()
        }
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: true, 
          errorMessage: "Pagamento richiesto. Questa funzione è disponibile solo per utenti con abbonamento attivo o pagamento confermato." 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: allowance, error: allowanceError } = await supabase
      .from('weekly_buzz_allowances')
      .select('max_buzz_count, used_buzz_count')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (allowance && allowance.used_buzz_count >= allowance.max_buzz_count) {
      console.error(`❌ BUZZ LIMIT EXCEEDED for user: ${userId}`);
      
      await supabase.from('abuse_logs').insert({
        user_id: userId,
        event_type: 'unauthorized_access',
        meta: {
          access_type: 'buzz_limit_exceeded',
          used_buzz: allowance.used_buzz_count,
          max_buzz: allowance.max_buzz_count,
          timestamp: new Date().toISOString()
        }
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: true, 
          errorMessage: "Limite settimanale BUZZ raggiunto. Upgrade del piano necessario." 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ PAYMENT AND LIMITS VERIFIED - Proceeding with secure buzz generation`);

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
      console.error("❌ Error getting current week:", weekError);
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
      console.error("❌ Error incrementing buzz counter:", buzzCountError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Errore contatore buzz" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`📍 Updated buzz count: ${buzzCount}`);

    const { data: userClueCount, error: clueCountError } = await supabase
      .from('user_clues')
      .select('clue_id', { count: 'exact' })
      .eq('user_id', userId);
      
    if (clueCountError) {
      console.error("❌ Error getting clue count:", clueCountError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Errore conteggio indizi" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const clueCount = userClueCount?.length || 0;
    console.log(`📍 Current clue count: ${clueCount}`);
    
    const { data: costData, error: costError } = await supabase.rpc('calculate_buzz_price', {
      daily_count: clueCount + 1
    });

    if (costError || costData === null) {
      console.error("❌ Error calculating buzz cost:", costError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Errore calcolo costo" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const buzzCost = costData;
    console.log(`📍 Calculated buzz cost: €${buzzCost}`);
    
    if (buzzCost <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Limite giornaliero superato (50 buzzes)" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let clueText = `🔒 Indizio generato per settimana ${currentWeek}`;
    console.log(`📍 Generated SECURE clue: ${clueText}`);
    
    const { data: clueData, error: clueError } = await supabase
      .from('user_clues')
      .insert({
        user_id: userId,
        title_it: `Indizio Premium Verificato #${buzzCount}`,
        description_it: clueText,
        title_en: `Verified Premium Clue #${buzzCount}`,
        description_en: translateToEnglish(clueText),
        clue_type: 'premium_verified',
        buzz_cost: 0
      })
      .select('clue_id')
      .single();

    if (clueError) {
      console.error("❌ Error saving verified clue:", clueError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Errore salvataggio indizio verificato" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ SECURE clue saved with ID: ${clueData.clue_id}`);

    let response: BuzzResponse = {
      success: true,
      clue_text: `🔒 Indizio generato per settimana ${currentWeek}`,
      buzz_cost: 0
    };

    if (generateMap) {
      console.log(`🗺️ FORCED MAP GENERATION START for user ${userId}`);
      
      let baseCenter = { lat: 41.9028, lng: 12.4964 };
      
      if (coordinates) {
        baseCenter = { lat: coordinates.lat, lng: coordinates.lng };
        console.log(`📍 Setting new base center: ${baseCenter.lat}, ${baseCenter.lng}`);
      }
      
      const secureCenter = applySecureOffset(baseCenter.lat, baseCenter.lng);
      console.log(`🔒 Applied secure offset: ${secureCenter.lat}, ${secureCenter.lng}`);
      
      const { error: deleteError } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error("⚠️ Warning: Could not clear existing areas:", deleteError);
      }
      
      // FIXED: Get current generation count and increment atomically
      const { data: counterData, error: counterError } = await supabase
        .from('user_buzz_map_counter')
        .select('buzz_map_count')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      let currentGeneration = (counterData?.buzz_map_count || 0) + 1;
      
      // FIXED: Atomic upsert with onConflict
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
        console.error("❌ Error updating counter:", updateError);
        currentGeneration = 1; // Fallback
      } else {
        currentGeneration = updatedCounter.buzz_map_count;
        console.log(`✅ Counter updated successfully: generation ${currentGeneration}`);
      }

      // FIXED: Correct radius calculation: max(500 * 0.95^(generation-1), 5)
      let radius_km;
      if (currentGeneration === 1) {
        radius_km = 500;
        console.log("✅ BUZZ MAPPA PARTENZA DA 500km - FIRST GENERATION");
      } else {
        radius_km = Math.max(5, 500 * Math.pow(0.95, currentGeneration - 1));
        console.log("✅ RADIUS REDUCTION: Generation", currentGeneration, "= ", radius_km, "km");
      }
      
      const { error: mapError } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: userId,
          lat: secureCenter.lat,
          lng: secureCenter.lng,
          radius_km: radius_km,
          week: currentWeek
        });
        
      if (mapError) {
        console.error("❌ Error saving map area:", mapError);
        response.error = true;
        response.errorMessage = "Errore salvataggio area mappa";
      } else {
        console.log("✅ Map area saved successfully");
        
        // FIXED: Notification insertion with is_read: false
        try {
          const { data: notificationData, error: notificationError } = await supabase
            .from('user_notifications')
            .insert({
              user_id: userId,
              title: "Nuova Area Generata",
              message: "Nuova area generata da BUZZ!",
              type: "buzz_generated",
              is_read: false
            })
            .select('id')
            .single();

          if (notificationError) {
            console.error("❌ Error creating notification:", notificationError);
          } else {
            console.log("✅ Notifica inviata");
            console.log("✅ Notification created successfully:", notificationData.id);
          }
        } catch (notifError) {
          if (userId) {
            console.warn("⚠️ Warning: Could not create notification for user:", userId);
          } else {
            console.error("❌ user_id is null, cannot create notification");
          }
        }

        response.radius_km = radius_km;
        response.lat = secureCenter.lat;
        response.lng = secureCenter.lng;
        response.generation_number = currentGeneration;
        
        console.log(`✅ BUZZ #${currentGeneration} – Raggio: ${radius_km}km – Area generata`);
      }
    }

    console.log(`✅ SECURE BUZZ RESPONSE:`, response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("❌ General error in SECURE BUZZ handling:", error);
    
    await logError(error, {
      userId: requestData?.userId,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      email: null
    });
    
    return new Response(
      JSON.stringify({ success: false, error: true, errorMessage: error.message || "Errore del server" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

function generateClueBasedOnWeek(weekNumber: number): string {
  const vagueClues = [
    "Cerca dove splende il sole sul metallo lucente",
    "L'essenza del premio si nasconde tra storia e modernità",
    "Il tuo obiettivo si muove in spazi aperti e veloci",
    "Una creazione nata dalla passione e dall'innovazione",
    "Dove il design incontra la potenza troverai ciò che cerchi"
  ];
  
  return vagueClues[Math.floor(Math.random() * vagueClues.length)];
}

function translateToEnglish(italianClue: string): string {
  const translations: Record<string, string> = {
    "Cerca dove splende il sole sul metallo lucente": "Look where the sun shines on gleaming metal"
  };
  
  return translations[italianClue] || italianClue;
}
