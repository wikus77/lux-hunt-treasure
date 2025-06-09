
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
  map_area?: {
    lat: number;
    lng: number;
    radius_km: number;
    week: number;
  };
  precision?: 'high' | 'low';
  canGenerateMap: boolean;
  remainingMapGenerations: number;
  error?: string;
}

// Enhanced in-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; firstRequest: number }>();
const abuseStore = new Map<string, number>();
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const RATE_LIMIT_COUNT = 5; // max 5 requests per window
const ABUSE_THRESHOLD = 10; // trigger alert after 10 violations

// Enhanced rate limiting with abuse detection
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitStore.get(userId);
  
  if (!userRequests || (now - userRequests.firstRequest) > RATE_LIMIT_WINDOW) {
    // Reset window
    rateLimitStore.set(userId, { count: 1, firstRequest: now });
    return true;
  }
  
  if (userRequests.count >= RATE_LIMIT_COUNT) {
    // Track abuse
    const abuseCount = (abuseStore.get(userId) || 0) + 1;
    abuseStore.set(userId, abuseCount);
    
    if (abuseCount >= ABUSE_THRESHOLD) {
      console.error(`🚨 ABUSE ALERT: User ${userId} exceeded rate limit ${abuseCount} times`);
    }
    
    return false;
  }
  
  userRequests.count++;
  return true;
}

