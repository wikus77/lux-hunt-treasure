// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// BUZZ MAP RESOLVE - SERVER-AUTHORITATIVE EDGE FUNCTION
// FIX: 2025-11-26 - Changed JSR to esm.sh + fixed m1u column name

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { withCors } from '../_shared/cors.ts'

interface BuzzMapRequest {
  lat: number;
  lng: number;
  debug?: boolean;
}

serve(withCors(async (req: Request): Promise<Response> => {
  try {
    console.log('🗺️ [BUZZ-MAP-RESOLVE] Function started v2');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Missing authorization header');
      return new Response(JSON.stringify({ success: false, error: 'unauthorized' }), { status: 401 });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error('❌ Auth error:', userError);
      return new Response(JSON.stringify({ success: false, error: 'unauthorized' }), { status: 401 });
    }

    console.log('👤 User authenticated:', user.id);

    // Parse request body
    const body: BuzzMapRequest = await req.json();
    const { lat, lng } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(JSON.stringify({ success: false, error: 'invalid_coordinates' }), { status: 400 });
    }

    console.log('📍 Processing:', { user_id: user.id, lat, lng });

    // Step 1: Get next level pricing
    console.log('🔄 Calling m1_get_next_buzz_level...');
    const { data: levelData, error: levelError } = await supabase
      .rpc('m1_get_next_buzz_level', { p_user_id: user.id });

    if (levelError) {
      console.error('❌ Level RPC error:', levelError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'level_error',
        detail: levelError.message 
      }), { status: 500 });
    }

    // RPC returns array, get first row
    const pricing = Array.isArray(levelData) ? levelData[0] : levelData;
    
    if (!pricing) {
      console.error('❌ No pricing data returned');
      return new Response(JSON.stringify({ success: false, error: 'no_pricing' }), { status: 500 });
    }

    const level = pricing.level;
    const radiusKm = pricing.radius_km;
    const costM1U = pricing.m1u; // 🔥 FIX: Changed from cost_m1u to m1u
    
    // Calculate current week
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const currentWeek = Math.ceil((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));

    console.log('📊 Pricing:', { level, radiusKm, costM1U, currentWeek });

    // 🔥 FIX: Get prize location from current_mission_data to center area around prize
    // This ensures the generated area ALWAYS includes the prize city
    let finalLat = lat;
    let finalLng = lng;
    
    try {
      console.log('🔍 [BUZZ-MAP-RESOLVE] Fetching prize location from current_mission_data...');
      
      const { data: missionData, error: missionError } = await supabase
        .from('current_mission_data')
        .select('prize_lat, prize_lng, city, country, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('🔍 [BUZZ-MAP-RESOLVE] Mission query result:', {
        found: !!missionData,
        error: missionError?.message,
        prize_lat: missionData?.prize_lat,
        prize_lng: missionData?.prize_lng,
        city: missionData?.city,
        is_active: missionData?.is_active
      });

      if (!missionError && missionData?.prize_lat && missionData?.prize_lng) {
        // 🔒 CRITICAL: L'area NON deve MAI essere centrata sul premio!
        // L'area deve essere generata in modo COMPLETAMENTE CASUALE
        // ma GARANTIRE che il premio sia sempre DENTRO l'area
        
        // Strategia: generare un centro casuale tale che il premio sia dentro il raggio
        // Il centro può essere ovunque dentro un cerchio di raggio (radiusKm * 0.7) dal premio
        // Questo garantisce che il premio sia sempre dentro l'area ma il centro sia RANDOM
        
        // Calcola distanza massima dal premio al centro (70% del raggio per sicurezza)
        const maxOffsetKm = radiusKm * 0.7;
        
        // Converti km in gradi (approssimazione: 1° lat ≈ 111km, 1° lng ≈ 111km * cos(lat))
        const kmPerDegreeLat = 111;
        const kmPerDegreeLng = 111 * Math.cos(missionData.prize_lat * Math.PI / 180);
        
        // Genera angolo casuale (0-360°) e distanza casuale (0 a maxOffsetKm)
        const randomAngle = Math.random() * 2 * Math.PI;
        // Usa distribuzione uniforme nell'area (sqrt per evitare clustering al centro)
        const randomDistance = Math.sqrt(Math.random()) * maxOffsetKm;
        
        // Calcola offset in gradi
        const offsetLat = (randomDistance * Math.cos(randomAngle)) / kmPerDegreeLat;
        const offsetLng = (randomDistance * Math.sin(randomAngle)) / kmPerDegreeLng;
        
        // Il centro dell'area è DISTANTE dal premio
        finalLat = missionData.prize_lat + offsetLat;
        finalLng = missionData.prize_lng + offsetLng;
        
        // Calcola distanza effettiva premio-centro per log
        const actualDistanceKm = Math.sqrt(
          Math.pow((finalLat - missionData.prize_lat) * kmPerDegreeLat, 2) +
          Math.pow((finalLng - missionData.prize_lng) * kmPerDegreeLng, 2)
        );
        
        console.log('🎲 [BUZZ-MAP-RESOLVE] Area generata CASUALMENTE (premio DENTRO ma centro DISTANTE):', {
          prizeCity: missionData.city,
          radiusKm,
          maxOffsetKm: maxOffsetKm.toFixed(1),
          actualDistanceFromPrize: actualDistanceKm.toFixed(1) + 'km',
          prizeWillBeInside: actualDistanceKm < radiusKm ? '✅ YES' : '❌ NO',
          angleUsed: (randomAngle * 180 / Math.PI).toFixed(0) + '°',
          // NON loggare coordinate reali del premio per sicurezza!
        });
      } else {
        console.warn('⚠️ [BUZZ-MAP-RESOLVE] No active mission prize location found, using user coordinates');
        console.warn('⚠️ [BUZZ-MAP-RESOLVE] Check: is_active field type, RLS policies on current_mission_data');
      }
    } catch (prizeError) {
      console.error('⚠️ [BUZZ-MAP-RESOLVE] Error fetching prize location:', prizeError);
    }

    // Step 2: Spend M1U - Use direct SQL instead of RPC to avoid parameter issues
    console.log('💎 Spending M1U...');
    
    // First check balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('m1_units')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Profile error:', profileError);
      return new Response(JSON.stringify({ success: false, error: 'profile_not_found' }), { status: 500 });
    }

    const currentBalance = profile.m1_units || 0;
    
    if (currentBalance < costM1U) {
      console.error('❌ Insufficient balance:', { current: currentBalance, required: costM1U });
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'insufficient_balance',
        current_balance: currentBalance,
        required: costM1U
      }), { status: 400 });
    }

    // Deduct M1U
    const newBalance = currentBalance - costM1U;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ m1_units: newBalance, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return new Response(JSON.stringify({ success: false, error: 'payment_failed' }), { status: 500 });
    }

    console.log('✅ M1U deducted:', { spent: costM1U, newBalance });

    // Step 3: Create map area - 🔥 FIX: Use finalLat/finalLng (prize location with offset)
    console.log('📍 Creating area at coordinates:', { finalLat, finalLng, radiusKm });
    
    const { data: mapArea, error: mapError } = await supabase
      .from('user_map_areas')
      .insert({
        user_id: user.id,
        lat: finalLat,           // 🔥 FIX: Use prize coordinates
        lng: finalLng,           // 🔥 FIX: Use prize coordinates
        center_lat: finalLat,    // 🔥 FIX: Use prize coordinates
        center_lng: finalLng,    // 🔥 FIX: Use prize coordinates
        radius_km: radiusKm,
        source: 'buzz_map',
        level: level,
        price_eur: costM1U / 10, // M1U to EUR (1 M1U = €0.10)
        week: currentWeek
      })
      .select()
      .single();
      
    if (mapError) {
      console.error('❌ Map area error:', mapError);
      // Refund M1U on failure
      await supabase.from('profiles').update({ m1_units: currentBalance }).eq('id', user.id);
      return new Response(JSON.stringify({ success: false, error: 'area_creation_failed' }), { status: 500 });
    }
    
    console.log('✅ Area created:', mapArea.id);

    // Step 4: Log transaction (non-critical, wrapped in try-catch)
    try {
      await supabase.from('m1_transactions').insert({
        user_id: user.id,
        amount: -costM1U,
        type: 'buzz_map',
        description: `BUZZ MAP Level ${level} - ${radiusKm}km`
      });
    } catch (txErr) {
      console.warn('⚠️ Transaction log failed (non-critical):', txErr);
    }

    // Step 5: Log action (non-critical, wrapped in try-catch)
    try {
      await supabase.from('buzz_map_actions').insert({
        user_id: user.id,
        clue_count: level,
        cost_eur: costM1U / 10,
        radius_generated: radiusKm
      });
    } catch (actionErr) {
      console.warn('⚠️ Action log failed (non-critical):', actionErr);
    }

    // Success response - 🔥 FIX: Return finalLat/finalLng (prize-centered coordinates)
    const response = {
      success: true,
      mode: 'map',
      area: {
        id: mapArea.id,
        center_lat: finalLat,    // 🔥 FIX: Prize coordinates
        center_lng: finalLng,    // 🔥 FIX: Prize coordinates
        radius_km: radiusKm,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      area_id: mapArea.id,
      level,
      radius_km: radiusKm,
      cost_m1u: costM1U,
      new_balance: newBalance,
      week: currentWeek
    };

    console.log('🎉 Success:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Exception:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'internal_error', 
      detail: String(error?.message || error) 
    }), { status: 500 });
  }
}));

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
