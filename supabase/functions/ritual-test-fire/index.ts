/**
 * The Pulse™ — Ritual Test Fire (Sandbox)
 * Admin-only function to simulate ritual phases on test channel
 * Does NOT affect production pulse_state
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { corsHeaders, handleOptions } from '../_shared/cors.ts';
import { makeAdminClient, validateAdmin } from '../_shared/client.ts';

interface RitualPhase {
  phase: 'idle' | 'precharge' | 'blackout' | 'interference' | 'reveal' | 'closed';
  ritual_id: number | null;
  at: string;
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(req);
  }

  // GET /ping - Health check
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ 
        ok: true, 
        version: '1.0.0',
        region: Deno.env.get('DENO_REGION') || 'unknown',
        service: 'ritual-test-fire',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...Object.fromEntries(headers.entries()),
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
          ...Object.fromEntries(headers.entries()),
          'Content-Type': 'application/json',
          'X-Request-Id': requestId
        } 
      }
    );
  }

  try {
    // Validate admin authorization
    const { user, error: authError } = await validateAdmin(req);
    
    if (authError) {
      console.warn('[Ritual Test] Auth failed:', authError.hint);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          code: authError.code,
          hint: authError.hint
        }),
        { 
          status: authError.status,
          headers: { 
            ...Object.fromEntries(headers.entries()),
            'Content-Type': 'application/json',
            'X-Request-Id': requestId
          } 
        }
      );
    }

    console.log(`[Ritual Test] ✅ Authorized admin: ${user.email}`);
    
    // Initialize admin client for broadcasting
    const adminClient = makeAdminClient();

    console.log('[Ritual Test] Starting test ritual simulation...');

    // Call test RPC to create test ritual record
    const { data: testData, error: testError } = await adminClient
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
            ...Object.fromEntries(headers.entries()),
            'Content-Type': 'application/json',
            'X-Request-Id': requestId
          } 
        }
      );
    }

    const testRitualId = testData?.test_ritual_id || 999999;
    console.log('[Ritual Test] 🧪 Test ritual created:', testRitualId);

    // Broadcast phases on TEST channel
    const channel = adminClient.channel('pulse:ritual:test');

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
    await adminClient.removeChannel(channel);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        test_ritual_id: testRitualId,
        message: 'Test ritual phases broadcast on pulse:ritual:test',
        phases
      }),
      { 
        headers: { 
          ...Object.fromEntries(headers.entries()),
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
          ...Object.fromEntries(headers.entries()),
          'Content-Type': 'application/json',
          'X-Request-Id': requestId
        } 
      }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
