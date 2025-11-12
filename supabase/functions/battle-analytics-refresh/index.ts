// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RefreshResult {
  success: boolean;
  refreshed_views?: number;
  error?: string;
  timestamp: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Battle Analytics Refresh] Starting scheduled refresh');

    // Create service role client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call refresh RPC
    const { data, error } = await supabase.rpc('refresh_battle_stats');

    if (error) {
      console.error('[Battle Analytics Refresh] RPC error:', error);
      
      const result: RefreshResult = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      return new Response(JSON.stringify(result), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[Battle Analytics Refresh] Successfully refreshed', data, 'views');

    const result: RefreshResult = {
      success: true,
      refreshed_views: data as number,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Battle Analytics Refresh] Fatal error:', error);

    const result: RefreshResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
