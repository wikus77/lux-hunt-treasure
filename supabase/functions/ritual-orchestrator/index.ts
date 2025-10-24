/**
 * The Pulse™ — Ritual Orchestrator Edge Function
 * Automatically triggers ritual phases when pulse reaches 100%
 * Broadcasts phases via Supabase Realtime on pulse:ritual (PROD)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { handleOptions, ok, err } from '../_shared/cors.ts';

interface RitualPhase {
  phase: 'precharge' | 'blackout' | 'interference' | 'reveal' | 'closed';
  ritual_id: number | null;
  at: string;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(req);
  }

  try {
    // Initialize admin client with SERVICE_ROLE key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('[Ritual Orchestrator] Starting ritual check...');

    // 1) Check if ritual can start (Pulse must be 100%)
    const { data: canStart, error: canStartError } = await supabase
      .rpc('rpc_pulse_ritual_can_start');

    if (canStartError) {
      console.error('[Ritual Orchestrator] Error checking can_start:', canStartError);
      throw canStartError;
    }

    if (!canStart?.can) {
      console.log('[Ritual Orchestrator] Cannot start ritual:', canStart?.reason || 'unknown');
      return ok(origin, { 
        success: false, 
        reason: canStart?.reason || 'Cannot start ritual',
        pulse_value: canStart?.pulse_value 
      });
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

    // 3) Subscribe to PROD channel
    const channel = supabase.channel('pulse:ritual');
    await channel.subscribe();
    console.log('[Ritual Orchestrator] ✅ Subscribed to pulse:ritual (PROD)');

    // 4) Broadcast phase sequence
    const now = () => new Date().toISOString();
    
    await channel.send({
      type: 'broadcast',
      event: 'ritual-phase',
      payload: { phase: 'precharge', ritual_id: ritualId, at: now() }
    });
    console.log('[Ritual Orchestrator] → precharge');

    await delay(800);
    await channel.send({
      type: 'broadcast',
      event: 'ritual-phase',
      payload: { phase: 'blackout', ritual_id: ritualId, at: now() }
    });
    console.log('[Ritual Orchestrator] → blackout');

    await delay(1600);
    await channel.send({
      type: 'broadcast',
      event: 'ritual-phase',
      payload: { phase: 'interference', ritual_id: ritualId, at: now() }
    });
    console.log('[Ritual Orchestrator] → interference');

    await delay(1200);
    await channel.send({
      type: 'broadcast',
      event: 'ritual-phase',
      payload: { phase: 'reveal', ritual_id: ritualId, at: now() }
    });
    console.log('[Ritual Orchestrator] → reveal');

    // 5) Wait for claims (30 seconds)
    console.log('[Ritual Orchestrator] ⏳ Waiting 30s for claims...');
    await delay(30000);

    // 6) Close the ritual (DB write)
    console.log('[Ritual Orchestrator] Closing ritual...');
    const { error: closeError } = await supabase
      .rpc('rpc_pulse_ritual_close');

    if (closeError) {
      console.error('[Ritual Orchestrator] Error closing ritual:', closeError);
      throw closeError;
    }

    // Broadcast closed phase
    await channel.send({
      type: 'broadcast',
      event: 'ritual-phase',
      payload: { phase: 'closed', ritual_id: ritualId, at: now() }
    });
    console.log('[Ritual Orchestrator] → closed');

    console.log('[Ritual Orchestrator] ✅ Ritual completed successfully!');

    // Cleanup
    await supabase.removeChannel(channel);

    return ok(origin, { 
      success: true, 
      ritual_id: ritualId,
      message: 'Ritual orchestration completed'
    });

  } catch (error: any) {
    console.error('[Ritual Orchestrator] ❌ Fatal error:', error);
    return err(origin, 500, 'EDGE_ERROR', error.message);
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
