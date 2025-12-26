// © 2025 Joseph MULÉ – M1SSION™ – DIAGNOSTIC FUNCTION
// Questo verifica ESATTAMENTE cosa c'è nel database e prova a cancellare

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const results: Record<string, any> = {};
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    results['timestamp'] = new Date().toISOString();
    results['service_role_available'] = !!supabaseServiceKey;

    // Lista tabelle da verificare con la loro colonna chiave
    const tables = [
      { name: 'user_notifications', key: 'id' },
      { name: 'user_clues', key: 'id' },
      { name: 'buzz_map_actions', key: 'id' },
      { name: 'user_map_areas', key: 'id' },
      { name: 'search_areas', key: 'id' },
      { name: 'final_shoot_attempts', key: 'id' },
      { name: 'marker_claims', key: 'id' },
      { name: 'map_click_events', key: 'id' },
      { name: 'map_points', key: 'id' },
      { name: 'mission_enrollments', key: 'id' },
      { name: 'geo_radar_coordinates', key: 'id' },
      { name: 'user_buzz_counter', key: 'user_id' },
      { name: 'user_buzz_map_counter', key: 'user_id' },
      { name: 'user_mission_status', key: 'user_id' },
    ];

    for (const table of tables) {
      try {
        // 1. COUNT rows
        const { count, error: countError } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });

        if (countError) {
          results[table.name] = { error: countError.message, exists: false };
          continue;
        }

        // 2. Get sample row to see structure
        const { data: sample, error: sampleError } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);

        const columns = sample && sample.length > 0 ? Object.keys(sample[0]) : [];

        results[table.name] = {
          exists: true,
          row_count: count || 0,
          columns: columns,
          has_id_column: columns.includes('id'),
          has_user_id_column: columns.includes('user_id'),
          key_column: table.key,
        };

      } catch (e: any) {
        results[table.name] = { error: e.message };
      }
    }

    // TENTATIVO DI DELETE su user_notifications
    try {
      results['delete_test'] = {};
      
      // Prima conta
      const { count: before } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true });
      
      results['delete_test']['before_count'] = before;

      // Prova delete con diversi metodi
      const { data: allNotifs, error: selectErr } = await supabase
        .from('user_notifications')
        .select('id')
        .limit(10);

      results['delete_test']['sample_ids'] = allNotifs?.map(n => n.id).slice(0, 3);
      results['delete_test']['select_error'] = selectErr?.message;

      if (allNotifs && allNotifs.length > 0) {
        // Prova a cancellare UN SOLO record
        const testId = allNotifs[0].id;
        const { error: delError } = await supabase
          .from('user_notifications')
          .delete()
          .eq('id', testId);

        results['delete_test']['single_delete_error'] = delError?.message || 'SUCCESS';

        // Conta dopo
        const { count: after } = await supabase
          .from('user_notifications')
          .select('*', { count: 'exact', head: true });

        results['delete_test']['after_count'] = after;
        results['delete_test']['actually_deleted'] = (before || 0) - (after || 0);
      }
    } catch (e: any) {
      results['delete_test'] = { error: e.message };
    }

    // Verifica RLS policies
    try {
      const { data: policies } = await supabase.rpc('get_policies_info');
      results['rls_policies'] = policies || 'RPC not available';
    } catch {
      results['rls_policies'] = 'Cannot check';
    }

    return new Response(
      JSON.stringify({ success: true, diagnostic: results }, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message, partial_results: results }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});




