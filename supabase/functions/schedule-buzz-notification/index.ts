// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Schedule Push Notification for BUZZ/BUZZ MAPPA™ Cooldown

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduleRequest {
  user_id: string;
  buzz_type: 'buzz' | 'buzz_mappa';
  scheduled_time: string; // ISO timestamp
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, buzz_type, scheduled_time } = await req.json() as ScheduleRequest;

    if (!user_id || !buzz_type || !scheduled_time) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📅 Scheduling ${buzz_type} notification for user ${user_id} at ${scheduled_time}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create scheduled notification record
    const { error: scheduleError } = await supabase
      .from('scheduled_notifications')
      .insert({
        user_id,
        notification_type: `${buzz_type}_available`,
        scheduled_for: scheduled_time,
        title: buzz_type === 'buzz_mappa' ? '🗺️ BUZZ MAPPA™ disponibile!' : '⚡ BUZZ disponibile!',
        message: buzz_type === 'buzz_mappa' 
          ? 'Il Tasto BUZZ MAPPA™ è di nuovo attivo. È ora di fare la tua prossima mossa.'
          : 'Il Tasto BUZZ è di nuovo attivo. È ora di continuare la tua missione.',
        payload: { 
          action: buzz_type === 'buzz_mappa' ? 'open_map' : 'open_buzz',
          url: buzz_type === 'buzz_mappa' ? '/map-3d-tiler' : '/dashboard'
        },
        status: 'scheduled'
      });

    if (scheduleError) {
      console.error('Error scheduling notification:', scheduleError);
      return new Response(
        JSON.stringify({ error: 'Errore nella programmazione della notifica' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ ${buzz_type} notification scheduled successfully for ${scheduled_time}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notifica programmata con successo',
        scheduled_for: scheduled_time,
        buzz_type
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Schedule notification error:', error);
    return new Response(
      JSON.stringify({ error: 'Errore interno del server' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™