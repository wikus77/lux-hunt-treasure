// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, marker_id, distance } = await req.json();
    
    if (!user_id || !marker_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id or marker_id' }), 
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(url, key);

    console.log(`🎯 M1QR-TRACE: Logging geo alert for user ${user_id}, marker ${marker_id}, distance ${distance}m`);

    // Check if already notified for this marker today
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('user_notified_markers')
      .select('id')
      .eq('user_id', user_id)
      .eq('marker_id', marker_id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .single();

    if (existing) {
      console.log(`🎯 M1QR-TRACE: User already notified for marker ${marker_id} today`);
      return new Response(
        JSON.stringify({ success: true, message: 'Already notified today' }), 
        { headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    // Log the geo alert
    const { error: insertError } = await supabase
      .from('user_notified_markers')
      .insert({
        user_id,
        marker_id,
        distance_meters: distance,
        alert_type: 'geo_proximity',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Failed to log geo alert:', insertError);
      throw insertError;
    }

    // Also log to admin_logs for tracking
    await supabase
      .from('admin_logs')
      .insert({
        event_type: 'geo_alert_sent',
        user_id,
        note: `User alerted about marker ${marker_id} at ${distance}m distance`,
        context: 'geo_proximity_system'
      });

    console.log(`✅ M1QR-TRACE: Geo alert logged successfully for user ${user_id}`);

    return new Response(
      JSON.stringify({ success: true }), 
      { headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in log-user-geo-alert:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
});