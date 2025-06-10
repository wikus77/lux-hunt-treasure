
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { RateLimiter } from "../_shared/rateLimiter.ts";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// CORS headers
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

// NEW: Apply secure offset to coordinates for security
const applySecureOffset = (lat: number, lng: number) => {
  const offset = () => (Math.random() - 0.5) * 0.1; // ±~5km
  return {
    lat: lat + offset(),
    lng: lng + offset()
  };
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { userId, generateMap, prizeId, coordinates, sessionId } = requestData as BuzzRequest;
    
    console.log(`🔥 BUZZ REQUEST START - userId: ${userId}, generateMap: ${generateMap}`);
    console.log(`📡 Coordinates received:`, coordinates);
    
    // CRITICAL USER ID VALIDATION
    if (!userId || typeof userId !== 'string') {
      console.error("❌ Invalid userId:", userId);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "ID utente non valido" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // AUTH VALIDATION
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

    // RATE LIMITING CHECK
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

    // Get current week since mission start
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

    // Update buzz counter
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

    // Get user clue count for pricing
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
    
    // Calculate buzz cost
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

    // Generate clue based on current week
    const clueText = generateClueBasedOnWeek(currentWeek);
    console.log(`📍 Generated clue: ${clueText}`);
    
    // Insert clue into user_clues table
    const { data: clueData, error: clueError } = await supabase
      .from('user_clues')
      .insert({
        user_id: userId,
        title_it: `Indizio Buzz #${buzzCount}`,
        description_it: clueText,
        title_en: `Buzz Clue #${buzzCount}`,
        description_en: translateToEnglish(clueText),
        clue_type: 'buzz',
        buzz_cost: buzzCost
      })
      .select('clue_id')
      .single();

    if (clueError) {
      console.error("❌ Error saving clue:", clueError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Errore salvataggio indizio" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ Clue saved with ID: ${clueData.clue_id}`);

    // FORCE GENERATE MAP ALWAYS WHEN generateMap = true
    let response: BuzzResponse = {
      success: true,
      clue_text: clueText,
      buzz_cost: buzzCost
    };

    if (generateMap) {
      console.log(`🗺️ FORCED MAP GENERATION START for user ${userId}`);
      
      // STEP 1: Get or set fixed center coordinates for this user
      let baseCenter = { lat: 41.9028, lng: 12.4964 }; // Default Rome
      
      // Check if user has existing fixed center
      const { data: existingCenter, error: centerError } = await supabase
        .from('user_map_areas')
        .select('lat, lng')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (!centerError && existingCenter) {
        // Use existing fixed center (without offset)
        baseCenter = { lat: existingCenter.lat, lng: existingCenter.lng };
        console.log(`📍 Using existing base center: ${baseCenter.lat}, ${baseCenter.lng}`);
      } else if (coordinates) {
        // Use provided coordinates as new base center
        baseCenter = { lat: coordinates.lat, lng: coordinates.lng };
        console.log(`📍 Setting new base center: ${baseCenter.lat}, ${baseCenter.lng}`);
      }
      
      // STEP 1.5: Apply secure offset to base center
      const secureCenter = applySecureOffset(baseCenter.lat, baseCenter.lng);
      console.log(`🔒 Applied secure offset: ${secureCenter.lat}, ${secureCenter.lng}`);
      
      // STEP 2: Clear existing BUZZ areas
      console.log(`🧹 Clearing existing BUZZ areas...`);
      const { error: deleteError } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error("⚠️ Warning: Could not clear existing areas:", deleteError);
      } else {
        console.log("✅ Cleared existing BUZZ areas successfully");
      }
      
      // STEP 3: Get generation count
      const { data: generationData, error: genError } = await supabase.rpc('increment_map_generation_counter', {
        p_user_id: userId,
        p_week: currentWeek
      });

      const currentGeneration = generationData || 1;
      console.log(`📍 Current generation count: ${currentGeneration}`);
      
      // STEP 4: Calculate radius with FIXED progressive reduction formula
      let radius_km = Math.max(5, 100 * Math.pow(0.95, currentGeneration - 1));
      
      console.log(`📏 SECURE CENTER - Calculated radius: ${radius_km.toFixed(2)}km (generation: ${currentGeneration})`);
      console.log(`📍 SECURE CENTER - Using coordinates: lat=${secureCenter.lat}, lng=${secureCenter.lng}`);
      
      // STEP 5: Save area to database with SECURE CENTER
      const { error: mapError, data: savedArea } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: userId,
          lat: secureCenter.lat,
          lng: secureCenter.lng,
          radius_km: radius_km,
          week: currentWeek,
          clue_id: clueData.clue_id
        })
        .select()
        .single();
        
      if (mapError) {
        console.error("❌ Error saving map area:", mapError);
        response.error = true;
        response.errorMessage = "Errore salvataggio area mappa";
      } else {
        console.log("✅ Map area saved successfully with SECURE CENTER:", savedArea.id);
        
        // Add map data to response with SECURE CENTER
        response.radius_km = radius_km;
        response.lat = secureCenter.lat;
        response.lng = secureCenter.lng;
        response.generation_number = currentGeneration;
        
        console.log(`🎉 MAP GENERATION COMPLETE (SECURE CENTER): radius=${radius_km.toFixed(2)}km, generation=${currentGeneration}, center=${secureCenter.lat},${secureCenter.lng}`);
      }
    }

    console.log(`✅ BUZZ RESPONSE:`, response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("❌ General error in BUZZ handling:", error);
    return new Response(
      JSON.stringify({ success: false, error: true, errorMessage: error.message || "Errore del server" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// Helper function to generate appropriate clue based on week number
function generateClueBasedOnWeek(weekNumber: number): string {
  const vagueClues = [
    "Cerca dove splende il sole sul metallo lucente",
    "L'essenza del premio si nasconde tra storia e modernità",
    "Il tuo obiettivo si muove in spazi aperti e veloci",
    "Una creazione nata dalla passione e dall'innovazione",
    "Dove il design incontra la potenza troverai ciò che cerchi"
  ];
  
  const mediumClues = [
    "La velocità incontra l'eleganza in questo gioiello di ingegneria",
    "Prestigio e prestazioni si fondono in un'opera d'arte meccanica",
    "Un simbolo di status che attende di essere scoperto",
    "La perfezione tecnica nascosta alla vista ma non lontana",
    "Un capolavoro di ingegneria con il cuore pulsante di potenza"
  ];
  
  const geographicClues = [
    "Nella terra della moda e del design, vicino alle Alpi",
    "Cerca nella regione conosciuta per la sua tradizione motoristica",
    "Lungo la costa mediterranea, dove il sole bacia le montagne",
    "Nella pianura fertile, tra fiumi antichi e città moderne",
    "Nella regione che ha dato i natali ai grandi innovatori"
  ];
  
  const preciseClues = [
    "Nella città della moda, dove creatività e industria si incontrano",
    "Cerca nel capoluogo circondato dalle colline, famoso per la sua storia industriale",
    "Nel cuore della città dalle torri medievali, dove tradizione e innovazione convivono",
    "Nella zona industriale della città che ha fatto la storia dell'automobile italiana",
    "Vicino al fiume che attraversa la città, in un'area di sviluppo tecnologico"
  ];
  
  if (weekNumber <= 2) {
    return vagueClues[Math.floor(Math.random() * vagueClues.length)];
  } else if (weekNumber == 3) {
    return mediumClues[Math.floor(Math.random() * mediumClues.length)];
  } else {
    const useMorePrecise = Math.random() > 0.5;
    if (useMorePrecise) {
      return preciseClues[Math.floor(Math.random() * preciseClues.length)];
    } else {
      return geographicClues[Math.floor(Math.random() * geographicClues.length)];
    }
  }
}

function translateToEnglish(italianClue: string): string {
  const translations: Record<string, string> = {
    "Cerca dove splende il sole sul metallo lucente": "Look where the sun shines on gleaming metal",
    "L'essenza del premio si nasconde tra storia e modernità": "The essence of the prize hides between history and modernity",
    "Il tuo obiettivo si muove in spazi aperti e veloci": "Your target moves in open and fast spaces",
    "Una creazione nata dalla passione e dall'innovazione": "A creation born from passion and innovation",
    "Dove il design incontra la potenza troverai ciò che cerchi": "Where design meets power, you'll find what you seek"
  };
  
  return translations[italianClue] || italianClue;
}
