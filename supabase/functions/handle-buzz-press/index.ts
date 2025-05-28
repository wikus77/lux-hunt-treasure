
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
  canGenerateMap: boolean;
  remainingMapGenerations: number;
  error?: string;
}

// In-memory rate limiting store (simple implementation)
const rateLimitStore = new Map<string, number>();
const RATE_LIMIT_WINDOW = 5000; // 5 seconds

// Validazione UUID v4
function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Rate limiting check
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitStore.get(userId);
  
  if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW) {
    return false; // Rate limit exceeded
  }
  
  rateLimitStore.set(userId, now);
  return true;
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
    // 1. AUTENTICAZIONE - Verifica Authorization Header
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

    // 2. RATE LIMITING - Controllo spam (1 BUZZ ogni 5 secondi)
    if (!checkRateLimit(authenticatedUserId)) {
      console.error(`Rate limit exceeded for user: ${authenticatedUserId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Troppi tentativi. Attendi 5 secondi prima di fare un nuovo BUZZ" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse request body
    const requestData = await req.json();
    const { userId, generateMap, prizeId, coordinates, sessionId } = requestData as BuzzRequest;
    
    // 3. VALIDAZIONE INPUT COMPLETA
    if (!userId) {
      console.error("Missing userId parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro userId mancante" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (typeof generateMap !== 'boolean') {
      console.error("Invalid generateMap parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro generateMap deve essere un boolean" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verifica che userId sia un UUID valido
    if (!isValidUuid(userId)) {
      console.error(`Invalid userId format: ${userId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Formato userId non valido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verifica che l'userId nel payload corrisponda all'utente autenticato
    if (userId !== authenticatedUserId) {
      console.error(`UserId mismatch: payload=${userId}, authenticated=${authenticatedUserId}`);
      return new Response(
        JSON.stringify({ success: false, error: "UserId non corrispondente all'utente autenticato" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Se generateMap è true, le coordinate devono essere presenti e valide
    if (generateMap && !isValidCoordinates(coordinates)) {
      console.error("Invalid or missing coordinates for map generation");
      return new Response(
        JSON.stringify({ success: false, error: "Coordinate mancanti o non valide per la generazione mappa" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validazione opzionale sessionId se presente
    if (sessionId && typeof sessionId !== 'string') {
      console.error("Invalid sessionId parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro sessionId deve essere una stringa" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ Security checks passed for user: ${authenticatedUserId}`);

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

    // Calculate the buzz cost based on daily usage
    const { data: costData, error: costError } = await supabase.rpc('calculate_buzz_price', {
      daily_count: buzzCount
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

    // Handle map generation if requested
    if (generateMap && prizeId) {
      // Get the current generation count for this week
      const { data: generationData, error: genError } = await supabase.rpc('increment_map_generation_counter', {
        p_user_id: userId,
        p_week: currentWeek
      });

      if (genError) {
        console.error("Errore nell'incremento del contatore di generazione mappe:", genError);
      } else {
        // Get max allowed generations for this week
        const { data: maxGenData } = await supabase.rpc('get_max_map_generations', {
          p_week: currentWeek
        });
        const maxGenerations = maxGenData || 4;
        
        // Check if user still has map generations available
        if (generationData <= maxGenerations) {
          // Get radius for this generation
          const { data: radiusData } = await supabase.rpc('get_map_radius_km', {
            p_week: currentWeek,
            p_generation_count: generationData
          });
          const radius_km = radiusData || 100;
          
          // Get prize coordinates
          const { data: prizeData } = await supabase
            .from('prizes')
            .select('lat, lng')
            .eq('id', prizeId)
            .single();
            
          if (prizeData && prizeData.lat && prizeData.lng) {
            // Create map area with some randomization within the allowed radius
            const jitter = radius_km * 0.3; // 30% jitter
            const jitterLat = (Math.random() * 2 - 1) * jitter / 111; // ~111km per degree of latitude
            const jitterLng = (Math.random() * 2 - 1) * jitter / (111 * Math.cos(prizeData.lat * Math.PI / 180));
            
            const mapArea = {
              lat: prizeData.lat + jitterLat,
              lng: prizeData.lng + jitterLng,
              radius_km: radius_km,
              week: currentWeek
            };
            
            // Save map area to database
            const { error: mapError } = await supabase
              .from('user_map_areas')
              .insert({
                user_id: userId,
                lat: mapArea.lat,
                lng: mapArea.lng,
                radius_km: mapArea.radius_km,
                week: currentWeek,
                clue_id: clueData.clue_id
              });
              
            if (mapError) {
              console.error("Errore nel salvare l'area della mappa:", mapError);
            } else {
              response.map_area = mapArea;
            }
          } else {
            console.error("Impossibile trovare le coordinate del premio:", prizeId);
          }
          
          response.remainingMapGenerations = maxGenerations - generationData;
          response.canGenerateMap = generationData < maxGenerations;
        } else {
          console.log(`Utente ${userId} ha raggiunto il limite di generazioni mappa per la settimana ${currentWeek}`);
        }
      }
    }

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
