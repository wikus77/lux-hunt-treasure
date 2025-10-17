// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Haversine formula for distance calculation
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, radius_meters = 500 } = await req.json();
    
    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: 'Missing lat or lng coordinates' }), 
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(url, key);

    console.log(`🎯 M1QR-TRACE: Getting nearby markers for position ${lat}, ${lng} within ${radius_meters}m`);

    // Get all active markers
    const { data: markers, error: markersError } = await supabase
      .from('markers')
      .select('id, title, lat, lng, active')
      .eq('active', true);

    if (markersError) {
      console.error('❌ Error fetching markers:', markersError);
      throw markersError;
    }

    // Get all active QR codes
    const { data: qrCodes, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, title, lat, lng, code, is_active')
      .eq('is_active', true);

    if (qrError) {
      console.error('❌ Error fetching QR codes:', qrError);
      throw qrError;
    }

    // Combine and filter by distance
    const allMarkers = [
      ...(markers || []).map(m => ({
        id: m.id,
        title: m.title,
        lat: m.lat,
        lng: m.lng,
        type: 'marker'
      })),
      ...(qrCodes || []).map(qr => ({
        id: qr.id,
        title: qr.title || `QR ${qr.code}`,
        lat: qr.lat,
        lng: qr.lng,
        type: 'qr_code',
        code: qr.code
      }))
    ];

    const nearbyMarkers = allMarkers
      .filter(marker => marker.lat && marker.lng)
      .map(marker => {
        const distance = calculateDistance(lat, lng, marker.lat, marker.lng);
        return { ...marker, distance: Math.round(distance) };
      })
      .filter(marker => marker.distance <= radius_meters)
      .sort((a, b) => a.distance - b.distance);

    console.log(`✅ M1QR-TRACE: Found ${nearbyMarkers.length} nearby markers`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        markers: nearbyMarkers,
        total: nearbyMarkers.length,
        search_radius: radius_meters
      }), 
      { headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in get-nearby-markers:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
});