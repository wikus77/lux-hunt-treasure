
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
    
    console.log(`🔥 EMERGENCY FIX – BUZZ REQUEST START - userId: ${userId}, generateMap: ${generateMap}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    // CRITICAL FIX: Enhanced developer detection
    const isDeveloper = userId === '00000000-0000-4000-a000-000000000000';
    
    if (isDeveloper) {
      console.log('🔧 EMERGENCY FIX: Developer bypass detected');
    }

    // STEP 1 - LOG START
    await supabase.from('buzz_logs').insert({
      user_id: userId,
      step: 'start',
      details: { generateMap, coordinates, timestamp: new Date().toISOString() }
    });

    if (!isDeveloper) {
      // Regular authentication check for non-developers
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        console.error("❌ EMERGENCY FIX - Missing authorization header");
        return new Response(
          JSON.stringify({ success: false, error: true, errorMessage: "Token di autorizzazione mancante" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user || user.id !== userId) {
        console.error("❌ EMERGENCY FIX - Auth validation failed");
        return new Response(
          JSON.stringify({ success: false, error: true, errorMessage: "Autorizzazione non valida" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    console.log(`✅ EMERGENCY FIX - Auth validation passed`);

    // STEP 2 - ENHANCED MAP GENERATION
    if (generateMap) {
      console.log('🗺️ EMERGENCY FIX: Starting map area generation');
      
      const lat = coordinates?.lat || 41.9028;
      const lng = coordinates?.lng || 12.4964;
      const areaRadius = radius || 500;
      
      // CRITICAL FIX: Calculate dynamic radius based on existing areas
      const { data: existingAreas } = await supabase
        .from('user_map_areas')
        .select('radius_km')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      let finalRadius = areaRadius;
      if (existingAreas && existingAreas.length > 0) {
        // Reduce by 5% from last area
        finalRadius = Math.max(5, existingAreas[0].radius_km * 0.95);
        console.log(`📊 EMERGENCY FIX: Reduced radius from ${existingAreas[0].radius_km}km to ${finalRadius}km`);
      }

      // Insert new area
      const { data: newArea, error: areaError } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: userId,
          lat: lat,
          lng: lng,
          radius_km: finalRadius,
          week: Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000))
        })
        .select()
        .single();

      if (areaError) {
        console.error('❌ EMERGENCY FIX: Error creating map area:', areaError);
        return new Response(
          JSON.stringify({ success: false, error: true, errorMessage: "Errore creazione area mappa" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Update counter
      const { data: counterData } = await supabase.rpc('increment_buzz_map_counter', {
        p_user_id: userId
      });

      console.log(`✅ EMERGENCY FIX: Map area created successfully`);
      
      return new Response(JSON.stringify({
        success: true,
        areaId: newArea.id,
        lat: newArea.lat,
        lng: newArea.lng,
        radius_km: newArea.radius_km,
        generation_number: counterData || 1,
        clue_text: `Area BUZZ MAPPA generata: ${finalRadius.toFixed(1)}km di raggio`
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // STEP 3 - REGULAR BUZZ PROCESSING
    console.log('🎯 EMERGENCY FIX: Processing regular BUZZ');

    const { data: weekData, error: weekError } = await supabase.rpc('get_current_mission_week');
    const currentWeek = weekData || 1;

    const { data: buzzCount, error: buzzCountError } = await supabase.rpc('increment_buzz_counter', {
      p_user_id: userId
    });

    if (buzzCountError) {
      console.error("❌ EMERGENCY FIX - Error incrementing buzz counter:", buzzCountError);
      return new Response(
        JSON.stringify({ success: false, error: true, errorMessage: "Errore contatore buzz" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // CRITICAL FIX: Generate meaningful mission clue
    const missionClues = [
      `🎯 Indizio Mission Settimana ${currentWeek}: Il segreto è custodito dove l'antico incontra il moderno`,
      `🔍 Indizio Premium #${buzzCount}: Cerca il simbolo nascosto nei riflessi della città eterna`,
      `⭐ Missione Speciale: La chiave si trova dove il tempo si è fermato`,
      `🏛️ Indizio Esclusivo: Segui le tracce che portano al cuore della storia`,
      `💎 Segreto Mission: Il tesoro attende dove la luce danza sulle onde del passato`
    ];
    
    const randomClue = missionClues[Math.floor(Math.random() * missionClues.length)];
    const clueWithCode = `${randomClue} - Codice: MIS-${Date.now().toString().slice(-6)}`;

    // Save clue to database
    const { data: clueData, error: clueError } = await supabase
      .from('user_clues')
      .insert({
        user_id: userId,
        title_it: `Indizio Mission #${buzzCount}`,
        description_it: clueWithCode,
        title_en: `Mission Clue #${buzzCount}`,
        description_en: translateToEnglish(clueWithCode),
        clue_type: 'premium',
        buzz_cost: 0
      })
      .select('clue_id')
      .single();

    if (clueError) {
      console.error("❌ EMERGENCY FIX - Error saving clue:", clueError);
    }

    console.log(`✅ EMERGENCY FIX: Regular BUZZ processed successfully`);

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
    console.error('❌ EMERGENCY FIX: Exception in handle-buzz-press:', error);
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
