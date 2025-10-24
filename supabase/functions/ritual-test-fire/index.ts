/**
 * The Pulse™ — Ritual Test Fire (Sandbox)
 * Admin-only function to simulate ritual phases on test channel
 * Does NOT affect production pulse_state
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RitualPhase {
  phase: 'idle' | 'precharge' | 'blackout' | 'interference' | 'reveal' | 'closed';
  ritual_id: number | null;
  at: string;
}

// Admin whitelist from environment
const ADMIN_WHITELIST = (Deno.env.get('ADMIN_WHITELIST') || '').split(',').map(e => e.trim()).filter(Boolean);

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { ...corsHeaders, 'X-Request-Id': requestId } 
    });
  }

  // GET /ping - Health check
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ 
        ok: true, 
        version: '1.0.0',
        region: Deno.env.get('DENO_REGION') || 'unknown',
        service: 'ritual-test-fire'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-Id': requestId
        } 
      }
    );
  }

  // POST /run - Execute test ritual
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        ok: false, 
        code: 'method_not_allowed',
        hint: 'Use GET for ping or POST for run'
      }),
      { 
        status: 405,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-Id': requestId
        } 
      }
    );
  }

  try {
    // Validate JWT and check admin whitelist
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          code: 'auth',
          hint: 'Sign-in required'
        }),
        { 
          status: 401,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Request-Id': requestId
          } 
        }
      );
    }

    // Initialize Supabase client with user's JWT for auth check
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { authorization: authHeader } },
      auth: { persistSession: false }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    
    if (authError || !user) {
      console.error('[Ritual Test] Auth error:', authError);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          code: 'auth',
          hint: 'Invalid or expired token'
        }),
        { 
          status: 401,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Request-Id': requestId
          } 
        }
      );
    }

    // Check admin whitelist
    if (!ADMIN_WHITELIST.includes(user.email || '')) {
      console.warn('[Ritual Test] Unauthorized access attempt:', user.email);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          code: 'forbidden',
          hint: 'Not in admin whitelist'
        }),
        { 
          status: 403,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Request-Id': requestId
          } 
        }
      );
    }

    console.log(`[Ritual Test] Authorized admin: ${user.email}`);
    
    // Initialize service role client for broadcasting
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('[Ritual Test] Starting test ritual simulation...');

    // Call test RPC to create test ritual record
    const { data: testData, error: testError } = await supabase
      .rpc('rpc_pulse_ritual_test_fire');

    if (testError) {
      console.error('[Ritual Test] Error calling test RPC:', testError);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          code: 'rpc_error',
          hint: 'Failed to create test ritual record',
          details: testError.message
        }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Request-Id': requestId
          } 
        }
      );
    }

    const testRitualId = testData?.test_ritual_id || 999999;
    console.log('[Ritual Test] 🧪 Test ritual created:', testRitualId);

    // Broadcast phases on TEST channel
    const channel = supabase.channel('pulse:ritual:test');

    const phases: Array<{ phase: RitualPhase['phase']; at: string }> = [];

    // Helper to broadcast a phase on test channel
    const broadcastPhase = async (phase: RitualPhase['phase'], delayMs: number = 0) => {
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      const timestamp = new Date().toISOString();
      const payload: RitualPhase = {
        phase,
        ritual_id: testRitualId,
        at: timestamp
      };

      console.log(`[Ritual Test] Broadcasting TEST phase: ${phase}`);
      
      try {
        await channel.send({
          type: 'broadcast',
          event: 'ritual-phase',
          payload
        });
        phases.push({ phase, at: timestamp });
      } catch (err) {
        console.error(`[Ritual Test] Failed to broadcast ${phase}:`, err);
      }
    };

    // Subscribe to test channel
    await channel.subscribe();

    // Execute test phase sequence (same timing as production)
    await broadcastPhase('precharge', 0);           // t=0
    await broadcastPhase('blackout', 800);          // t=+800ms
    await broadcastPhase('interference', 1600);     // t=+2400ms total
    await broadcastPhase('reveal', 1200);           // t=+3600ms total

    // Wait 5 seconds (shorter than prod for testing)
    console.log('[Ritual Test] ⏳ Waiting 5s for test claims...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Broadcast closed phase
    await broadcastPhase('closed', 0);

    console.log('[Ritual Test] ✅ Test ritual completed!');

    // Cleanup
    await supabase.removeChannel(channel);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        test_ritual_id: testRitualId,
        message: 'Test ritual phases broadcast on pulse:ritual:test',
        phases
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-Id': requestId
        } 
      }
    );

  } catch (error) {
    console.error('[Ritual Test] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false,
        code: 'internal_error',
        hint: 'Unexpected error during ritual execution',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-Id': requestId
        } 
      }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
