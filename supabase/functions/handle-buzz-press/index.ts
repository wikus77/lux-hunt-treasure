// by Joseph Mulé – M1SSION™
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
  radius_km?: number;
  lat?: number;
  lng?: number;
  generation_number?: number;
  error?: boolean;
  errorMessage?: string;
}

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

    // CRITICAL: Ensure user profile exists (fix foreign key constraint error)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.log("📝 Creating missing user profile");
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          created_at: new Date().toISOString()
        });
      
      if (createProfileError) {
        console.error("❌ Error creating profile:", createProfileError);
        return new Response(
          JSON.stringify({ success: false, error: true, errorMessage: "Errore creazione profilo utente" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      console.log("✅ User profile created successfully");
    }

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

    // 🧬 BUZZ_CLUE_ENGINE - Generate clue with progressive logic
    const clueEngineResult = await generateSmartClue(supabase, userId, currentWeek);
    console.log(`🧬 BUZZ_CLUE_ENGINE Result:`, clueEngineResult);
    
    if (!clueEngineResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: clueEngineResult.error }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Insert clue into user_clues table with full BUZZ_CLUE_ENGINE data
    const { data: clueData, error: clueError } = await supabase
      .from('user_clues')
      .insert({
        user_id: userId,
        title_it: `Indizio ${clueEngineResult.clue_category} #${buzzCount}`,
        description_it: clueEngineResult.clue_text,
        title_en: `${clueEngineResult.clue_category} Clue #${buzzCount}`,
        description_en: translateToEnglish(clueEngineResult.clue_text),
        clue_type: 'buzz',
        buzz_cost: buzzCost,
        week_number: currentWeek,
        is_misleading: clueEngineResult.is_misleading,
        location_id: clueEngineResult.location_id,
        prize_id: clueEngineResult.prize_id,
        clue_category: clueEngineResult.clue_category
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

    // Initialize response with GUARANTEED clue_text propagation
    let response: BuzzResponse = {
      success: true,
      clue_text: clueEngineResult.clue_text || "⚠️ Indizio generato ma non ricevuto. Riprova tra poco.",
      buzz_cost: buzzCost
    };
    
    console.log(`🔍 CLUE PROPAGATION DEBUG - Generated text: "${clueEngineResult.clue_text}"`);
    console.log(`🔍 CLUE PROPAGATION DEBUG - Response text: "${response.clue_text}"`);

    // CRITICAL: Map generation with CORRECTED PROGRESSIVE radius
    if (generateMap) {
      console.log(`🗺️ CORRECTED PROGRESSIVE RADIUS MAP GENERATION START for user ${userId}`);
      
      // STEP 1: Get or set fixed center coordinates for this user
      let fixedCenter = { lat: 41.9028, lng: 12.4964 }; // Default Rome
      
      // Check if user has existing fixed center
      const { data: existingCenter, error: centerError } = await supabase
        .from('user_map_areas')
        .select('lat, lng')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (!centerError && existingCenter) {
        // Use existing fixed center
        fixedCenter = { lat: existingCenter.lat, lng: existingCenter.lng };
        console.log(`📍 Using existing fixed center: ${fixedCenter.lat}, ${fixedCenter.lng}`);
      } else if (coordinates) {
        // Use provided coordinates as new fixed center
        fixedCenter = { lat: coordinates.lat, lng: coordinates.lng };
        console.log(`📍 Setting new fixed center: ${fixedCenter.lat}, ${fixedCenter.lng}`);
      }
      
      // STEP 2: Count existing map areas for this user to determine generation
      const { data: existingAreas, error: countError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', userId);
        
      const currentGeneration = (existingAreas?.length || 0) + 1;
      console.log(`📍 Current generation count: ${currentGeneration}`);
      
      // STEP 3: Calculate CORRECTED PROGRESSIVE radius: 500km → 5km
      // CRITICAL FORMULA: radius = max(5, 500 * (0.95^(generation-1)))
      let radius_km = Math.max(5, 500 * Math.pow(0.95, currentGeneration - 1));
      
      console.log(`📏 CORRECTED PROGRESSIVE RADIUS - Calculated radius: ${radius_km.toFixed(2)}km (generation: ${currentGeneration})`);
      console.log(`📍 FIXED CENTER - Using coordinates: lat=${fixedCenter.lat}, lng=${fixedCenter.lng}`);
      
      // STEP 4: Save area to database with CORRECTED PROGRESSIVE RADIUS
      const { error: mapError, data: savedArea } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: userId,
          lat: fixedCenter.lat,
          lng: fixedCenter.lng,
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
        console.log("✅ Map area saved successfully with CORRECTED PROGRESSIVE RADIUS:", savedArea.id);
        
        // Add map data to response with CORRECTED PROGRESSIVE RADIUS
        response.radius_km = radius_km;
        response.lat = fixedCenter.lat;
        response.lng = fixedCenter.lng;
        response.generation_number = currentGeneration;
        
        console.log(`🎉 MAP GENERATION COMPLETE (CORRECTED PROGRESSIVE RADIUS): radius=${radius_km.toFixed(2)}km, generation=${currentGeneration}, center=${fixedCenter.lat},${fixedCenter.lng}`);
      }
    }

    // ✅ INSERIRE NOTIFICA PER L'UTENTE CON CLUE_TEXT VALIDO
    if (clueEngineResult.clue_text && clueEngineResult.clue_text.trim() !== '') {
      const { error: notificationError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          title: '🧩 Nuovo indizio M1SSION™',
          message: clueEngineResult.clue_text,
          type: 'clue',
          is_read: false
        });
        
      if (notificationError) {
        console.error("❌ Error saving notification:", notificationError);
        await supabase.from('admin_logs').insert({
          user_id: userId,
          event_type: 'notification_error',
          context: `Failed to save notification: ${notificationError.message}`,
          note: `Clue text: "${clueEngineResult.clue_text.substring(0, 50)}..."`,
          device: 'web_app'
        });
      } else {
        console.log("✅ Notification saved successfully with clue_text");
        await supabase.from('admin_logs').insert({
          user_id: userId,
          event_type: 'notification_success',
          context: `Notification saved successfully`,
          note: `Clue text: "${clueEngineResult.clue_text.substring(0, 50)}..."`,
          device: 'web_app'
        });
      }
    } else {
      console.error("❌ Cannot save notification: clue_text is empty or null");
      await supabase.from('admin_logs').insert({
        user_id: userId,
        event_type: 'clue_text_error',
        context: `BUZZ_CLUE_ENGINE returned empty clue_text`,
        note: `Engine result: ${JSON.stringify(clueEngineResult)}`,
        device: 'web_app'
      });
    }

    // Final logging and admin tracking
    await supabase.from('admin_logs').insert({
      user_id: userId,
      event_type: 'buzz_clue_generated',
      context: `Week ${currentWeek}, Category: ${clueEngineResult.clue_category}, Misleading: ${clueEngineResult.is_misleading}`,
      note: `Generated clue: "${clueEngineResult.clue_text.substring(0, 50)}..."`,
      device: 'web_app'
    });

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

// 🧬 BUZZ_CLUE_ENGINE - Intelligent clue generation system
interface ClueEngineResult {
  success: boolean;
  clue_text: string;
  clue_category: 'location' | 'prize';
  is_misleading: boolean;
  location_id?: string;
  prize_id?: string;
  error?: string;
}

async function generateSmartClue(supabase: any, userId: string, currentWeek: number): Promise<ClueEngineResult> {
  console.log(`🧬 BUZZ_CLUE_ENGINE Starting for user ${userId}, week ${currentWeek}`);
  
  try {
    // STEP 1: Get active target from buzz_game_targets (SISTEMA INTEGRATO)
    const { data: activeTarget, error: targetError } = await supabase
      .from('buzz_game_targets')
      .select('*')
      .eq('is_active', true)
      .single();
      
    if (targetError || !activeTarget) {
      console.error('❌ No active target found:', targetError);
      return { success: false, clue_text: '', clue_category: 'location', is_misleading: false, error: 'Nessun target attivo trovato nel sistema' };
    }
    
    console.log(`🎯 Active target: ${activeTarget.prize_description} in ${activeTarget.city} (ID: ${activeTarget.id})`);
    
    // STEP 2: Determine clue category (50% location, 50% prize)
    const clueCategory: 'location' | 'prize' = Math.random() > 0.5 ? 'location' : 'prize';
    
    // STEP 4: Check if user has already used clues for this combination
    const { data: usedClues, error: usedError } = await supabase
      .from('user_used_clues')
      .select('*')
      .eq('user_id', userId)
      .eq('week_number', currentWeek)
      .eq('clue_category', clueCategory);
      
    if (usedError) {
      console.error('❌ Error checking used clues:', usedError);
      return { success: false, clue_text: '', clue_category, is_misleading: false, error: 'Errore controllo indizi utilizzati' };
    }
    
    // STEP 5: Generate appropriate clue based on week and category using activeTarget
    const clueData = await generateTargetClue(currentWeek, clueCategory, activeTarget, usedClues || []);
    
    // STEP 6: Mark clue as used
    const { error: markUsedError } = await supabase
      .from('user_used_clues')
      .insert({
        user_id: userId,
        custom_clue_text: clueData.clue_text,
        week_number: currentWeek,
        clue_category: clueCategory,
        used_at: new Date().toISOString()
      });
      
    if (markUsedError) {
      console.log('⚠️ Warning: Could not mark clue as used:', markUsedError);
    }
    
    console.log(`✅ BUZZ_CLUE_ENGINE Generated: ${clueData.clue_text}`);
    
    return {
      success: true,
      clue_text: clueData.clue_text,
      clue_category: clueCategory,
      is_misleading: clueData.is_misleading,
      location_id: clueCategory === 'location' ? activeTarget.id : undefined,
      prize_id: clueCategory === 'prize' ? activeTarget.id : undefined
    };
    
  } catch (error) {
    console.error('❌ BUZZ_CLUE_ENGINE Error:', error);
    return { success: false, clue_text: '', clue_category: 'location', is_misleading: false, error: 'Errore nel motore indizi' };
  }
}

// Generate target-based clues from buzz_game_targets
async function generateTargetClue(week: number, category: 'location' | 'prize', target: any, usedClues: any[]): Promise<{clue_text: string, is_misleading: boolean}> {
  const is_misleading = Math.random() < 0.25; // 25% chance of misleading clue
  
  // Week 1: Very vague, symbolic clues
  const week1Clues = {
    location: [
      "Dove le strade si intrecciano come fili dorati",
      "Nel regno dei sapori e delle tradizioni antiche", 
      "Tra colline che sussurrano segreti al vento",
      "Dove il sole dipinge ombre danzanti sui muri",
      "Nel cuore pulsante di terre benedette"
    ],
    prize: [
      "Un gioiello di metallo e passione ti attende",
      "L'incarnazione della velocità e dell'eleganza",
      "Un sogno che ronza di potenza nascosta",
      "Quattro ruote che portano verso l'infinito",
      "Il frutto della maestria e dell'innovazione"
    ]
  };
  
  // Week 2: Generic geographic/mechanical clues  
  const week2Clues = {
    location: [
      "In una provincia del Nord-Ovest, tra montagne e mare",
      "Dove l'industria incontra la bellezza naturale",
      "In terra ligure, vicino al confine con la Francia",
      "Nella regione dei fiori e del pesto",
      "Lungo la costa che guarda verso la Provenza"
    ],
    prize: [
      `Il rombo di un ${target.prize_description} echeggia nell'aria`,
      `Cavalli di potenza racchiusi in una macchina da sogno`,
      `Accelerazione mozzafiato e linee da capogiro`,
      `Lusso e prestazioni in perfetta armonia`,
      "Un capolavoro dell'ingegneria automobilistica moderna"
    ]
  };
  
  // Week 3: More precise location/technical details using target data
  const week3Clues = {
    location: [
      `Nel cuore di ${target.city}, strada principale`,
      `Vicino all'indirizzo ${target.address.split(',')[0]}`,
      `Coordinate approssimative: ${target.lat.toFixed(1)}°N, ${target.lon.toFixed(1)}°E`,
      `In provincia della città che ospita il premio`,
      "Lungo la via principale, tra i palazzi storici"
    ],
    prize: [
      `Il rombo del ${target.prize_description} che ti aspetta`,
      `${target.prize_description} - il tuo obiettivo finale`,
      `Lusso su quattro ruote: ${target.prize_description}`,
      "Aerodinamica studiata nei minimi dettagli",
      "Il premio che cambierà la tua vita"
    ]
  };
  
  // Week 4: Very precise, decodable clues
  const week4Clues = {
    location: [
      "V-E-N-T-I-M-I-G-L-I-A: riarrangia le lettere",
      "Coordinate: 43.7915°N, 7.6089°E (±50km)",
      "CAP 18039, lungo la via principale della città",
      "Anagramma della regione: LIGURIA → L-I-G-U-R-I-A",
      "Al numero 232 del corso principale"
    ],
    prize: [
      `Anagramma del marchio: ${scrambleText(prize.name?.split(' ')[0] || 'AUTO')}`,
      `Il modello nasconde: ${scrambleText(prize.name?.split(' ')[1] || 'SPEED')}`,
      `Anno ${new Date().getFullYear()}, colore ${getRandomColor()}`,
      `Numero telaio che inizia con: ${generateVinStart()}`,
      `Valore stimato: €${Math.floor(Math.random() * 500000 + 100000)}`
    ]
  };
  
  const weekClues = [week1Clues, week2Clues, week3Clues, week4Clues];
  const selectedWeekClues = weekClues[Math.min(week - 1, 3)];
  const categoryClues = selectedWeekClues[category];
  
  // Filter out already used clues
  const usedTexts = usedClues.map(uc => uc.custom_clue_text);
  const availableClues = categoryClues.filter(clue => !usedTexts.includes(clue));
  
  // If all clues used, use fallback
  const clue_text = availableClues.length > 0 
    ? availableClues[Math.floor(Math.random() * availableClues.length)]
    : `Indizio ${category} settimana ${week} - ID: ${Math.random().toString(36).substr(2, 9)}`;
    
  return { clue_text, is_misleading };
}

// Helper functions
function scrambleText(text: string): string {
  return text.split('').sort(() => Math.random() - 0.5).join(' ');
}

function getRandomColor(): string {
  const colors = ['Rosso', 'Blu', 'Nero', 'Bianco', 'Grigio', 'Verde'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateVinStart(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function translateToEnglish(italianClue: string): string {
  // Basic translation fallback - in real implementation, use a translation service
  const translations: Record<string, string> = {
    "Cerca dove splende il sole sul metallo lucente": "Look where the sun shines on gleaming metal",
    "L'essenza del premio si nasconde tra storia e modernità": "The essence of the prize hides between history and modernity",
    "Il tuo obiettivo si muove in spazi aperti e veloci": "Your target moves in open and fast spaces",
    "Una creazione nata dalla passione e dall'innovazione": "A creation born from passion and innovation",
    "Dove il design incontra la potenza troverai ciò che cerchi": "Where design meets power, you'll find what you seek"
  };
  
  return translations[italianClue] || italianClue.replace(/à|è|ì|ò|ù/g, (match) => {
    const map: Record<string, string> = { 'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u' };
    return map[match] || match;
  });
}
