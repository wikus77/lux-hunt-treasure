// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * Edge Function: pulse-threshold-notify
 * Invia notifiche push quando si raggiunge una soglia Pulse
 * 
 * SEPARATA dal sistema auto-push-cron - NON interferisce con le notifiche periodiche
 * Chiamata direttamente dal trigger SQL quando una soglia viene raggiunta
 */

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
const PUSH_ADMIN_TOKEN = Deno.env.get("PUSH_ADMIN_TOKEN")!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
};

// Template messaggi per ogni soglia (IT)
const THRESHOLD_MESSAGES_IT: Record<number, { title: string; body: string; emoji: string }> = {
  25: {
    title: '⚡ PULSE 25% Raggiunto!',
    body: 'La comunità ha raggiunto il 25%! Hai ricevuto +{reward} M1U{bonus}',
    emoji: '⚡'
  },
  50: {
    title: '🔥 PULSE 50% Raggiunto!',
    body: 'Metà strada! La comunità è al 50%! Hai ricevuto +{reward} M1U{bonus}',
    emoji: '🔥'
  },
  75: {
    title: '🚀 PULSE 75% Raggiunto!',
    body: 'Quasi al massimo! 75% PULSE! Hai ricevuto +{reward} M1U{bonus}',
    emoji: '🚀'
  },
  100: {
    title: '🏆 PULSE 100% - COMPLETO!',
    body: 'INCREDIBILE! PULSE al massimo! Hai ricevuto +{reward} M1U{bonus}! Nuovo ciclo iniziato!',
    emoji: '🏆'
  }
};

// Template messaggi per ogni soglia (EN)
const THRESHOLD_MESSAGES_EN: Record<number, { title: string; body: string; emoji: string }> = {
  25: {
    title: '⚡ PULSE 25% Reached!',
    body: 'The community reached 25%! You received +{reward} M1U{bonus}',
    emoji: '⚡'
  },
  50: {
    title: '🔥 PULSE 50% Reached!',
    body: 'Halfway there! Community at 50%! You received +{reward} M1U{bonus}',
    emoji: '🔥'
  },
  75: {
    title: '🚀 PULSE 75% Reached!',
    body: 'Almost there! 75% PULSE! You received +{reward} M1U{bonus}',
    emoji: '🚀'
  },
  100: {
    title: '🏆 PULSE 100% - COMPLETE!',
    body: 'INCREDIBLE! PULSE maxed out! You received +{reward} M1U{bonus}! New cycle started!',
    emoji: '🏆'
  }
};

interface NotifyRequest {
  threshold: number;
  cycle_id: number;
  triggered_by_user_id?: string;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const body: NotifyRequest = await req.json();
    const { threshold, cycle_id, triggered_by_user_id } = body;

    // 🔒 SECURITY: Verify internal secret for trigger calls
    const INTERNAL_SECRET = Deno.env.get("CRON_SECRET") || Deno.env.get("INTERNAL_SECRET");
    const providedSecret = req.headers.get("x-internal-secret") || req.headers.get("x-cron-secret") || (body as any).internal_secret;
    
    // Allow if: secret matches OR if called from Supabase internal
    const authHeader = req.headers.get("authorization");
    const isServiceRole = authHeader?.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.slice(0, 20) || "NONE");
    
    if (INTERNAL_SECRET && providedSecret !== INTERNAL_SECRET && !isServiceRole) {
      console.warn("[PULSE-NOTIFY] ⚠️ Missing or invalid internal secret - allowing for backwards compatibility");
      // NOTE: Enable this block to enforce strict auth:
      // return json({ error: "Unauthorized - invalid internal secret" }, 401);
    }

    console.log(`[PULSE-NOTIFY] 🎯 Threshold ${threshold}% reached, cycle ${cycle_id}`);

    if (!threshold || ![25, 50, 75, 100].includes(threshold)) {
      return json({ error: 'Invalid threshold' }, 400);
    }

    const supabase = createClient(SB_URL, SERVICE_ROLE_KEY);

    // 1. Get all users who received rewards for this threshold/cycle
    const { data: rewards, error: rewardsError } = await supabase
      .from('pulse_rewards_log')
      .select('user_id, total_reward, bonus_reward, is_contributor')
      .eq('cycle_id', cycle_id)
      .eq('threshold', threshold);

    if (rewardsError) {
      console.error('[PULSE-NOTIFY] ❌ Error fetching rewards:', rewardsError);
      return json({ error: 'Failed to fetch rewards' }, 500);
    }

    if (!rewards || rewards.length === 0) {
      console.log('[PULSE-NOTIFY] ⚠️ No rewards found for this threshold');
      return json({ ok: true, message: 'No rewards to notify', sent: 0 }, 200);
    }

    console.log(`[PULSE-NOTIFY] 📋 Found ${rewards.length} users to notify`);

    // 2. Get user profiles with language preference
    const userIds = rewards.map(r => r.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, preferred_language, agent_code')
      .in('id', userIds);

    if (profilesError) {
      console.error('[PULSE-NOTIFY] ❌ Error fetching profiles:', profilesError);
    }

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // 3. Send notifications to each user
    let sentCount = 0;
    let errorCount = 0;

    for (const reward of rewards) {
      const profile = profileMap.get(reward.user_id);
      const lang = profile?.preferred_language || 'it';
      const messages = lang === 'en' ? THRESHOLD_MESSAGES_EN : THRESHOLD_MESSAGES_IT;
      const template = messages[threshold];

      if (!template) {
        console.error(`[PULSE-NOTIFY] ❌ No template for threshold ${threshold}`);
        continue;
      }

      // Build message
      const bonusText = reward.is_contributor 
        ? (lang === 'en' ? ' (+ contributor bonus!)' : ' (+ bonus contributore!)')
        : '';
      
      const title = template.title;
      const body = template.body
        .replace('{reward}', String(reward.total_reward))
        .replace('{bonus}', bonusText);

      try {
        const pushResponse = await fetch(`${SB_URL}/functions/v1/webpush-targeted-send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': PUSH_ADMIN_TOKEN
          },
          body: JSON.stringify({
            user_ids: [reward.user_id],
            payload: {
              title,
              body,
              url: '/home', // Redirect to home where PulseBar is visible
              extra: {
                type: 'pulse_threshold',
                threshold,
                cycle_id,
                reward: reward.total_reward
              }
            }
          })
        });

        const pushResult = await pushResponse.json();

        if (pushResponse.ok && pushResult.success) {
          sentCount++;
          console.log(`[PULSE-NOTIFY] ✅ Sent to ${profile?.agent_code || reward.user_id}`);
        } else {
          errorCount++;
          console.log(`[PULSE-NOTIFY] ❌ Failed for ${profile?.agent_code || reward.user_id}: ${pushResult.error}`);
        }
      } catch (error: any) {
        errorCount++;
        console.error(`[PULSE-NOTIFY] ❌ Exception for ${reward.user_id}:`, error.message);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`[PULSE-NOTIFY] ✅ Complete: sent=${sentCount}, errors=${errorCount}`);

    return json({
      ok: true,
      threshold,
      cycle_id,
      total_users: rewards.length,
      sent: sentCount,
      errors: errorCount
    }, 200);

  } catch (error: any) {
    console.error('[PULSE-NOTIFY] ❌ Internal error:', error);
    return json({ error: 'Internal error', details: error.message }, 500);
  }
});

// Helper
function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json'
    }
  });
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

