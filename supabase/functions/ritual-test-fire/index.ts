/**
 * The Pulse™ — Ritual Test Fire (Sandbox)
 * Edge Function for testing ritual phases on pulse:ritual:test channel
 * Admin-only, no production side effects
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { withAuthCors, respondJson } from '../_shared/authCors.ts';
import { supaService } from '../_shared/edge-helpers.ts';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function broadcast(channel: string, payload: unknown) {
  const supabase = supaService();
  const ch = supabase.channel(channel);
  
  await ch.subscribe();
  await ch.send({ 
    type: 'broadcast', 
    event: 'ritual-phase', 
    payload 
  });
  
  await supabase.removeChannel(ch);
}

export const handler = withAuthCors(async (req, user, { origin }) => {
  if (req.method !== 'POST') {
    return respondJson(405, { 
      ok: false, 
      code: 'METHOD_NOT_ALLOWED',
      hint: 'Only POST allowed' 
    }, origin);
  }

  console.log('[Ritual Test] Starting sandbox ritual for:', user.email);

  try {
    // Generate unique ritual ID for sandbox
    const ritual_id = `test-${Date.now()}`;
    const now = () => new Date().toISOString();

    // Broadcast phases on TEST channel (no DB writes)
    console.log('[Ritual Test] phase: precharge');
    await broadcast('pulse:ritual:test', { phase: 'precharge', ritual_id, at: now() });
    
    await delay(800);
    console.log('[Ritual Test] phase: blackout');
    await broadcast('pulse:ritual:test', { phase: 'blackout', ritual_id, at: now() });
    
    await delay(1600);
    console.log('[Ritual Test] phase: interference');
    await broadcast('pulse:ritual:test', { phase: 'interference', ritual_id, at: now() });
    
    await delay(1200);
    console.log('[Ritual Test] phase: reveal');
    await broadcast('pulse:ritual:test', { phase: 'reveal', ritual_id, at: now() });
    
    await delay(2400);
    console.log('[Ritual Test] phase: closed');
    await broadcast('pulse:ritual:test', { phase: 'closed', ritual_id, at: now() });

    console.log('[Ritual Test] ✅ Sandbox ritual completed');

    return respondJson(200, { 
      ok: true, 
      test_ritual_id: ritual_id,
      channel: 'pulse:ritual:test',
      phases: ['precharge', 'blackout', 'interference', 'reveal', 'closed'],
      whoami: user.email
    }, origin);

  } catch (error: any) {
    console.error('[Ritual Test] ❌ Error:', error);
    return respondJson(500, { 
      ok: false, 
      code: 'EDGE_ERROR', 
      hint: error.message 
    }, origin);
  }
});

Deno.serve(handler);

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
