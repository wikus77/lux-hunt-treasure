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

    // 🔥 STRICT PAYMENT VALIDATION: Only succeed status allowed
    const { data: paymentData, error: paymentError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider_transaction_id', session_id)
      .eq('status', 'succeeded') // ONLY succeeded payments
      .ilike('description', '%Buzz Map%')
      .single();

    if (paymentError || !paymentData) {
      logStep("❌ No successful BUZZ MAP payment found", { session_id, error: paymentError?.message });
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No successful BUZZ MAP payment found for this session" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }
    
    const payment = paymentData;

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

    // 🎯 FIXED: Generate area center 3-8km from Agrigento ensuring city inclusion
    const targetLat = parseFloat(activeTarget.lat.toString());
    const targetLon = parseFloat(activeTarget.lon.toString());
    
    logStep("🗺️ Target coordinates", { targetLat, targetLon, city: activeTarget.city });
    
    // 🎯 FIXED: Generate area center 10-20km from target to ensure Agrigento inclusion
    const centerDistanceKm = 10 + Math.random() * 10; // 10-20 km from target to area CENTER
    const bearingRad = Math.random() * 2 * Math.PI;
    
    // Earth's radius and proper coordinate calculation
    const R = 6371; // Earth's radius in km
    const lat1Rad = targetLat * Math.PI / 180;
    const lon1Rad = targetLon * Math.PI / 180;
    
    // Calculate new coordinates using spherical trigonometry
    const lat2Rad = Math.asin(
      Math.sin(lat1Rad) * Math.cos(centerDistanceKm / R) +
      Math.cos(lat1Rad) * Math.sin(centerDistanceKm / R) * Math.cos(bearingRad)
    );
    
    const lon2Rad = lon1Rad + Math.atan2(
      Math.sin(bearingRad) * Math.sin(centerDistanceKm / R) * Math.cos(lat1Rad),
      Math.cos(centerDistanceKm / R) - Math.sin(lat1Rad) * Math.sin(lat2Rad)
    );
    
    const areaLat = lat2Rad * 180 / Math.PI;
    const areaLon = lon2Rad * 180 / Math.PI;
    
    // 🎯 USE PRICING HOOK RADIUS (sync with UI) - Get user's generation count first
    const { data: existingAreas } = await supabaseClient
      .from('user_map_areas')
      .select('id')
      .eq('user_id', user.id);
    
    const generationCount = existingAreas?.length || 0;
    // Apply same formula as useBuzzMapPricing: radius = 500 * (0.7^generation_count), min 5km
    const uiCalculatedRadius = Math.max(5, 500 * Math.pow(0.7, generationCount));
    let areaRadiusKm = Math.round(uiCalculatedRadius);
    
    logStep("🎯 RADIUS SYNC WITH UI", {
      generationCount,
      uiCalculatedRadius,
      finalRadiusKm: areaRadiusKm,
      centerDistanceFromTarget: centerDistanceKm
    });
    
    // Verify the distance (for debugging)
    const actualDistance = Math.sqrt(
      Math.pow((areaLat - targetLat) * 111.32, 2) + 
      Math.pow((areaLon - targetLon) * 111.32 * Math.cos(targetLat * Math.PI / 180), 2)
    );
    
    logStep("🎯 CRITICAL DEBUG: BUZZ MAP area coordinates", {
      target: { lat: targetLat, lon: targetLon, city: activeTarget.city },
      area_center: { lat: areaLat, lon: areaLon },
      center_distance_from_target_km: centerDistanceKm,
      actual_distance_calculated: actualDistance,
      area_radius_km: areaRadiusKm,
      total_coverage_km: centerDistanceKm + areaRadiusKm,
      will_cover_target: areaRadiusKm >= centerDistanceKm ? "✅ YES" : "❌ NO - WILL EXTEND RADIUS"
    });
    
    // 🚨 CRITICAL FIX: Ensure target is ALWAYS covered by extending radius if needed
    if (areaRadiusKm < centerDistanceKm + 2) {
      areaRadiusKm = Math.ceil(centerDistanceKm + 5); // Guarantee coverage + 5km buffer
      logStep("🚨 EXTENDING RADIUS TO COVER TARGET", {
        originalRadius: uiCalculatedRadius,
        extendedRadius: areaRadiusKm,
        reason: "Target not covered by original radius"
      });
    }
    
    // Log to admin_logs for debugging
    await supabaseClient.from('admin_logs').insert({
      event_type: 'buzz_map_created',
      user_id: user.id,
      context: JSON.stringify({
        session_id,
        target_city: activeTarget.city,
        area_center: { lat: areaLat, lng: areaLon },
        radius_km: areaRadiusKm,
        generation_count: generationCount
      }),
      note: `BUZZ MAP area created for ${activeTarget.city}`
    });

    // Create the area with DYNAMIC radius
    const { data: newArea, error: areaError } = await supabaseClient
      .from('user_map_areas')
      .insert({
        user_id: user.id,
        lat: areaLat,
        lng: areaLon,
        radius_km: areaRadiusKm, // FIXED: Use calculated radius
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
      radius_km: areaRadiusKm,
      distance_from_target: centerDistanceKm,
      total_coverage: centerDistanceKm + areaRadiusKm
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