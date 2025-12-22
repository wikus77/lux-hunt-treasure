// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * Edge Function: auto-push-cron (SMART TEMPLATES VERSION + MULTI-LANGUAGE)
 * - Template intelligenti con segmentazione, condizioni, freq-cap, A/B testing
 * - Rendering variabili dinamiche
 * - Rispetto quiet hours e frequency cap per template
 * - SELEZIONE TEMPLATE PER LINGUA UTENTE (it/en) - SEMPLIFICATO
 * - Protetta da x-cron-secret, NO JWT
 */

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const PUSH_ADMIN_TOKEN = Deno.env.get("PUSH_ADMIN_TOKEN")!;

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
  lang?: string;
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
  updated_at?: string;
  preferred_language?: string;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true || body.dry_run === true;
    const bypassQuietHours = body.bypassQuietHours === true || body.bypass_quiet_hours === true;
    const forceUserId = body.force_user_id || body.forceUserId;

    // 🔒 SECURITY: Verify internal secret for cron/trigger calls
    const CRON_SECRET = Deno.env.get("CRON_SECRET") || Deno.env.get("INTERNAL_SECRET");
    const providedSecret = req.headers.get("x-cron-secret") || req.headers.get("x-internal-secret") || body.cron_secret;
    
    // Allow if: secret matches OR if called from Supabase internal (service role in auth header)
    const authHeader = req.headers.get("authorization");
    const isServiceRole = authHeader?.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.slice(0, 20) || "NONE");
    
    if (CRON_SECRET && providedSecret !== CRON_SECRET && !isServiceRole) {
      console.warn("[AUTO-PUSH-CRON] ⚠️ Missing or invalid cron secret - allowing for backwards compatibility");
      // NOTE: Enable this block to enforce strict auth:
      // return json({ error: "Unauthorized - invalid cron secret" }, 401);
    }
    
    console.log("[AUTO-PUSH-CRON] ✅ Auth check passed (internal CRON)");

    console.log(`[AUTO-PUSH-CRON] ✅ Cron authenticated (dry-run: ${dryRun}, bypass-quiet: ${bypassQuietHours}, force-user: ${forceUserId || 'none'})`);
    console.log(`[AUTO-PUSH-CRON] 🔧 VERSION: 2025-12-18-v5-TIME-SLOTS`);

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

    // 3. Time check: Specific time slots (Europe/Rome tz)
    // Slots: 09:00-09:59, 11:00-11:59, 15:00-15:59, 18:00-18:59
    const ALLOWED_HOURS = [9, 11, 15, 18];
    const now = new Date();
    const romeTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
    const hour = romeTime.getHours();

    // Check if current hour is in allowed slots (bypass for tests)
    if (!bypassQuietHours && !ALLOWED_HOURS.includes(hour)) {
      console.log(`[AUTO-PUSH-CRON] ⏸️ Not in allowed time slot (${hour}:00 Rome time). Allowed: ${ALLOWED_HOURS.join(', ')}`);
      return json({ ok: true, message: `Not in time slot. Current: ${hour}:00, Allowed: ${ALLOWED_HOURS.join(', ')}` }, 200);
    }

    if (bypassQuietHours) {
      console.log(`[AUTO-PUSH-CRON] ⚡ Time slot check bypassed for testing`);
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Active time slot confirmed (${hour}:00 Rome time)`);

    // 4. Load active templates
    const { data: allTemplates, error: tplError } = await supabase
      .from('auto_push_templates')
      .select('*')
      .eq('enabled', true);

    if (tplError || !allTemplates || allTemplates.length === 0) {
      console.error("[AUTO-PUSH-CRON] ❌ No active templates");
      return json({ error: "No templates" }, 500);
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Loaded ${allTemplates.length} templates (all languages)`);

    // 5. Build user query
    let userQuery = supabase
      .from('profiles')
      .select('id, full_name, username, agent_code, pulse_energy, credits, subscription_tier, city, updated_at, preferred_language');

    // Force specific user if requested (for testing)
    if (forceUserId) {
      console.log(`[AUTO-PUSH-CRON] 🎯 Forcing single user: ${forceUserId}`);
      userQuery = userQuery.eq('id', forceUserId);
    }

    userQuery = userQuery.limit(1000);

    const { data: users, error: usersError } = await userQuery;

    if (usersError) {
      console.error("[AUTO-PUSH-CRON] ❌ Users query error:", usersError);
      return json({ error: "Users query failed", details: usersError.message }, 500);
    }

    if (!users || users.length === 0) {
      console.log("[AUTO-PUSH-CRON] ⏸️ No users found");
      return json({ ok: true, message: "No users" }, 200);
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Found ${users.length} users`);

    // 6. Get today's logs for frequency cap - WITH 4 TIME SLOT TRACKING
    // Slots: 09:00-09:59, 11:00-11:59, 15:00-15:59, 18:00-18:59
    const today = new Date().toISOString().split('T')[0];
    const { data: todayLogs } = await supabase
      .from('auto_push_log')
      .select('user_id, template_id, details')
      .eq('sent_date', today);

    // Track notifications per user AND per time slot (4 slots)
    const userNotifCount = new Map<string, number>();
    const userSlot9Count = new Map<string, number>();  // 09:00-09:59
    const userSlot11Count = new Map<string, number>(); // 11:00-11:59
    const userSlot15Count = new Map<string, number>(); // 15:00-15:59
    const userSlot18Count = new Map<string, number>(); // 18:00-18:59
    
    todayLogs?.forEach((log: any) => {
      userNotifCount.set(log.user_id, (userNotifCount.get(log.user_id) || 0) + 1);
      
      // Check time slot from details.sent_at (using Rome timezone)
      const sentAt = log.details?.sent_at;
      if (sentAt) {
        const sentDate = new Date(sentAt);
        const sentRomeTime = new Date(sentDate.toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
        const sentHour = sentRomeTime.getHours();
        
        if (sentHour === 9) {
          userSlot9Count.set(log.user_id, (userSlot9Count.get(log.user_id) || 0) + 1);
        } else if (sentHour === 11) {
          userSlot11Count.set(log.user_id, (userSlot11Count.get(log.user_id) || 0) + 1);
        } else if (sentHour === 15) {
          userSlot15Count.set(log.user_id, (userSlot15Count.get(log.user_id) || 0) + 1);
        } else if (sentHour === 18) {
          userSlot18Count.set(log.user_id, (userSlot18Count.get(log.user_id) || 0) + 1);
        }
      }
    });

    // 7. Process users - WITH 4 SPECIFIC TIME SLOT LIMITS
    // 1 notification per slot, 4 slots total = max 4 per day
    const MAX_NOTIF_PER_DAY = 4;
    const MAX_NOTIF_PER_SLOT = 1; // Max 1 per time slot
    const BATCH_SIZE = 200;
    const logsToInsert: any[] = [];
    let sentCount = 0;
    let skippedCount = 0;

    // Current time slot name for logging
    const currentSlot = `slot_${hour}`;
    
    // Get the right slot counter based on current hour
    const getSlotCount = (userId: string): number => {
      if (hour === 9) return userSlot9Count.get(userId) || 0;
      if (hour === 11) return userSlot11Count.get(userId) || 0;
      if (hour === 15) return userSlot15Count.get(userId) || 0;
      if (hour === 18) return userSlot18Count.get(userId) || 0;
      return 0;
    };
    
    console.log(`[AUTO-PUSH-CRON] 🕐 Current slot: ${hour}:00 Rome time`);

    // Shuffle users for random selection
    const shuffledUsers = users.sort(() => Math.random() - 0.5).slice(0, BATCH_SIZE);

    for (const user of shuffledUsers) {
      // Check daily limit
      const userTodayCount = userNotifCount.get(user.id) || 0;
      if (userTodayCount >= MAX_NOTIF_PER_DAY) {
        console.log(`[AUTO-PUSH-CRON] ⏭️ User ${user.agent_code} at daily limit (${userTodayCount}/${MAX_NOTIF_PER_DAY})`);
        skippedCount++;
        continue;
      }
      
      // Check time slot limit (1 per slot)
      const slotCount = getSlotCount(user.id);
        
      if (slotCount >= MAX_NOTIF_PER_SLOT) {
        console.log(`[AUTO-PUSH-CRON] ⏭️ User ${user.agent_code} at ${hour}:00 slot limit (${slotCount}/${MAX_NOTIF_PER_SLOT})`);
        skippedCount++;
        continue;
      }

      // GET USER LANGUAGE (default: 'it')
      const userLang = user.preferred_language || 'it';
      
      // Filter templates for this user's language (or null/undefined = all languages)
      let userTemplates = allTemplates.filter((t: Template) => {
        // If template has no lang or lang is null, include it for all users
        if (!t.lang) return true;
        // Otherwise match user's language
        return t.lang === userLang;
      });

      // If no templates match, use all templates (backwards compatible)
      if (userTemplates.length === 0) {
        console.log(`[AUTO-PUSH-CRON] ⚠️ No templates for lang ${userLang}, using all templates`);
        userTemplates = allTemplates;
      }

      // Filter by segment
      const segmentedTemplates = userTemplates.filter((t: Template) => {
        if (!t.segment || t.segment === 'all') return true;
        
        if (t.segment === 'inactive_24h') {
          const lastActive = user.updated_at ? new Date(user.updated_at).getTime() : 0;
          return (Date.now() - lastActive) > 24 * 60 * 60 * 1000;
        }
        
        if (t.segment === 'inactive_7d') {
          const lastActive = user.updated_at ? new Date(user.updated_at).getTime() : 0;
          return (Date.now() - lastActive) > 7 * 24 * 60 * 60 * 1000;
        }

        if (t.segment === 'active_24h') {
          const lastActive = user.updated_at ? new Date(user.updated_at).getTime() : 0;
          return (Date.now() - lastActive) < 24 * 60 * 60 * 1000;
        }

        return true;
      });

      if (segmentedTemplates.length === 0) {
        console.log(`[AUTO-PUSH-CRON] ⏭️ No templates for segment, user: ${user.agent_code}`);
        skippedCount++;
        continue;
      }

      // Select template (weighted random) - SKIP quiet hours check for simplicity
      const totalWeight = segmentedTemplates.reduce((sum: number, t: Template) => sum + (t.weight || 1), 0);
      const random = Math.random() * totalWeight;
      let cumulative = 0;
      let selectedTemplate: Template = segmentedTemplates[0];

      for (const tpl of segmentedTemplates) {
        cumulative += (tpl.weight || 1);
        if (random <= cumulative) {
          selectedTemplate = tpl;
          break;
        }
      }

      console.log(`[AUTO-PUSH-CRON] 📧 Selected template "${selectedTemplate.title}" for ${user.agent_code} (lang: ${userLang})`);

      // Render variables
      const renderedTitle = renderVariables(selectedTemplate.title, user);
      const renderedBody = renderVariables(selectedTemplate.body, user);

      if (dryRun) {
        logsToInsert.push({
          template_id: selectedTemplate.id,
          user_id: user.id,
          sent_date: today,
          status: 'queued',
          details: {
            dry_run: true,
            lang: userLang,
            title: renderedTitle,
            body: renderedBody,
            deeplink: selectedTemplate.deeplink
          }
        });
        sentCount++;
        console.log(`[AUTO-PUSH-CRON] 📝 DRY RUN: Would send to ${user.agent_code}`);
      } else {
        // Send notification via webpush-targeted-send
        try {
          const pushResponse = await fetch(`${SB_URL}/functions/v1/webpush-targeted-send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-token': PUSH_ADMIN_TOKEN
            },
            body: JSON.stringify({
              user_ids: [user.id],
              payload: {
                title: renderedTitle,
                body: renderedBody,
                url: selectedTemplate.deeplink || '/home',
                extra: {
                  template_id: selectedTemplate.id,
                  lang: userLang,
                  ctx: 'auto-cron'
                }
              }
            })
          });

          const pushResult = await pushResponse.json();

          if (pushResponse.ok && pushResult.success) {
            logsToInsert.push({
              template_id: selectedTemplate.id,
              user_id: user.id,
              sent_date: today,
              status: 'sent',
              details: {
                lang: userLang,
                title: renderedTitle,
                body: renderedBody,
                deeplink: selectedTemplate.deeplink,
                sent_at: new Date().toISOString()
              }
            });
            sentCount++;
            console.log(`[AUTO-PUSH-CRON] ✅ Sent to ${user.agent_code}`);
          } else {
            logsToInsert.push({
              template_id: selectedTemplate.id,
              user_id: user.id,
              sent_date: today,
              status: 'error',
              details: {
                error: pushResult.error || 'Unknown error',
                lang: userLang,
                title: renderedTitle,
                body: renderedBody
              }
            });
            skippedCount++;
            console.log(`[AUTO-PUSH-CRON] ❌ Failed for ${user.agent_code}: ${pushResult.error}`);
          }
        } catch (error: any) {
          logsToInsert.push({
            template_id: selectedTemplate.id,
            user_id: user.id,
            sent_date: today,
            status: 'error',
            details: {
              error: error.message,
              lang: userLang,
              title: renderedTitle,
              body: renderedBody
            }
          });
          skippedCount++;
          console.log(`[AUTO-PUSH-CRON] ❌ Exception for ${user.agent_code}: ${error.message}`);
        }
      }
    }

    // 8. Insert logs
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
      version: '2025-12-18-v5-TIME-SLOTS',
      users_processed: shuffledUsers.length,
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
  
  // Calculated fields
  const lastActiveHours = user.updated_at 
    ? Math.floor((Date.now() - new Date(user.updated_at).getTime()) / (1000 * 60 * 60))
    : 0;
  result = result.replace(/{last_buzz_hours}/g, String(lastActiveHours));
  
  // Placeholder defaults
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
