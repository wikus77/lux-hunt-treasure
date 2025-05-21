
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Parse request body
    const requestData = await req.json();
    const { userId, generateMap, prizeId } = requestData as BuzzRequest;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "UserID is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify that userId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid UserID format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get current week since mission start
    const { data: weekData } = await supabase.rpc('get_current_mission_week');
    const currentWeek = weekData || 1;
    console.log(`Current mission week: ${currentWeek}`);

    // Update buzz counter for the user
    const { data: buzzCount, error: buzzCountError } = await supabase.rpc('increment_buzz_counter', {
      p_user_id: userId
    });

    if (buzzCountError) {
      console.error("Error incrementing buzz counter:", buzzCountError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update buzz counter" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Calculate the buzz cost based on daily usage
    const { data: costData, error: costError } = await supabase.rpc('calculate_buzz_price', {
      daily_count: buzzCount
    });

    if (costError || !costData) {
      console.error("Error calculating buzz cost:", costError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to calculate buzz cost" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const buzzCost = costData;
    
    // Check if user is blocked from making more buzz requests today
    if (buzzCost <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Daily limit exceeded (50 buzzes)" }),
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
      console.error("Error saving clue:", clueError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save clue: " + clueError.message }),
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
        console.error("Error incrementing map generation counter:", genError);
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
              
            if (!mapError) {
              response.map_area = mapArea;
            }
          }
          
          response.remainingMapGenerations = maxGenerations - generationData;
          response.canGenerateMap = generationData < maxGenerations;
        }
      }
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error in BUZZ handler:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Server error" }),
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
