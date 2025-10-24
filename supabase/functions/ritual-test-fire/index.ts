/**
 * The Pulse™ — Ritual Test Fire (Sandbox)
 * Edge Function for testing ritual phases on pulse:ritual:test channel
 * Admin-only, no production side effects
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { handleOptions, ok, err } from '../_shared/cors.ts';
import { validateAdmin } from '../_shared/client.ts';

interface RitualPhase {
  phase: 'precharge' | 'blackout' | 'interference' | 'reveal';
  ritual_id: string;
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

  // Validate admin access
  const { user, error: authError } = await validateAdmin(req);
  if (authError) {
    return err(origin, authError.status, authError.code, authError.hint);
  }

  try {
    console.log('[ritual-test-fire] Starting sandbox ritual for:', user.email);

    // Initialize admin client for Realtime broadcasts (SERVICE_ROLE only)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Subscribe to TEST channel (not prod)
    const channel = adminClient.channel('pulse:ritual:test');
    await channel.subscribe();

    console.log('[ritual-test-fire] ✅ Subscribed to pulse:ritual:test');

    // Broadcast phases with timing (NO DB writes)
    const now = () => new Date().toISOString();
    
    await channel.send({
      type: 'broadcast',
      event: 'ritual-phase',
      payload: { phase: 'precharge', ritual_id: 'test', at: now() }
    });
    console.log('[ritual-test-fire] → precharge');
    
    await delay(800);
    await channel.send({
      type: 'broadcast',
      event: 'ritual-phase',
      payload: { phase: 'blackout', ritual_id: 'test', at: now() }
    });
    console.log('[ritual-test-fire] → blackout');
    
    await delay(1600);
    await channel.send({
      type: 'broadcast',
      event: 'ritual-phase',
      payload: { phase: 'interference', ritual_id: 'test', at: now() }
    });
    console.log('[ritual-test-fire] → interference');
    
    await delay(1200);
    await channel.send({
      type: 'broadcast',
      event: 'ritual-phase',
      payload: { phase: 'reveal', ritual_id: 'test', at: now() }
    });
    console.log('[ritual-test-fire] → reveal');

    console.log('[ritual-test-fire] ✅ Sandbox ritual completed');

    // Cleanup
    await adminClient.removeChannel(channel);

    return ok(origin, { 
      ok: true, 
      channel: 'pulse:ritual:test',
      phases: ['precharge', 'blackout', 'interference', 'reveal'],
      user: user.email
    });

  } catch (error: any) {
    console.error('[ritual-test-fire] ❌ Error:', error);
    return err(origin, 500, 'EDGE_ERROR', error.message);
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
