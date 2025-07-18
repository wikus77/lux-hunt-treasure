// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - Handle BUZZ Payment Success and Area Creation
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BUZZ-PAYMENT-SUCCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("🔥 BUZZ Payment Success Handler Started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    logStep("✅ User authenticated", { userId: user.id });

    const { session_id } = await req.json();
    if (!session_id) {
      throw new Error("Missing session_id parameter");
    }

    logStep("📦 Processing session", { session_id });

    // Check if this is a successful BUZZ MAP payment
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider_transaction_id', session_id)
      .eq('status', 'succeeded')
      .ilike('description', '%Buzz Map%')
      .single();

    if (paymentError || !payment) {
      logStep("❌ No successful BUZZ MAP payment found", { session_id, error: paymentError?.message });
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No successful BUZZ MAP payment found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    logStep("💳 BUZZ MAP payment found", { payment_id: payment.id, amount: payment.amount });

    // Check if area already exists for this payment
    const { data: existingArea } = await supabaseClient
      .from('user_map_areas')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', '2025-07-17T00:00:00Z')
      .limit(1);

    if (existingArea && existingArea.length > 0) {
      logStep("✅ Area already exists for this payment", { area_id: existingArea[0].id });
      return new Response(JSON.stringify({
        success: true,
        area: existingArea[0],
        message: "Area already created"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get active target for coordinate generation
    const { data: activeTarget, error: targetError } = await supabaseClient
      .from('buzz_game_targets')
      .select('lat, lon, city, address')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (targetError || !activeTarget) {
      logStep("❌ No active target found", { error: targetError?.message });
      throw new Error("No active BUZZ game target found");
    }

    logStep("🎯 Active target found", { 
      city: activeTarget.city, 
      lat: activeTarget.lat, 
      lon: activeTarget.lon 
    });

    // 🎯 CORRECTED COORDINATE GENERATION: Ensure target city is ALWAYS included
    const targetLat = parseFloat(activeTarget.lat.toString());
    const targetLon = parseFloat(activeTarget.lon.toString());
    
    // Generate coordinates 3-8km from target to GUARANTEE city inclusion
    const distanceKm = 3 + Math.random() * 5; // 3-8 km from target
    const bearingRad = Math.random() * 2 * Math.PI;
    
    // Correct coordinate calculation with proper Earth curvature
    const deltaLat = (distanceKm / 111.32) * Math.cos(bearingRad);
    const deltaLon = (distanceKm / (111.32 * Math.cos(targetLat * Math.PI / 180))) * Math.sin(bearingRad);
    
    const areaLat = targetLat + deltaLat;
    const areaLon = targetLon + deltaLon;
    
    logStep("🗺️ Generating BUZZ MAP area", {
      target_lat: targetLat,
      target_lon: targetLon,
      area_lat: areaLat,
      area_lon: areaLon,
      distance_from_target_km: distanceKm,
      radius_km: 15
    });

    // Create the area
    const { data: newArea, error: areaError } = await supabaseClient
      .from('user_map_areas')
      .insert({
        user_id: user.id,
        lat: areaLat,
        lng: areaLon,
        radius_km: 15,
        week: 1
      })
      .select()
      .single();

    if (areaError) {
      logStep("❌ Failed to create area", { error: areaError.message });
      throw new Error(`Failed to create area: ${areaError.message}`);
    }

    logStep("✅ BUZZ MAP area created successfully", {
      area_id: newArea.id,
      target_city: activeTarget.city,
      coordinates: { lat: areaLat, lng: areaLon },
      radius_km: 15
    });

    return new Response(JSON.stringify({
      success: true,
      area: newArea,
      target: {
        city: activeTarget.city,
        lat: targetLat,
        lon: targetLon
      },
      message: "BUZZ MAP area created successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ ERROR in handle-buzz-payment-success", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});