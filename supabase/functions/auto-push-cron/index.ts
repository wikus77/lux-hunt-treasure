// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * Edge Function: auto-push-cron (SMART TEMPLATES VERSION)
 * - Template intelligenti con segmentazione, condizioni, freq-cap, A/B testing
 * - Rendering variabili dinamiche
 * - Rispetto quiet hours e frequency cap per template
 * - Protetta da x-cron-secret, NO JWT
 */

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

interface Template {
  id: string;
  title: string;
  body: string;
  type: string;
  segment: string;
  condition_sql: string | null;
  freq_cap_user_per_day: number;
  quiet_hours_start: string;
  quiet_hours_end: string;
  deeplink: string;
  data_json: any;
  weight: number;
}

interface UserProfile {
  id: string;
  full_name?: string;
  username?: string;
  agent_code?: string;
  pulse_energy?: number;
  credits?: number;
  subscription_tier?: string;
  city?: string;
  last_active_at?: string;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true || body.dry_run === true;

    // 1. Auth: x-cron-secret
    const cronSecret = req.headers.get("x-cron-secret");
    if (!cronSecret || cronSecret !== CRON_SECRET) {
      console.error("[AUTO-PUSH-CRON] ❌ Invalid cron secret");
      return json({ error: "Unauthorized" }, 401);
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Cron authenticated (dry-run: ${dryRun})`);

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

    if (!config.enabled && !dryRun) {
      console.log("[AUTO-PUSH-CRON] ⏸️ Auto-push disabled");
      return json({ ok: true, message: "Auto-push disabled" }, 200);
    }

    // 3. Time check: Quiet hours (Europe/Rome tz)
    const now = new Date();
    const romeTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
    const hour = romeTime.getHours();

    // Global quiet hours check (21:00-08:59)
    if (hour >= 21 || hour < 9) {
      console.log(`[AUTO-PUSH-CRON] ⏸️ Global quiet hours (${hour}:00 Rome time)`);
      return json({ ok: true, message: "Quiet hours" }, 200);
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Active time confirmed (${hour}:00 Rome time)`);

    // 4. Load active templates (weighted random selection)
    const { data: templates, error: tplError } = await supabase
      .from('auto_push_templates')
      .select('*')
      .eq('enabled', true);

    if (tplError || !templates || templates.length === 0) {
      console.error("[AUTO-PUSH-CRON] ❌ No active templates");
      return json({ error: "No templates" }, 500);
    }

    // 5. Select template (weighted random)
    const totalWeight = templates.reduce((sum: number, t: Template) => sum + (t.weight || 1), 0);
    const random = Math.random() * totalWeight;
    let cumulative = 0;
    let selectedTemplate: Template = templates[0];

    for (const tpl of templates) {
      cumulative += (tpl.weight || 1);
      if (random <= cumulative) {
        selectedTemplate = tpl;
        break;
      }
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Template selected: "${selectedTemplate.title}" (${selectedTemplate.type}, segment: ${selectedTemplate.segment})`);

    // 6. Check template quiet hours
    const templateQuietStart = parseInt(selectedTemplate.quiet_hours_start?.split(':')[0] || '21');
    const templateQuietEnd = parseInt(selectedTemplate.quiet_hours_end?.split(':')[0] || '9');
    
    if (hour >= templateQuietStart || hour < templateQuietEnd) {
      console.log(`[AUTO-PUSH-CRON] ⏸️ Template quiet hours (${hour}:00)`);
      return json({ ok: true, message: "Template quiet hours" }, 200);
    }

    // 7. Build user query based on segment
    let userQuery = supabase
      .from('profiles')
      .select('id, full_name, username, agent_code, pulse_energy, credits, subscription_tier, city, last_active_at');

    // Apply segment filters
    switch (selectedTemplate.segment) {
      case 'active_24h':
        userQuery = userQuery.gte('last_active_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        break;
      case 'inactive_24h':
        userQuery = userQuery.lte('last_active_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        break;
      case 'inactive_7d':
        userQuery = userQuery.lte('last_active_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        break;
      case 'free_tier':
        userQuery = userQuery.in('subscription_tier', ['free', 'Base']);
        break;
      case 'top10':
      case 'lost_rank':
      case 'near_portal':
        // Skip complex segments for now (require joins/custom logic)
        console.log(`[AUTO-PUSH-CRON] ⚠️ Complex segment '${selectedTemplate.segment}' not yet implemented, using 'all'`);
        break;
      case 'all':
      default:
        // No filter
        break;
    }

    userQuery = userQuery.limit(1000);

    const { data: users, error: usersError } = await userQuery;

    if (usersError) {
      console.error("[AUTO-PUSH-CRON] ❌ Users query error:", usersError);
      return json({ error: "Users query failed", details: usersError.message }, 500);
    }

    if (!users || users.length === 0) {
      console.log("[AUTO-PUSH-CRON] ⏸️ No users match segment");
      return json({ ok: true, message: "No users for segment" }, 200);
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Found ${users.length} users matching segment`);

    // 8. Filter by frequency cap (check auto_push_log)
    const today = new Date().toISOString().split('T')[0];
    const { data: logs } = await supabase
      .from('auto_push_log')
      .select('user_id, template_id')
      .eq('sent_date', today)
      .eq('template_id', selectedTemplate.id);

