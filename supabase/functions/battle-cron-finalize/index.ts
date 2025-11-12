// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinalizeResult {
  sessions_finalized: number;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[Battle Cron] Starting finalization check...');

  try {
    // Create Supabase client with service role (bypass RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('[Battle Cron] Calling finalize_expired_battles RPC...');

    // Call the RPC function to finalize expired battles
    const { data, error } = await supabase.rpc('finalize_expired_battles');

    if (error) {
      console.error('[Battle Cron] RPC error:', error);
      return new Response(
        JSON.stringify({ 
          sessions_finalized: 0, 
          error: error.message 
        } as FinalizeResult),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const finalizedCount = data || 0;
    console.log(`[Battle Cron] Successfully finalized ${finalizedCount} expired battle(s)`);

    return new Response(
      JSON.stringify({ 
        sessions_finalized: finalizedCount 
      } as FinalizeResult),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (err) {
    console.error('[Battle Cron] Unexpected error:', err);
    return new Response(
      JSON.stringify({ 
        sessions_finalized: 0, 
        error: String(err) 
      } as FinalizeResult),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