// Validazione UUID v4
function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Validate coordinates
function isValidCoordinates(coords: any): coords is { lat: number; lng: number } {
  return coords && 
         typeof coords === 'object' && 
         typeof coords.lat === 'number' && 
         typeof coords.lng === 'number' &&
         coords.lat >= -90 && coords.lat <= 90 &&
         coords.lng >= -180 && coords.lng <= 180;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body first to get userId for logging
    const requestData = await req.json();
    const { userId, generateMap, prizeId, coordinates, sessionId } = requestData as BuzzRequest;
    
    console.log(`🔥 DEBUG: Received userId in request:`, userId);
    console.log(`📡 Full request payload:`, requestData);
    
    // 1. CRITICAL USER ID VALIDATION - FIRST CHECK
    if (!userId) {
      console.error("❌ CRITICAL ERROR: Missing userId parameter in request body");
      return new Response(
        JSON.stringify({ success: false, error: "ID utente non valido - parametro mancante" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (typeof userId !== 'string') {
      console.error("❌ CRITICAL ERROR: UserId is not a string:", typeof userId, userId);
      return new Response(
        JSON.stringify({ success: false, error: "ID utente non valido - formato non corretto" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verifica che userId sia un UUID valido
    if (!isValidUuid(userId)) {
      console.error(`❌ CRITICAL ERROR: Invalid userId format: ${userId}`);
      return new Response(
        JSON.stringify({ success: false, error: "ID utente non valido - formato UUID richiesto" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ USER ID VALIDATION PASSED: ${userId}`);

    // 2. AUTENTICAZIONE - Verifica Authorization Header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Token di autorizzazione mancante" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Estrai il token Bearer
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      console.error("Invalid authorization format");
      return new Response(
        JSON.stringify({ success: false, error: "Formato token di autorizzazione non valido" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create authenticated Supabase client for token verification
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verifica il token con Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Invalid token:", authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Token di autorizzazione non valido" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authenticatedUserId = user.id;
    console.log(`✅ AUTH TOKEN VALIDATION PASSED: ${authenticatedUserId}`);

    // Verifica che l'userId nel payload corrisponda all'utente autenticato
    if (userId !== authenticatedUserId) {
      console.error(`❌ UserId mismatch: payload=${userId}, authenticated=${authenticatedUserId}`);
      return new Response(
        JSON.stringify({ success: false, error: "ID utente non corrispondente all'utente autenticato" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ USER ID MATCH CONFIRMED: ${userId}`);

    // 3. ENHANCED RATE LIMITING - Check abuse before other validations
    if (!checkRateLimit(authenticatedUserId)) {
      console.error(`Rate limit exceeded for user: ${authenticatedUserId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Troppi tentativi. Attendi 5 secondi prima di fare un nuovo BUZZ" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 4. CONTROLLO ANTIFLOOD - Verifica abusi con il sistema esistente
    const { data: isAbuse, error: abuseError } = await supabase.rpc('log_potential_abuse', {
      p_event_type: 'buzz_click',
      p_user_id: authenticatedUserId
    });

    if (abuseError) {
      console.error("Errore nel sistema antiflood:", abuseError);
    }

    if (isAbuse) {
      console.error(`ANTIFLOOD TRIGGERED: User ${authenticatedUserId} exceeded buzz click limit`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Troppe richieste BUZZ ravvicinate. Attendi 30 secondi prima di riprovare." 
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 5. VALIDAZIONE INPUT COMPLETA
    if (typeof generateMap !== 'boolean') {
      console.error("Invalid generateMap parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro generateMap deve essere un boolean" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // CRITICAL: Se generateMap è true, le coordinate devono essere presenti e valide
    if (generateMap && !isValidCoordinates(coordinates)) {
      console.error("Invalid or missing coordinates for map generation");
      return new Response(
        JSON.stringify({ success: false, error: "Coordinate mancanti o non valide per la generazione mappa" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ Security checks passed for user: ${authenticatedUserId}, proceeding with PURE BACKEND UNIFIED LOGIC`);

    // Get current week since mission start
    const { data: weekData, error: weekError } = await supabase.rpc('get_current_mission_week');
    
    if (weekError) {
      console.error("Errore nel recupero della settimana corrente:", weekError);
      return new Response(
        JSON.stringify({ success: false, error: "Impossibile determinare la settimana della missione" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const currentWeek = weekData || 1;
    console.log(`Current mission week: ${currentWeek}`);

    // Update buzz counter for the user
    const { data: buzzCount, error: buzzCountError } = await supabase.rpc('increment_buzz_counter', {
      p_user_id: userId
    });

    if (buzzCountError) {
      console.error("Errore nell'incremento del contatore buzz:", buzzCountError);
      return new Response(
        JSON.stringify({ success: false, error: "Impossibile aggiornare il contatore buzz" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Calculate the buzz cost based on daily usage and clue count
    const { data: userClueCount } = await supabase
      .from('user_clues')
      .select('clue_id', { count: 'exact' })
      .eq('user_id', userId);
      
    const clueCount = userClueCount || 0;
    
    const { data: costData, error: costError } = await supabase.rpc('calculate_buzz_price', {
      daily_count: clueCount
    });

    if (costError || costData === null) {
      console.error("Errore nel calcolo del costo buzz:", costError);
      return new Response(
        JSON.stringify({ success: false, error: "Impossibile calcolare il costo del buzz" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const buzzCost = costData;
    
    // Check if user is blocked from making more buzz requests today
    if (buzzCost <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Limite giornaliero superato (50 buzzes)" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate appropriate clue based on current week
    const clueText = generateClueBasedOnWeek(currentWeek);
    
    // Insert clue into user_clues table with updated schema
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
      console.error("Errore nel salvataggio dell'indizio:", clueError.message, clueError.details, clueError.hint);
      let errorMessage = "Impossibile salvare l'indizio: ";
      
      // Errori specifici in base al tipo
      if (clueError.code === "23505") {
        errorMessage += "Indizio duplicato";
      } else if (clueError.code === "23503") {
        errorMessage += "Riferimento utente non valido";
      } else if (clueError.code === "42P01") {
        errorMessage += "Tabella user_clues non trovata";
      } else if (clueError.code === "42703") {
        errorMessage += "Colonna mancante nella tabella";
      } else {
        errorMessage += clueError.message;
      }
      
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Prepare response
    const response: BuzzResponse = {
      success: true,
      clue_text: clueText,
      buzz_cost: buzzCost,
      canGenerateMap: false,
      remainingMapGenerations: 0
    };

    // CRITICAL: Handle PURE BACKEND UNIFIED map generation if requested
    if (generateMap && coordinates) {
      console.log(`🗺️ PURE BACKEND UNIFIED MAP GENERATION START for user ${userId} with coordinates:`, coordinates);
      
      // STEP 1: Clear any existing BUZZ areas for this user (UNIFIED CLEANUP - MAX 1 AREA)
      const { error: deleteError } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error("Warning: Could not clear existing areas:", deleteError);
      } else {
        console.log("✅ Cleared existing BUZZ areas for pure backend unified generation");
      }
      
      // STEP 2: Get the current generation count for this week (PROGRESSIVE LOGIC WITH 5% REDUCTION)
      const { data: generationData, error: genError } = await supabase.rpc('increment_map_generation_counter', {
        p_user_id: userId,
        p_week: currentWeek
      });

      if (genError) {
        console.error("Errore nell'incremento del contatore di generazione mappe:", genError);
      } else {
        // STEP 3: Get max allowed generations for this week
        const { data: maxGenData } = await supabase.rpc('get_max_map_generations', {
          p_week: currentWeek
        });
        const maxGenerations = maxGenData || 4;
        
        // STEP 4: Check if user still has map generations available
        if (generationData <= maxGenerations) {
          // STEP 5: Get INITIAL radius for this generation from backend function
          const { data: baseRadiusData } = await supabase.rpc('get_map_radius_km', {
            p_week: currentWeek,
            p_generation_count: generationData
          });
          let radius_km = baseRadiusData || 100;
          
          console.log(`📏 PURE BACKEND INITIAL RADIUS: week=${currentWeek}, generation=${generationData}, base_radius=${radius_km}km`);
          
          // STEP 6: Apply PROGRESSIVE 5% REDUCTION for each previous generation (PURE BACKEND CALCULATION)
          if (generationData > 1) {
            const reductionFactor = Math.pow(0.95, generationData - 1); // 5% reduction per generation
            radius_km = Math.max(5, radius_km * reductionFactor); // Minimum 5km as specified
            console.log(`📉 APPLIED PURE BACKEND 5% PROGRESSIVE REDUCTION: ${radius_km.toFixed(2)}km (factor: ${reductionFactor.toFixed(3)}, min: 5km)`);
          }
          
          // STEP 7: Use provided coordinates directly (PURE BACKEND COORDINATE LOGIC)
          const mapArea = {
            lat: coordinates.lat,
            lng: coordinates.lng,
            radius_km: radius_km, // PURE BACKEND CALCULATION WITH 5% REDUCTION
            week: currentWeek
          };
          
          console.log(`🎯 PURE BACKEND UNIFIED AREA DATA WITH 5% REDUCTION:`, mapArea);
          
          // STEP 8: Save map area to database (PURE BACKEND STORAGE)
          const { error: mapError } = await supabase
            .from('user_map_areas')
            .insert({
              user_id: userId,
              lat: mapArea.lat,
              lng: mapArea.lng,
              radius_km: mapArea.radius_km, // REAL CALCULATED VALUE WITH 5% REDUCTION
              week: currentWeek,
              clue_id: clueData.clue_id
            });
            
          if (mapError) {
            console.error("❌ PURE BACKEND UNIFIED ERROR saving map area:", mapError);
          } else {
            console.log("✅ PURE BACKEND UNIFIED MAP AREA SAVED successfully with 5% reduction applied");
            response.map_area = mapArea;
            
            // Determine precision based on user clue count vs generation count
            const totalClueCount = clueCount + 1; // Include the new clue
            response.precision = totalClueCount > generationData ? 'high' : 'low';
            
            console.log(`🎯 PURE BACKEND UNIFIED PRECISION: ${response.precision} (clues: ${totalClueCount}, generations: ${generationData})`);
          }
          
          response.remainingMapGenerations = maxGenerations - generationData;
          response.canGenerateMap = generationData < maxGenerations;
          
          console.log(`🗺️ PURE BACKEND UNIFIED MAP GENERATION COMPLETE WITH 5% REDUCTION: remaining=${response.remainingMapGenerations}, current_radius=${radius_km.toFixed(2)}km`);
        } else {
          console.log(`❌ User ${userId} has reached map generation limit for week ${currentWeek}`);
        }
      }
    }

    console.log(`🎉 PURE BACKEND UNIFIED RESPONSE WITH 5% REDUCTION:`, response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Errore generale nella gestione BUZZ:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Errore del server" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
  
  // Select appropriate clue type based on week
  if (weekNumber <= 2) {
    return vagueClues[Math.floor(Math.random() * vagueClues.length)];
  } else if (weekNumber == 3) {
    return mediumClues[Math.floor(Math.random() * mediumClues.length)];
  } else {
    // For week 4+, use geographic clues but randomly mix with more precise city clues
    const useMorePrecise = Math.random() > 0.5;
    if (useMorePrecise) {
      return preciseClues[Math.floor(Math.random() * preciseClues.length)];
    } else {
      return geographicClues[Math.floor(Math.random() * geographicClues.length)];
    }
  }
}

// Helper function to translate clues to English (simplified translation for this example)
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