    const logCounts = new Map<string, number>();
    logs?.forEach((log: any) => {
      logCounts.set(log.user_id, (logCounts.get(log.user_id) || 0) + 1);
    });

    const eligibleUsers = users.filter((u: UserProfile) => 
      (logCounts.get(u.id) || 0) < selectedTemplate.freq_cap_user_per_day
    );

    if (eligibleUsers.length === 0) {
      console.log("[AUTO-PUSH-CRON] ⏸️ All users at frequency cap");
      return json({ ok: true, message: "All users at cap" }, 200);
    }

    console.log(`[AUTO-PUSH-CRON] ✅ ${eligibleUsers.length} users eligible (after freq cap)`);

    // 9. Select random batch (max 200)
    const BATCH_SIZE = 200;
    const selectedUsers = eligibleUsers.sort(() => Math.random() - 0.5).slice(0, BATCH_SIZE);

    console.log(`[AUTO-PUSH-CRON] ✅ Selected ${selectedUsers.length} users for push`);

    // 10. Render variables & send
    const logsToInsert: any[] = [];
    let sentCount = 0;
    let skippedCount = 0;

    for (const user of selectedUsers) {
      // Render title/body with variables
      const renderedTitle = renderVariables(selectedTemplate.title, user);
      const renderedBody = renderVariables(selectedTemplate.body, user);

      if (dryRun) {
        logsToInsert.push({
          template_id: selectedTemplate.id,
          user_id: user.id,
          status: 'queued',
          details: {
            dry_run: true,
            title: renderedTitle,
            body: renderedBody,
            deeplink: selectedTemplate.deeplink
          }
        });
        sentCount++;
      } else {
        // Call webpush-send for individual user
        try {
          const pushResponse = await fetch(`${SB_URL}/functions/v1/webpush-targeted-send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ANON_KEY}`,
              'apikey': ANON_KEY
            },
            body: JSON.stringify({
              user_ids: [user.id],
              title: renderedTitle,
              body: renderedBody,
              url: selectedTemplate.deeplink,
              data: {
                ...selectedTemplate.data_json,
                template_id: selectedTemplate.id,
                ctx: 'auto-cron'
              }
            })
          });

          const pushResult = await pushResponse.json();

          if (pushResponse.ok && pushResult.success) {
            logsToInsert.push({
              template_id: selectedTemplate.id,
              user_id: user.id,
              status: 'sent',
              details: {
                title: renderedTitle,
                body: renderedBody,
                deeplink: selectedTemplate.deeplink,
                sent_at: new Date().toISOString()
              }
            });
            sentCount++;
          } else {
            logsToInsert.push({
              template_id: selectedTemplate.id,
              user_id: user.id,
              status: 'error',
              details: {
                error: pushResult.error || 'Unknown error',
                title: renderedTitle,
                body: renderedBody
              }
            });
            skippedCount++;
          }
        } catch (error: any) {
          logsToInsert.push({
            template_id: selectedTemplate.id,
            user_id: user.id,
            status: 'error',
            details: {
              error: error.message,
              title: renderedTitle,
              body: renderedBody
            }
          });
          skippedCount++;
        }
      }
    }

    // 11. Insert logs
    if (logsToInsert.length > 0) {
      const { error: logError } = await supabase
        .from('auto_push_log')
        .insert(logsToInsert);

      if (logError) {
        console.error("[AUTO-PUSH-CRON] ⚠️ Log insert error:", logError);
      }
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Complete: sent=${sentCount}, skipped=${skippedCount}`);

    return json({
      ok: true,
      template: selectedTemplate.title,
      segment: selectedTemplate.segment,
      users_selected: selectedUsers.length,
      sent: sentCount,
      skipped: skippedCount,
      dry_run: dryRun
    }, 200);

  } catch (error: any) {
    console.error("[AUTO-PUSH-CRON] ❌ Internal error:", error);
    return json({ error: "Internal error", details: error.message }, 500);
  }
});

/**
 * Render template variables
 */
function renderVariables(text: string, user: UserProfile): string {
  let result = text;
  
  // Agent info
  result = result.replace(/{agent_name}/g, user.full_name || user.username || 'Agente');
  result = result.replace(/{agent_code}/g, user.agent_code || 'AG-XXXX');
  
  // Stats
  result = result.replace(/{pe_total}/g, String(user.pulse_energy || 0));
  result = result.replace(/{credits}/g, String(user.credits || 0));
  result = result.replace(/{subscription_tier}/g, user.subscription_tier || 'Base');
  result = result.replace(/{city}/g, user.city || 'città');
  
  // Calculated fields (simplified - can be extended)
  const lastActiveHours = user.last_active_at 
    ? Math.floor((Date.now() - new Date(user.last_active_at).getTime()) / (1000 * 60 * 60))
    : 0;
  result = result.replace(/{last_buzz_hours}/g, String(lastActiveHours));
  
  // Placeholder defaults for missing data
  result = result.replace(/{rank}/g, 'Agent');
  result = result.replace(/{missions_count}/g, '0');
  result = result.replace(/{clues_count}/g, '0');
  result = result.replace(/{leaderboard_rank}/g, 'N/A');
  result = result.replace(/{nearby_portals}/g, '0');
  
  return result;
}

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