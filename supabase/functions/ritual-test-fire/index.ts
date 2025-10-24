/**
 * The Pulse™ — Ritual Test Fire (Sandbox)
 * Edge Function for testing ritual phases on pulse:ritual:test channel
 * Admin-only, no production side effects
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { withCors, getUserFromAuthHeader, ensureAdmin, broadcast } from '../_shared/edge-helpers.ts';

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

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

  // Validate user JWT
  const { user, error } = await getUserFromAuthHeader(req, SUPABASE_URL, SUPABASE_ANON_KEY);
  if (error || !user) {
    console.error('[ritual-test-fire] Auth error:', error);
    return new Response(
      JSON.stringify({ ok: false, code: 'AUTH_MISSING', hint: error || 'No valid session' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check admin whitelist
  const admin = ensureAdmin(user.email);
  if (!admin.ok) {
    console.error('[ritual-test-fire] User not in whitelist:', user.email);
    return new Response(
      JSON.stringify({ ok: false, code: 'ADMIN_REQUIRED', hint: 'Not in admin whitelist' }), 
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  console.log('[ritual-test-fire] Starting sandbox ritual for:', user.email);

  try {
    // Generate unique ritual ID for sandbox
    const ritual_id = `test-${Date.now()}`;
    const now = () => new Date().toISOString();

    // Broadcast phases on TEST channel (no DB writes)
    await broadcast('pulse:ritual:test', { phase: 'precharge', ritual_id, at: now() });
    console.log('[ritual-test-fire] → precharge');
    
    await delay(800);
    await broadcast('pulse:ritual:test', { phase: 'blackout', ritual_id, at: now() });
    console.log('[ritual-test-fire] → blackout');
    
    await delay(1600);
    await broadcast('pulse:ritual:test', { phase: 'interference', ritual_id, at: now() });
    console.log('[ritual-test-fire] → interference');
    
    await delay(1200);
    await broadcast('pulse:ritual:test', { phase: 'reveal', ritual_id, at: now() });
    console.log('[ritual-test-fire] → reveal');

    console.log('[ritual-test-fire] ✅ Sandbox ritual completed');

    return new Response(
      JSON.stringify({ 
        ok: true, 
        ritual_id,
        channel: 'pulse:ritual:test',
        phases: ['precharge', 'blackout', 'interference', 'reveal'],
        user: user.email
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[ritual-test-fire] ❌ Error:', error);
    return new Response(
      JSON.stringify({ ok: false, code: 'EDGE_ERROR', hint: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

Deno.serve(handler);

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
