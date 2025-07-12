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
  // 🚨 DEBUG: Log di ogni richiesta ricevuta
  console.log(`🔥 BUZZ EDGE FUNCTION CALLED - Method: ${req.method}, URL: ${req.url}, Time: ${new Date().toISOString()}`);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log(`✅ CORS preflight handled`);
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
      console.error("❌ Auth validation failed:", authError?.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: true, 
          errorMessage: `Autorizzazione non valida: ${authError?.message || 'User mismatch'}` 
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
    
    // by Joseph Mulé – M1SSION™ – FIXED: Proper auth validation using existing token
    console.log('🔐 Using already validated user from request:', userId);
    
    // Fix by Lovable AI per Joseph Mulé – M1SSION™ – FINAL DEBUG INSERT CLUE
    console.log('💾 Attempting to save clue to user_clues...');
    
    // SIMPLIFIED APPROACH: Use only valid data, no foreign key dependencies
    const cluePayload = {
      user_id: userId,
      title_it: `🧩 Indizio BUZZ #${buzzCount}`,
      description_it: clueEngineResult.clue_text,
      title_en: `🧩 BUZZ Clue #${buzzCount}`,
      description_en: translateToEnglish(clueEngineResult.clue_text),
      clue_type: 'buzz',
      buzz_cost: buzzCost,
      week_number: currentWeek,
      is_misleading: clueEngineResult.is_misleading,
      clue_category: clueEngineResult.clue_category,
      // Fix by Lovable AI per Joseph Mulé – M1SSION™ - Set nullable fields to null to avoid constraint issues
      location_id: null,
      prize_id: null
    };
    
    console.log('💾 Final clue payload:', JSON.stringify(cluePayload, null, 2));
    
    console.log('🚨 PRE-INSERT DEBUG - user_clues table check...');
    // Log the exact state before insert
    console.log(`🔍 INSERT ATTEMPT - userId: ${userId}, clue_text: "${clueEngineResult.clue_text}", category: ${clueEngineResult.clue_category}`);
    
    
    const { data: clueData, error: clueError } = await supabase
      .from('user_clues')
      .insert(cluePayload)
      .select('clue_id')
      .single();

    if (clueError) {
      console.error("❌ FINAL ERROR saving clue - COMPLETE DEBUG:", {
        error: clueError,
        message: clueError.message,
        details: clueError.details,
        hint: clueError.hint,
        code: clueError.code,
        payload: cluePayload
      });
      
      // Fix by Lovable AI per Joseph Mulé – M1SSION™ - Detailed error response
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: true, 
          errorMessage: `❌ M1SSION™ CLUE SAVE ERROR: ${clueError.message}`,
          debug: {
            code: clueError.code,
            details: clueError.details,
            hint: clueError.hint,
            payload: cluePayload
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    
    // Fix by Lovable AI per Joseph Mulé – M1SSION™ - Success confirmation
    console.log('✅ M1SSION™ CLUE SAVED SUCCESSFULLY:', clueData);
    console.log(`✅ Final clue saved with ID: ${clueData.clue_id}, text: "${clueEngineResult.clue_text}"`);
    console.log(`✅ Clue saved for user: ${userId}, category: ${clueEngineResult.clue_category}`);

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
    
    // by Joseph Mulé – M1SSION™ – FIXED: Don't return invalid foreign keys
    return {
      success: true,
      clue_text: clueData.clue_text,
      clue_category: clueCategory,
      is_misleading: clueData.is_misleading,
      // Don't return foreign keys here - they'll be handled in the main function
      location_id: undefined,
      prize_id: undefined
    };
    
  } catch (error) {
    console.error('❌ BUZZ_CLUE_ENGINE Error:', error);
    return { success: false, clue_text: '', clue_category: 'location', is_misleading: false, error: 'Errore nel motore indizi' };
  }
}

// by Joseph Mulé – M1SSION™
// ✅ CORRETTA GENERAZIONE INDIZI - MAI RIVELARE MARCA/MODELLO
async function generateTargetClue(week: number, category: 'location' | 'prize', target: any, usedClues: any[]): Promise<{clue_text: string, is_misleading: boolean}> {
  const is_misleading = Math.random() < 0.25; // 25% chance M1SSION™ logic
  
  if (category === 'prize') {
    // ✅ WEEK 1-2: INDIZI PRIZE VAGHI (MAI MARCA)
    if (week <= 2) {
      const prizeClues = [
        `Un tesoro su quattro ruote ti aspetta nel sud.`,
        `La velocità incontra l'eleganza in un luogo ricco di storia.`,
        `Potenza e prestigio nascosti dove il sole scalda la terra.`,
        `Un premio che farà battere il cuore, celato tra antiche pietre.`,
        `Quattro ruote di lusso dormono sotto il cielo siciliano.`
      ];
      return { 
        clue_text: prizeClues[Math.floor(Math.random() * prizeClues.length)], 
        is_misleading 
      };
    }
    
    // ✅ WEEK 3: INDIZI PRIZE MEDI (MAI MARCA)
    if (week === 3) {
      const prizeClues = [
        `Quattro ruote di lusso attendono nella terra dei templi.`,
        `Un coupé esclusivo riposa dove la Magna Grecia fiorì.`,
        `Potenza alemanna nascosta nel cuore della Sicilia storica.`,
        `Un gigante dell'automotive si cela tra rovine millenarie.`,
        `450 cavalli che non fanno rumore, in attesa del proprietario.`
      ];
      return { 
        clue_text: prizeClues[Math.floor(Math.random() * prizeClues.length)], 
        is_misleading 
      };
    }
    
    // ✅ WEEK 4+: INDIZI PRIZE PRECISI (MA MAI MARCA ESPLICITA)
    const prizeClues = [
      `450 cavalli di pura potenza aspettano nella valle dei templi.`,
      `Un coupé che sfida le leggi della fisica, nascosto ad Agrigento.`,
      `Lusso tedesco che incontra la bellezza siciliana, tra strade antiche.`,
      `Una macchina dei sogni riposa dove Akragas dominava il Mediterraneo.`,
      `Ingegneria di precisione che attende su quattro ruote dorate.`
    ];
    return { 
      clue_text: prizeClues[Math.floor(Math.random() * prizeClues.length)], 
      is_misleading 
    };
  }
  
  // ✅ CATEGORY LOCATION - CORRETTI E PROGRESSIVI
  if (category === 'location') {
    // WEEK 1-2: LOCATION VAGHI
    if (week <= 2) {
      const locationClues = [
        `Dove i templi greci guardano il mare, la risposta ti attende.`,
        `Nella terra della Magna Grecia, tra colline e antiche pietre.`,
        `Un luogo dove storia millenaria incontra la modernità siciliana.`,
        `Tra le rovine di Akragas, qualcosa di prezioso si nasconde.`,
        `Nel sud dell'isola, dove il passato sussurra ai visitatori.`
      ];
      return { 
        clue_text: locationClues[Math.floor(Math.random() * locationClues.length)], 
        is_misleading 
      };
    }
    
    // WEEK 3: LOCATION MEDI  
    if (week === 3) {
      const locationClues = [
        `Nella città dei templi, lungo una strada che porta il nome di un fiore.`,
        `Ad Agrigento, dove le strade moderne incontrano la storia antica.`,
        `Nel cuore della Valle dei Templi, su una via che profuma di rose.`,
        `Dove Luigi Pirandello nacque, in una strada dal nome botanico.`,
        `Tra coordinate siciliane, vicino a monumenti UNESCO.`
      ];
      return { 
        clue_text: locationClues[Math.floor(Math.random() * locationClues.length)], 
        is_misleading 
      };
    }
    
    // WEEK 4+: LOCATION PRECISI
    const locationClues = [
      `Via Rossi 13, dove Agrigento custodisce i suoi segreti moderni.`,
      `Nel numero 13 di via Rossi, la città dei templi rivela sorprese.`,
      `Agrigento, via Rossi al civico 13: coordinate 37.3156, 13.5858.`,
      `Tra le coordinate 37°18'56" N, 13°35'09" E troverai ciò che cerchi.`,
      `${target.address} - l'indirizzo del destino ti attende.`
    ];
    return { 
      clue_text: locationClues[Math.floor(Math.random() * locationClues.length)], 
      is_misleading 
    };
  }
  
  return { clue_text: "Indizio M1SSION™ in elaborazione", is_misleading: false };
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
