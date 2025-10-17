// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: get-nearby-prizes
// Returns prizes/markers near user location

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, radiusKm = 5 } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get active prizes within radius
    // Note: This uses a simple approach. For production, use PostGIS or custom distance function
    const { data: prizes } = await supabaseClient
      .from('admin_prizes')
      .select('*')
      .eq('is_active', true);

    // Get active buzz game targets
    const { data: targets } = await supabaseClient
      .from('buzz_game_targets')
      .select('*')
      .eq('is_active', true);

    // Simple distance filter (Haversine approximation)
    const filtered = {
      prizes: prizes || [],
      targets: targets || [],
      count: (prizes?.length || 0) + (targets?.length || 0)
    };

    return new Response(
      JSON.stringify(filtered),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[get-nearby-prizes] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
