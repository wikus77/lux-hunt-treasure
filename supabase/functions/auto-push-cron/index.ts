// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * Edge Function: auto-push-cron
 * - Invio automatico notifiche push TARGETED (3–5 al giorno)
 * - Usa webpush-targeted-send per invio mirato a user_ids
 * - Rispetta cap giornaliero (5 push/utente/giorno)
 * - Protetta da x-cron-secret, NO JWT
 * - Quiet hours: 21:00-08:59
 */

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const ADMIN_PUSH_TOKEN = Deno.env.get("PUSH_ADMIN_TOKEN")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

// Active time slots (9:00-20:00 in 4 slots)
const ACTIVE_SLOTS = [
  { start: 9, end: 11 },
  { start: 12, end: 14 },
  { start: 16, end: 18 },
  { start: 18, end: 20 }
];

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // 1. Auth: x-cron-secret
    const cronSecret = req.headers.get("x-cron-secret");
    if (!cronSecret || cronSecret !== CRON_SECRET) {
      console.error("[AUTO-PUSH-CRON] ❌ Invalid cron secret");
      return json({ error: "Unauthorized" }, 401);
    }

    console.log("[AUTO-PUSH-CRON] ✅ Cron authenticated");

    // 2. Load config
    const supabase = createClient(SB_URL, SERVICE_ROLE_KEY);
    const { data: config, error: configError } = await supabase
      .from('auto_push_config')
      .select('*')
      .limit(1)
      .single();

    if (configError || !config) {
      console.error("[AUTO-PUSH-CRON] ❌ Config error:", configError);
      return json({ error: "Config not found" }, 500);
    }

    if (!config.enabled) {
      console.log("[AUTO-PUSH-CRON] ⏸️ Auto-push disabled");
      return json({ ok: true, message: "Auto-push disabled" }, 200);
    }

    // 3. Time check: Quiet hours + Active slots
    const now = new Date();
    const hour = now.getHours();

    // Quiet hours check (21:00-08:59)
    if (hour >= 21 || hour < 9) {
      console.log(`[AUTO-PUSH-CRON] ⏸️ Quiet hours (${hour}:00)`);
      return json({ ok: true, message: "Quiet hours" }, 200);
    }

    // Active slot check
    const inActiveSlot = ACTIVE_SLOTS.some(slot => hour >= slot.start && hour < slot.end);
    if (!inActiveSlot) {
      console.log(`[AUTO-PUSH-CRON] ⏸️ Not in active slot (${hour}:00)`);
      return json({ ok: true, message: "Outside active slots" }, 200);
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Active slot confirmed (${hour}:00)`);

    // 4. Select eligible users (< cap/day)
    const CAP_PER_DAY = config.daily_max || 5;
    const MAX_USERS = 1000; // Global limit per run
    
    const { data: eligibleUsers, error: usersError } = await supabase.rpc('get_eligible_push_users', {
      p_cap: CAP_PER_DAY,
      p_limit: MAX_USERS
    });

    if (usersError) {
      console.error("[AUTO-PUSH-CRON] ❌ Users query error:", usersError);
      // Fallback: manual query
      const { data: users } = await supabase
        .from('profiles')
        .select('id, email')
        .neq('subscription_tier', 'free')
        .limit(MAX_USERS);
      
      if (!users || users.length === 0) {
        console.log("[AUTO-PUSH-CRON] ⏸️ No eligible users");
        return json({ ok: true, message: "No eligible users" }, 200);
      }

      // Filter by cap manually (check auto_push_log)
      const userIds = users.map(u => u.id);
      const { data: logs } = await supabase
        .from('auto_push_log')
        .select('user_id')
        .eq('sent_date', new Date().toISOString().split('T')[0])
        .in('user_id', userIds);

      const logCounts = new Map<string, number>();
      logs?.forEach(log => {
        logCounts.set(log.user_id, (logCounts.get(log.user_id) || 0) + 1);
      });

      const filtered = users.filter(u => (logCounts.get(u.id) || 0) < CAP_PER_DAY);
      if (filtered.length === 0) {
        console.log("[AUTO-PUSH-CRON] ⏸️ All users at cap");
        return json({ ok: true, message: "All users at cap" }, 200);
      }

      // Select random batch (200 users)
      const batchSize = 200;
      const selected = filtered.sort(() => Math.random() - 0.5).slice(0, batchSize);
      const selectedIds = selected.map(u => u.id);

      console.log(`[AUTO-PUSH-CRON] ✅ Selected ${selectedIds.length} eligible users (fallback)`);

      // 5. Pick template (weighted random)
      const { data: templates, error: tplError } = await supabase
        .from('auto_push_templates')
        .select('*')
        .eq('active', true);

      if (tplError || !templates || templates.length === 0) {
        console.error("[AUTO-PUSH-CRON] ❌ No active templates");
        return json({ error: "No templates" }, 500);
      }

      const totalWeight = templates.reduce((sum, t) => sum + (t.weight || 1), 0);
      const random = Math.random() * totalWeight;
      let cumulative = 0;
      let selectedTemplate = templates[0];

      for (const tpl of templates) {
        cumulative += (tpl.weight || 1);
        if (random <= cumulative) {
          selectedTemplate = tpl;
          break;
        }
      }

      console.log(`[AUTO-PUSH-CRON] ✅ Template selected: "${selectedTemplate.title}" (${selectedTemplate.kind})`);

      // 6. Build payload
      const payload = {
        title: selectedTemplate.title,
        body: selectedTemplate.body,
        url: selectedTemplate.url || '/notifications',
        image: selectedTemplate.image_url || undefined,
        extra: { type: 'auto', subType: selectedTemplate.kind }
      };

      // 7. Call webpush-targeted-send
      const targetedResponse = await fetch(`${SB_URL}/functions/v1/webpush-targeted-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_PUSH_TOKEN,
          'apikey': ANON_KEY
        },
        body: JSON.stringify({
          user_ids: selectedIds,
          payload
        })
      });

      const result = await targetedResponse.json();

      if (!targetedResponse.ok || !result.success) {
        console.error("[AUTO-PUSH-CRON] ❌ Targeted send failed:", result);
        return json({ error: "Send failed", details: result }, 500);
      }

      console.log(`[AUTO-PUSH-CRON] ✅ Sent: ${result.sent}/${result.total} (failed: ${result.failed})`);

      // 8. Log each successful send
      const logsToInsert = selectedIds.map(uid => ({
        user_id: uid,
        template_id: selectedTemplate.id,
        delivery: {
          success: true,
          sent: result.sent > 0,
          message: result.message
        }
      }));

      const { error: logError } = await supabase
        .from('auto_push_log')
        .insert(logsToInsert);

      if (logError) {
        console.error("[AUTO-PUSH-CRON] ⚠️ Log insert error:", logError);
      }

      return json({
        ok: true,
        template: selectedTemplate.title,
        users: selectedIds.length,
        sent: result.sent,
        failed: result.failed
      }, 200);
    }

    // If RPC succeeded
    const userIds = (eligibleUsers as any[]).map(u => u.id);
    if (userIds.length === 0) {
      console.log("[AUTO-PUSH-CRON] ⏸️ No eligible users (from RPC)");
      return json({ ok: true, message: "No eligible users" }, 200);
    }

    // Same flow as above (pick template, call targeted, log)
    const { data: templates, error: tplError } = await supabase
      .from('auto_push_templates')
      .select('*')
      .eq('active', true);

    if (tplError || !templates || templates.length === 0) {
      console.error("[AUTO-PUSH-CRON] ❌ No active templates");
      return json({ error: "No templates" }, 500);
    }

    const totalWeight = templates.reduce((sum, t) => sum + (t.weight || 1), 0);
    const random = Math.random() * totalWeight;
    let cumulative = 0;
    let selectedTemplate = templates[0];

    for (const tpl of templates) {
      cumulative += (tpl.weight || 1);
      if (random <= cumulative) {
        selectedTemplate = tpl;
        break;
      }
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Template selected: "${selectedTemplate.title}" (${selectedTemplate.kind})`);

    const payload = {
      title: selectedTemplate.title,
      body: selectedTemplate.body,
      url: selectedTemplate.url || '/notifications',
      image: selectedTemplate.image_url || undefined,
      extra: { type: 'auto', subType: selectedTemplate.kind }
    };

    // Batch user_ids (max 200 per call)
    const BATCH_SIZE = 200;
    const batches: string[][] = [];
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      batches.push(userIds.slice(i, i + BATCH_SIZE));
    }

    let totalSent = 0;
    let totalFailed = 0;

    for (const batch of batches) {
      const targetedResponse = await fetch(`${SB_URL}/functions/v1/webpush-targeted-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_PUSH_TOKEN,
          'apikey': ANON_KEY
        },
        body: JSON.stringify({
          user_ids: batch,
          payload
        })
      });

      const result = await targetedResponse.json();

      if (targetedResponse.ok && result.success) {
        totalSent += result.sent || 0;
        totalFailed += result.failed || 0;

        // Log each user in batch
        const logsToInsert = batch.map(uid => ({
          user_id: uid,
          template_id: selectedTemplate.id,
          delivery: {
            success: true,
            sent: result.sent > 0,
            message: result.message
          }
        }));

        await supabase.from('auto_push_log').insert(logsToInsert);
      } else {
        totalFailed += batch.length;
        console.error(`[AUTO-PUSH-CRON] ❌ Batch failed:`, result);
      }
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Total sent: ${totalSent}, failed: ${totalFailed}`);

    return json({
      ok: true,
      template: selectedTemplate.title,
      users: userIds.length,
      sent: totalSent,
      failed: totalFailed
    }, 200);

  } catch (error: any) {
    console.error("[AUTO-PUSH-CRON] ❌ Internal error:", error);
    return json({ error: "Internal error", details: error.message }, 500);
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
