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

    // CRITICAL FIX: BUZZ MAP areas are ONLY created after payment confirmation
    // NO IMMEDIATE AREA CREATION - Payment must be completed first
    if (generateMap) {
      console.log(`🚨 BUZZ MAP: Area creation BLOCKED - payment verification required`);
      console.log(`💳 User must complete Stripe checkout before area generation`);
      console.log(`📍 IMPORTANT: Areas will be created by handle-buzz-payment-success edge function`);
      
      // Do NOT create area here - wait for payment confirmation
      response.message = "Area will be generated after payment confirmation";
      response.radius_km = 15; // Expected radius for display
      response.lat = 0;        // Placeholder - real coordinates set after payment
      response.lng = 0;        // Placeholder - real coordinates set after payment  
      response.generation_number = 1; // Will be calculated correctly after payment
    }

    // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ - INSERIRE NOTIFICA CON CONTROLLO DUPLICATI ROBUSTO
    if (clueEngineResult.clue_text && clueEngineResult.clue_text.trim() !== '') {
      // Check for duplicate notifications in last 24h with similarity check
      const { data: existingNotifs, error: checkError } = await supabase
        .from('user_notifications')
        .select('id, message')
        .eq('user_id', userId)
        .eq('type', 'clue')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const isDuplicate = existingNotifs?.some(notif => 
        notif.message === clueEngineResult.clue_text || 
        Math.abs(notif.message.length - clueEngineResult.clue_text.length) < 10
      );

      if (isDuplicate) {
        console.log('🚫 Duplicate notification prevented - similar content found');
      } else {
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

// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ - Helper function to generate appropriate clue based on week number
function generateClueBasedOnWeek(weekNumber: number): string {
  const narrativeClues = [
    "Un sussurro di eleganza riecheggia nell'aria del mattino",
    "L'essenza della perfezione si nasconde tra le ombre dorate",
    "Un sogno di metallo attende dove l'arte incontra l'anima",
    "La melodia del vento racconta storie di antica saggezza",
    "Dove i maestri hanno intessuto bellezza e potenza",
    "Un respiro di eccellenza si libra sopra le nuvole",
    "Il destino sussurra a chi sa ascoltare il linguaggio del tempo",
    "Una carezza di magnificenza danza nella luce dell'alba"
  ];
  
  const metaphoricalClues = [
    "Il guardiano silenzioso riposa dove i sogni prendono forma",
    "Una lacrima di stelle cristallizzata attende il momento perfetto",
    "Il battito del cuore della velocità echeggia tra le colline",
    "Un raggio di genialità si riflette nello specchio dell'eternità",
    "L'anima della grazia sussurra segreti al vento della sera",
    "Un frammento di paradiso dimora nella valle dei desideri",
    "Il respiro della leggenda accarezza chi sa sognare oltre l'orizzonte"
  ];
  
  // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ - SEMPRE indizi narrativi e poetici, mai espliciti
  const selectedClues = Math.random() > 0.5 ? narrativeClues : metaphoricalClues;
  return selectedClues[Math.floor(Math.random() * selectedClues.length)];
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
    const clueData = await generateNarrativeClue(currentWeek, clueCategory);
    
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

// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// ✅ GENERAZIONE INDIZI NARRATIVI - MAI INDIRIZZI O COORDINATE ESATTE
async function generateNarrativeClue(week: number, category: 'location' | 'prize'): Promise<{clue_text: string, is_misleading: boolean}> {
  const is_misleading = Math.random() < 0.25; // 25% chance M1SSION™ logic
  
  // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ - SOLO INDIZI NARRATIVI/METAFORICI
  const narrativeClues = [
    `Un'ombra di magnificenza danza tra le strade antiche`,
    `L'eco della perfezione risuona dove arte e passione si fondono`,
    `Un sogno di metallo attende nel cuore della bellezza`,
    `La leggenda sussurra segreti di potenza e grazia`,
    `Dove i maestri dell'ingegneria hanno lasciato la loro firma`,
    `Un gioiello nascosto brilla sotto il cielo del sud`,
    `Il destino chiama chi sa interpretare i segni della maestria`,
    `Un simbolo di eccellenza dimora dove la storia incontra il futuro`,
    `Il cavallo d'acciaio riposa nell'ombra degli dei antichi`,
    `Una stella cadente si è fermata sulla terra degli antenati`
  ];
  
  const selectedClue = narrativeClues[Math.floor(Math.random() * narrativeClues.length)];
  
  return { 
    clue_text: selectedClue, 
    is_misleading 
  };
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
