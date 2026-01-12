/**
 * Battle Push Send - Invia notifica push al difensore
 * Chiama webpush-targeted-send internamente con admin token
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
const PUSH_ADMIN_TOKEN = Deno.env.get("PUSH_ADMIN_TOKEN")!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // 1. Verify user JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("[BATTLE-PUSH] Missing authorization header");
      return json({ error: 'Missing authorization' }, 401);
    }

    const jwt = authHeader.replace('Bearer ', '');
    const supabase = createClient(SB_URL, SERVICE_ROLE_KEY);

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      console.error("[BATTLE-PUSH] Auth error:", authError);
      return json({ error: 'Invalid token' }, 401);
    }

    console.log(`[BATTLE-PUSH] ✅ User authenticated: ${user.id}`);

    // 2. Parse request body
    const body = await req.json();
    const { 
      defender_id, 
      battle_id,
      attacker_agent_code,
      attacker_weapon_power,
      stake_type,
      stake_amount,
      arena_name 
    } = body;

    if (!defender_id || !battle_id) {
      console.error("[BATTLE-PUSH] Missing defender_id or battle_id");
      return json({ error: 'Missing defender_id or battle_id' }, 400);
    }

    // Prevent sending to self
    if (defender_id === user.id) {
      console.error("[BATTLE-PUSH] User trying to attack themselves");
      return json({ error: 'Cannot attack yourself' }, 400);
    }

    console.log(`[BATTLE-PUSH] 📤 Sending battle notification to defender: ${defender_id}`);
    console.log(`[BATTLE-PUSH] Battle ID: ${battle_id}, Attacker: ${attacker_agent_code}`);

    // 3. Build notification payload
    const notifPayload = {
      title: '⚔️ SEI SOTTO ATTACCO!',
      body: `${attacker_agent_code || 'Un agente'} ti sta attaccando! Rispondi ora!`,
      url: `/map-3d-tiler?battle=${battle_id}`,
      extra: {
        type: 'battle_invite',
        battle_id,
        attacker_id: user.id,
        attacker_agent_code,
        attacker_weapon_power: attacker_weapon_power || 0,
        stake_type: stake_type || 'PE',
        stake_amount: stake_amount || 50,
        arena_name,
      }
    };

    // 4. Call webpush-targeted-send internally (same as auto-push-cron does)
    console.log(`[BATTLE-PUSH] 📤 Calling webpush-targeted-send...`);
    
    const pushResponse = await fetch(`${SB_URL}/functions/v1/webpush-targeted-send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': PUSH_ADMIN_TOKEN
      },
      body: JSON.stringify({
        user_ids: [defender_id],
        payload: notifPayload
      })
    });

    const pushResult = await pushResponse.json();
    
    console.log(`[BATTLE-PUSH] Response status: ${pushResponse.status}`);
    console.log(`[BATTLE-PUSH] Response body:`, JSON.stringify(pushResult));

    if (pushResponse.ok && pushResult.success) {
      console.log(`[BATTLE-PUSH] ✅ SUCCESS! Sent: ${pushResult.sent}, Failed: ${pushResult.failed}`);
      
      // Log to push_logs table
      await supabase.from('push_logs').insert({
        user_id: defender_id,
        endpoint: 'battle-push-send',
        status: 'success',
        payload: { battle_id, attacker_id: user.id, attacker_agent_code, sent: pushResult.sent }
      }).catch(() => {});

      return json({
        success: true,
        total: pushResult.total || 0,
        sent: pushResult.sent || 0,
        failed: pushResult.failed || 0,
        message: pushResult.sent > 0 ? 'Battle notification sent!' : 'No active subscriptions'
      }, 200);
    } else {
      console.error(`[BATTLE-PUSH] ❌ FAILED:`, pushResult.error || pushResult);
      
      return json({
        success: false,
        error: pushResult.error || 'Push send failed',
        details: pushResult
      }, pushResponse.status >= 400 ? pushResponse.status : 500);
    }

  } catch (error: any) {
    console.error("[BATTLE-PUSH] ❌ Internal error:", error);
    return json({ error: 'Internal error', details: error.message }, 500);
  }
});

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
