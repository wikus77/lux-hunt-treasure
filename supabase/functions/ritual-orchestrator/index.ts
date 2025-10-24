/**
 * The Pulse™ — Ritual Orchestrator Edge Function
 * Automatically triggers ritual phases when pulse reaches 100%
 * Broadcasts phases via Supabase Realtime
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
    // Initialize Supabase client with service_role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('[Ritual Orchestrator] Starting ritual check...');

    // 1) Check if ritual can start
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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Ritual Orchestrator] ✅ Can start ritual! Pulse at 100%');

    // 2) Start the ritual
    const { data: startData, error: startError } = await supabase
      .rpc('rpc_pulse_ritual_start');

    if (startError) {
      console.error('[Ritual Orchestrator] Error starting ritual:', startError);
      throw startError;
    }

    const ritualId = startData?.ritual_id;
    console.log('[Ritual Orchestrator] 🌟 Ritual started! ID:', ritualId);

    // 3) Broadcast phases with timing
    const channel = supabase.channel('pulse:ritual');

    // Helper to broadcast a phase
    const broadcastPhase = async (phase: RitualPhase['phase'], delayMs: number = 0) => {
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      const payload: RitualPhase = {
        phase,
        ritual_id: ritualId,
        at: new Date().toISOString()
      };

      console.log(`[Ritual Orchestrator] Broadcasting phase: ${phase}`);
      
      await channel.send({
        type: 'broadcast',
        event: 'ritual-phase',
        payload
      });
    };

    // Subscribe to channel
    await channel.subscribe();

    // Execute phase sequence
    await broadcastPhase('precharge', 0);           // t=0
    await broadcastPhase('blackout', 800);          // t=+800ms
    await broadcastPhase('interference', 1600);     // t=+2400ms total
    await broadcastPhase('reveal', 1200);           // t=+3600ms total

    // 4) Wait for claims (30 seconds)
    console.log('[Ritual Orchestrator] ⏳ Waiting 30s for claims...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // 5) Close the ritual
    console.log('[Ritual Orchestrator] Closing ritual...');
    const { error: closeError } = await supabase
      .rpc('rpc_pulse_ritual_close');

    if (closeError) {
      console.error('[Ritual Orchestrator] Error closing ritual:', closeError);
      throw closeError;
    }

    // Broadcast closed phase
    await broadcastPhase('closed', 0);

    console.log('[Ritual Orchestrator] ✅ Ritual completed successfully!');

    // Cleanup
    await supabase.removeChannel(channel);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ritual_id: ritualId,
        message: 'Ritual orchestration completed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Ritual Orchestrator] Fatal error:', error);
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
