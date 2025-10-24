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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
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
      throw testError;
    }

    const testRitualId = testData?.test_ritual_id || 999999;
    console.log('[Ritual Test] 🧪 Test ritual created:', testRitualId);

    // Broadcast phases on TEST channel
    const channel = supabase.channel('pulse:ritual:test');

    // Helper to broadcast a phase on test channel
    const broadcastPhase = async (phase: RitualPhase['phase'], delayMs: number = 0) => {
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      const payload: RitualPhase = {
        phase,
        ritual_id: testRitualId,
        at: new Date().toISOString()
      };

      console.log(`[Ritual Test] Broadcasting TEST phase: ${phase}`);
      
      await channel.send({
        type: 'broadcast',
        event: 'ritual-phase',
        payload
      });
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
        success: true, 
        test_ritual_id: testRitualId,
        message: 'Test ritual phases broadcast on pulse:ritual:test',
        phases: ['precharge', 'blackout', 'interference', 'reveal', 'closed']
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Ritual Test] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
