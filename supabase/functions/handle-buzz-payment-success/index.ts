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

    // 🚨 CRITICAL FIX: STRICT payment validation - NO MOCK MODE
    const { data: realPayment, error: paymentError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider_transaction_id', session_id)
      .eq('status', 'succeeded')
      .ilike('description', '%Buzz Map%')
      .gte('created_at', '2025-07-17T00:00:00Z') // Only payments after reset
      .single();

    if (paymentError || !realPayment) {
      logStep("❌ No successful BUZZ MAP payment found", { 
        session_id, 
        error: paymentError?.message,
        required_status: 'succeeded',
        required_description: 'Buzz Map',
        min_date: '2025-07-17T00:00:00Z'
      });
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No successful BUZZ MAP payment found for this session" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const paymentData = realPayment;
    
    const payment = paymentData;

    logStep("💳 BUZZ MAP payment found", { payment_id: payment.id, amount: payment.amount });

    // Check if area already exists for this specific payment
    const { data: existingArea } = await supabaseClient
      .from('user_map_areas')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', payment.created_at) // After this payment was made
      .limit(1);

    if (existingArea && existingArea.length > 0) {
      logStep("✅ Area already exists for this payment", { 
        area_id: existingArea[0].id,
        payment_id: payment.id,
        area_created: existingArea[0].created_at
      });
      
      // Get target info for response
      const { data: activeTarget } = await supabaseClient
        .from('buzz_game_targets')
        .select('city, lat, lon')
        .eq('is_active', true)
        .single();
      
      return new Response(JSON.stringify({
        success: true,
        area: existingArea[0],
        target: activeTarget ? {
          city: activeTarget.city,
          lat: activeTarget.lat,
          lon: activeTarget.lon
        } : null,
        message: "Area already created for this payment"
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
    
    // 🎯 CRITICAL FIX: UNIFIED radius formula - exactly same as PROGRESSIVE PRICING UI
    const { data: existingAreas } = await supabaseClient
      .from('user_map_areas')
      .select('id')
      .eq('user_id', user.id);
    
    const generationCount = existingAreas?.length || 0;
    
    // 🚨 PROGRESSIVE PRICING TABLE - IDENTICAL to useBuzzMapProgressivePricing.ts
    const PROGRESSIVE_PRICING_TABLE = [
      { generation: 0, radius: 500, segment: "Entry", price: 4.99 },
      { generation: 1, radius: 450, segment: "Entry", price: 6.99 },
      { generation: 2, radius: 405, segment: "Entry", price: 8.99 },
      { generation: 3, radius: 365, segment: "Entry", price: 10.99 },
      { generation: 4, radius: 329, segment: "Entry", price: 12.99 },
      { generation: 5, radius: 295, segment: "Entry", price: 14.99 },
      { generation: 6, radius: 265, segment: "Entry", price: 16.99 },
      { generation: 7, radius: 240, segment: "Entry", price: 19.99 },
      { generation: 8, radius: 216, segment: "Entry", price: 21.99 },
      { generation: 9, radius: 195, segment: "Entry", price: 25.99 },
      { generation: 10, radius: 175, segment: "Entry", price: 29.99 },
      { generation: 11, radius: 155, segment: "Entry", price: 29.99 },
      { generation: 12, radius: 140, segment: "Entry", price: 29.99 },
      { generation: 13, radius: 126, segment: "Entry", price: 29.99 },
      { generation: 14, radius: 113, segment: "TRANSIZIONE", price: 29.99 },
      { generation: 15, radius: 102, segment: "Mid High-Spender", price: 29.99 },
      { generation: 16, radius: 92, segment: "Mid High-Spender", price: 44.99 },
      { generation: 17, radius: 83, segment: "Mid High-Spender", price: 67.99 },
      { generation: 18, radius: 75, segment: "Mid High-Spender", price: 101.99 },
      { generation: 19, radius: 67, segment: "Mid High-Spender", price: 152.99 },
      { generation: 20, radius: 60, segment: "Mid High-Spender", price: 229.99 },
      { generation: 21, radius: 54, segment: "Mid High-Spender", price: 344.99 },
      { generation: 22, radius: 49, segment: "Mid High-Spender", price: 517.99 },
      { generation: 23, radius: 44, segment: "High-Spender", price: 776.99 },
      { generation: 24, radius: 39, segment: "High-Spender", price: 1165.99 },
      { generation: 25, radius: 35, segment: "High-Spender", price: 1748.99 },
      { generation: 26, radius: 31, segment: "High-Spender", price: 2622.99 },
      { generation: 27, radius: 28, segment: "High-Spender", price: 2622.99 },
      { generation: 28, radius: 25, segment: "High-Spender", price: 2622.99 },
      { generation: 29, radius: 23, segment: "High-Spender", price: 2622.99 },
      { generation: 30, radius: 20, segment: "High-Spender", price: 2622.99 },
      { generation: 31, radius: 18, segment: "ELITE", price: 2622.99 },
      { generation: 32, radius: 16, segment: "ELITE", price: 2622.99 },
      { generation: 33, radius: 14.5, segment: "ELITE", price: 2622.99 },
      { generation: 34, radius: 13.1, segment: "ELITE", price: 2622.99 },
      { generation: 35, radius: 11.8, segment: "ELITE", price: 3933.99 },
      { generation: 36, radius: 10.6, segment: "ELITE", price: 3933.99 },
      { generation: 37, radius: 9.5, segment: "ELITE", price: 4999.00 },
      { generation: 38, radius: 8.6, segment: "ELITE", price: 4999.00 },
      { generation: 39, radius: 7.7, segment: "ELITE", price: 4999.00 },
      { generation: 40, radius: 6.9, segment: "ELITE", price: 4999.00 },
      { generation: 41, radius: 5, segment: "ELITE", price: 4999.00 }
    ];
    
    // Get pricing data for current generation (IDENTICAL to frontend logic)
    const maxGeneration = Math.min(generationCount, PROGRESSIVE_PRICING_TABLE.length - 1);
    const currentPricing = PROGRESSIVE_PRICING_TABLE[maxGeneration];
    
    const uiCalculatedRadius = currentPricing.radius;
    let areaRadiusKm = uiCalculatedRadius;
    
    // 🎯 CRITICAL FIX: Generate area center ensuring GUARANTEED Agrigento coverage
    const centerDistanceKm = Math.min(areaRadiusKm * 0.6, 15); // Center within 60% of radius, max 15km
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