/**
 * The Pulse™ — Ritual Orchestrator Edge Function
 * Automatically triggers ritual phases when pulse reaches 100%
 * Broadcasts phases via Supabase Realtime on pulse:ritual (PROD)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { withCors, supaService, broadcast } from '../_shared/edge-helpers.ts';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const handler = withCors(async (req) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, code: 'METHOD_NOT_ALLOWED' }), 
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('[Ritual Orchestrator] Starting ritual check...');

    // Get service role client for DB operations
    const supabase = supaService();

    // 1) Check if ritual can start (Pulse must be 100%)
    const { data: canStart, error: canStartError } = await supabase
      .rpc('rpc_pulse_ritual_can_start');

    if (canStartError) {
      console.error('[Ritual Orchestrator] Error checking can_start:', canStartError);
      throw canStartError;
    }

    if (!canStart?.can) {
      console.log('[Ritual Orchestrator] Cannot start ritual:', canStart?.reason || 'unknown');
      return new Response(
        JSON.stringify({ 
          success: false, 
          reason: canStart?.reason || 'Cannot start ritual',
          pulse_value: canStart?.pulse_value 
        }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Ritual Orchestrator] ✅ Can start ritual! Pulse at 100%');

    // 2) Start the ritual (DB write)
    const { data: startData, error: startError } = await supabase
      .rpc('rpc_pulse_ritual_start');

    if (startError) {
      console.error('[Ritual Orchestrator] Error starting ritual:', startError);
      throw startError;
    }

    const ritualId = startData?.ritual_id;
    console.log('[Ritual Orchestrator] 🌟 Ritual started! ID:', ritualId);

    // 3) Broadcast phase sequence on PROD channel
    const now = () => new Date().toISOString();
    
    await broadcast('pulse:ritual', { phase: 'precharge', ritual_id: ritualId, at: now() });
    console.log('[Ritual Orchestrator] → precharge');

    await delay(800);
    await broadcast('pulse:ritual', { phase: 'blackout', ritual_id: ritualId, at: now() });
    console.log('[Ritual Orchestrator] → blackout');

    await delay(1600);
    await broadcast('pulse:ritual', { phase: 'interference', ritual_id: ritualId, at: now() });
    console.log('[Ritual Orchestrator] → interference');

    await delay(1200);
    await broadcast('pulse:ritual', { phase: 'reveal', ritual_id: ritualId, at: now() });
    console.log('[Ritual Orchestrator] → reveal');

    // 4) Wait for claims (30 seconds)
    console.log('[Ritual Orchestrator] ⏳ Waiting 30s for claims...');
    await delay(30000);

    // 5) Close the ritual (DB write)
    console.log('[Ritual Orchestrator] Closing ritual...');
    const { error: closeError } = await supabase
      .rpc('rpc_pulse_ritual_close');

    if (closeError) {
      console.error('[Ritual Orchestrator] Error closing ritual:', closeError);
      throw closeError;
    }

    // Broadcast closed phase
    await broadcast('pulse:ritual', { phase: 'closed', ritual_id: ritualId, at: now() });
    console.log('[Ritual Orchestrator] → closed');

    console.log('[Ritual Orchestrator] ✅ Ritual completed successfully!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        ritual_id: ritualId,
        message: 'Ritual orchestration completed'
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Ritual Orchestrator] ❌ Fatal error:', error);
    return new Response(
      JSON.stringify({ ok: false, code: 'EDGE_ERROR', hint: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

Deno.serve(handler);

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
