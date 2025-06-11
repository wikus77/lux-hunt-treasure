
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BuzzRequest {
  userId: string;
  generateMap: boolean;
  coordinates?: { lat: number; lng: number };
  radius?: number;
}

const translateToEnglish = (text: string): string => {
  const translations: { [key: string]: string } = {
    "settimana": "week",
    "Indizio": "Clue",
    "generato": "generated",
    "per": "for"
  };
  
  let result = text;
  Object.entries(translations).forEach(([it, en]) => {
    result = result.replace(new RegExp(it, 'gi'), en);
  });
  return result;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { userId, generateMap, coordinates, radius } = requestData as BuzzRequest;
    
    console.log(`🔥 SURGICAL FIX – BUZZ REQUEST START - userId: ${userId}, generateMap: ${generateMap}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    // CRITICAL FIX: Enhanced developer detection
    const isDeveloper = userId === '00000000-0000-4000-a000-000000000000';
    
    if (isDeveloper) {
      console.log('🔧 SURGICAL FIX: Developer bypass detected - FULL ACCESS GRANTED');
    }

    // STEP 1 - LOG START with FORCED database write
    try {
      await supabase.from('buzz_logs').insert({
        id: crypto.randomUUID(),
        user_id: userId,
        step: 'start',
        details: { generateMap, coordinates, timestamp: new Date().toISOString() },
        created_at: new Date().toISOString()
      });
      console.log('✅ SURGICAL FIX: Start log FORCED into database');
    } catch (logError) {
      console.error('❌ SURGICAL FIX: Start log failed (continuing):', logError);
    }

    if (!isDeveloper) {
      // CRITICAL FIX: Enhanced authentication check for non-developers
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        console.error("❌ SURGICAL FIX - Missing authorization header");
        return new Response(
          JSON.stringify({ success: false, error: true, errorMessage: "Token di autorizzazione mancante" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      
      // CRITICAL FIX: Enhanced JWT validation with proper sub claim check
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.sub) {
          console.error("❌ SURGICAL FIX - JWT missing sub claim");
          return new Response(
            JSON.stringify({ success: false, error: true, errorMessage: "Token JWT non valido (missing sub)" }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        console.log('✅ SURGICAL FIX: JWT validation passed with sub claim');
      } catch (jwtError) {
        console.error("❌ SURGICAL FIX - JWT parsing failed:", jwtError);
        return new Response(
          JSON.stringify({ success: false, error: true, errorMessage: "Token JWT malformato" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user || user.id !== userId) {
        console.error("❌ SURGICAL FIX - Auth validation failed");
        return new Response(
          JSON.stringify({ success: false, error: true, errorMessage: "Autorizzazione non valida" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    console.log(`✅ SURGICAL FIX - Auth validation passed`);

    // STEP 2 - ENHANCED MAP GENERATION with FORCED area deletion and radius reduction
    if (generateMap) {
      console.log('🗺️ SURGICAL FIX: Starting FORCED map area generation with complete deletion');
      
      const lat = coordinates?.lat || 41.9028;
      const lng = coordinates?.lng || 12.4964;
      
      // CRITICAL FIX: FORCE DELETE ALL PREVIOUS AREAS FOR THIS USER FIRST
      console.log('🗑️ SURGICAL FIX: FORCING complete deletion of all previous areas for user:', userId);
      const { error: deleteError } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('❌ SURGICAL FIX: Error deleting previous areas:', deleteError);
      } else {
        console.log('✅ SURGICAL FIX: Previous areas FORCEFULLY DELETED successfully');
      }
      
      // Calculate generation count and dynamic radius
      const { data: counterData } = await supabase
        .from('user_buzz_map_counter')
        .select('buzz_map_count')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();
      
      const currentCount = counterData?.buzz_map_count || 0;
      const newCount = currentCount + 1;
      
      // Calculate radius with 5% reduction per generation
      let finalRadius = radius || 500;
      if (newCount > 1) {
        finalRadius = Math.max(5, 500 * Math.pow(0.95, newCount - 1));
        console.log(`📊 SURGICAL FIX: FORCED radius reduction for generation ${newCount}: ${finalRadius}km`);
      }

      // CRITICAL FIX: Insert new area with FORCED unique ID
      const { data: newArea, error: areaError } = await supabase
        .from('user_map_areas')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          lat: lat,
          lng: lng,
          radius_km: finalRadius,
          week: Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (areaError) {
        console.error('❌ SURGICAL FIX: Error creating map area:', areaError);
        return new Response(
          JSON.stringify({ success: false, error: true, errorMessage: "Errore creazione area mappa" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Update counter with proper conflict handling
      let counterResult = newCount;
      try {
        const currentDate = new Date().toISOString().split('T')[0];
        const { data: existingCounter } = await supabase
          .from('user_buzz_map_counter')
          .select('*')
          .eq('user_id', userId)
          .eq('date', currentDate)
          .single();

        if (existingCounter) {
          // Update existing counter
          const { data: updatedCounter } = await supabase
            .from('user_buzz_map_counter')
            .update({ buzz_map_count: newCount })
            .eq('user_id', userId)
            .eq('date', currentDate)
            .select('buzz_map_count')
            .single();
          counterResult = updatedCounter?.buzz_map_count || newCount;
        } else {
          // Insert new counter
          const { data: newCounter } = await supabase
            .from('user_buzz_map_counter')
            .insert({
              id: crypto.randomUUID(),
              user_id: userId,
              date: currentDate,
              buzz_map_count: newCount
            })
            .select('buzz_map_count')
            .single();
          counterResult = newCounter?.buzz_map_count || newCount;
        }
      } catch (counterError) {
        console.error('❌ SURGICAL FIX: Counter update failed (continuing):', counterError);
      }

      console.log(`✅ SURGICAL FIX: Map area FORCED creation with deletion successful`);
      
      return new Response(JSON.stringify({
        success: true,
        areaId: newArea.id,
        lat: newArea.lat,
        lng: newArea.lng,
        radius_km: newArea.radius_km,
        generation_number: counterResult,
        clue_text: `🗺️ Area BUZZ MAPPA generata: ${finalRadius.toFixed(1)}km di raggio`
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // STEP 3 - REGULAR BUZZ PROCESSING with COHERENT mission messages
    console.log('🎯 SURGICAL FIX: Processing regular BUZZ with COHERENT mission messages');

    const { data: weekData, error: weekError } = await supabase.rpc('get_current_mission_week');
    const currentWeek = weekData || 1;

    let buzzCount = 1;
    try {
      const { data: buzzCountData, error: buzzCountError } = await supabase.rpc('increment_buzz_counter', {
        p_user_id: userId
      });
      buzzCount = buzzCountData || 1;
    } catch (buzzCountError) {
      console.error("❌ SURGICAL FIX - Error incrementing buzz counter (continuing):", buzzCountError);
    }

    // Generate COHERENT mission clue with proper Rome/Mission context
    const coherentMissionClues = [
      `🎯 Indizio Mission Roma Settimana ${currentWeek}: Il segreto è custodito dove l'antico incontra il moderno nell'eterna città`,
      `🏛️ Indizio Premium Roma #${buzzCount}: Cerca il simbolo nascosto nei riflessi del tramonto al Colosseo`,
      `⭐ Missione Speciale Roma: La chiave si trova dove il tempo si è fermato nei Fori Imperiali`,
      `🔍 Indizio Esclusivo Roma: Segui le tracce che portano al cuore della storia nel Pantheon`,
      `💎 Segreto Mission Roma: Il tesoro attende dove la luce danza sulle onde del Tevere eterno`
    ];
    
    const randomClue = coherentMissionClues[Math.floor(Math.random() * coherentMissionClues.length)];
    const missionCode = `MIS-${Date.now().toString().slice(-6)}`;
    const clueWithCode = `${randomClue} - Codice: ${missionCode}`;

    // Save clue to database with FORCED unique ID
    try {
      const { data: clueData, error: clueError } = await supabase
        .from('user_clues')
        .insert({
          clue_id: crypto.randomUUID(),
          user_id: userId,
          title_it: `Indizio Mission Roma #${buzzCount}`,
          description_it: clueWithCode,
          title_en: `Mission Rome Clue #${buzzCount}`,
          description_en: translateToEnglish(clueWithCode),
          clue_type: 'premium',
          buzz_cost: 0,
          created_at: new Date().toISOString()
        })
        .select('clue_id')
        .single();

      if (clueError) {
        console.error("❌ SURGICAL FIX - Error saving clue (continuing):", clueError);
      } else {
        console.log("✅ SURGICAL FIX: Clue FORCED into database successfully");
      }
    } catch (clueError) {
      console.error("❌ SURGICAL FIX - Exception saving clue (continuing):", clueError);
    }

    console.log(`✅ SURGICAL FIX: Regular BUZZ processed with COHERENT mission message`);

    return new Response(JSON.stringify({
      success: true,
      clue_text: clueWithCode,
      buzz_cost: 0,
      generation_number: buzzCount
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    console.error('❌ SURGICAL FIX: Exception in handle-buzz-press:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: true, 
        errorMessage: "Errore interno del server" 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
