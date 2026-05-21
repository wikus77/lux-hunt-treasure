// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * Edge Function: auto-push-cron (ENTERPRISE DETERMINISTIC NATIVE CRON)
 * - Candidati da push_tokens iOS/APNs attivi (non random profiles)
 * - Time slot Europe/Rome via Intl (DST-safe)
 * - Osservabilità: skip_reasons, trigger_source, diagnostica JSON
 * - Protetta da x-cron-secret / service role, NO JWT utente
 */

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import webpush from "npm:web-push@3.6.7";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_CONTACT = Deno.env.get("VAPID_CONTACT")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

const CRON_VERSION = '2026-05-20-v17-ENTERPRISE-DETERMINISTIC';
const DEFAULT_CANDIDATE_BATCH = 500;
const ALLOWED_HOURS_ROME = [9, 11, 15, 18] as const;

function maskId(s: string | undefined | null): string {
  if (!s) return 'n/a';
  if (s.length <= 10) return `${s.slice(0, 3)}...`;
  return `${s.slice(0, 6)}...${s.slice(-2)}`;
}

function maskTokenPreview(token: string | null | undefined): string {
  if (!token || token.length < 8) return 'n/a';
  return `${token.slice(0, 8)}...`;
}

/** Europe/Rome wall-clock — DST-safe (no toLocaleString Date parsing). */
function getRomeTimeParts(now = new Date()): {
  hour: number;
  minute: number;
  second: number;
  isoLocal: string;
  dateKey: string;
} {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  const hour = parseInt(get('hour'), 10);
  const minute = parseInt(get('minute'), 10);
  const second = parseInt(get('second'), 10);
  const isoLocal = `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')} Europe/Rome`;
  const dateKey = `${get('year')}-${get('month')}-${get('day')}`;
  return { hour, minute, second, isoLocal, dateKey };
}

function getRomeHourFromIso(iso: string): number {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome',
    hour: 'numeric',
    hour12: false,
  });
  return parseInt(fmt.format(d), 10);
}

function isValidApnsToken(token: string | null | undefined): boolean {
  if (!token) return false;
  return token.length === 64 && /^[0-9a-fA-F]+$/.test(token);
}

interface PushTokenRow {
  user_id: string;
  token: string;
  updated_at?: string | null;
  last_used_at?: string | null;
  created_at?: string | null;
}

function dedupeTokensByUser(rows: PushTokenRow[]): Map<string, PushTokenRow> {
  const map = new Map<string, PushTokenRow>();
  for (const row of rows) {
    if (!row.user_id || !isValidApnsToken(row.token)) continue;
    const prev = map.get(row.user_id);
    const rowTs = new Date(row.last_used_at || row.updated_at || row.created_at || 0).getTime();
    const prevTs = prev
      ? new Date(prev.last_used_at || prev.updated_at || prev.created_at || 0).getTime()
      : -1;
    if (!prev || rowTs >= prevTs) map.set(row.user_id, row);
  }
  return map;
}

function sortUserIdsDeterministic(
  userIds: string[],
  tokenByUser: Map<string, PushTokenRow>
): string[] {
  return [...userIds].sort((a, b) => {
    const ta = tokenByUser.get(a)!;
    const tb = tokenByUser.get(b)!;
    const tsA = new Date(ta.last_used_at || ta.updated_at || ta.created_at || 0).getTime();
    const tsB = new Date(tb.last_used_at || tb.updated_at || tb.created_at || 0).getTime();
    if (tsB !== tsA) return tsB - tsA;
    return a.localeCompare(b);
  });
}

function resolveTriggerSource(
  body: Record<string, unknown>,
  headers: Headers,
  isServiceRole: boolean
): string {
  const fromBody = body.trigger || body.trigger_source;
  if (fromBody) return String(fromBody);
  if (headers.get('x-cron-secret') || headers.get('x-internal-secret')) return 'pg_cron';
  if (isServiceRole) return 'github_or_service_role';
  return 'manual';
}

// ============================================================================
// 🆕 NATIVE PUSH HELPER (2026-01-25)
// Calls send-native-push Edge Function for iOS/Android tokens
// ============================================================================
const NATIVE_BASE_DELAY_MS_MIN = 800;
const NATIVE_BASE_DELAY_MS_MAX = 1500;
const NATIVE_MAX_RETRY_AFTER_MS = 45000;
const NATIVE_MAX_RETRY_PER_USER = 1;
const NATIVE_TOTAL_WAIT_CAP_MS = 55000;
const NATIVE_BATCH_SIZE = 10; // legacy (batch disabled for native)
const NATIVE_SINGLE_DELAY_MS_MIN = 500;
const NATIVE_SINGLE_DELAY_MS_MAX = 1000;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function randBetween(lo: number, hi: number): number {
  return Math.round(lo + Math.random() * (hi - lo));
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

function parseRetryAfterMsFromAny(err: unknown): number | null {
  try {
    const s = typeof err === 'string' ? err : JSON.stringify(err);
    const m = s.match(/retry after\s+(\d+)\s*ms/i);
    if (m?.[1]) return Number(m[1]);
  } catch {
    /* ignore */
  }
  return null;
}

async function sendNativePushForUser(
  userId: string,
  title: string,
  body: string,
  data: Record<string, any>,
  dryRun: boolean
): Promise<{
  sent: number;
  failed: number;
  skipped: boolean;
  rateLimited: boolean;
  retryAfterMs: number | null;
  totalTokens: number;
  unregisteredCleaned: number;
  noTokens: boolean;
  invocationOk: boolean;
  lastErrorPreview?: {
    status?: number;
    reason?: string;
    apns_env?: string;
    topic?: string;
    token_preview?: string;
  };
  errorHint?: string;
}> {
  const ADMIN_PUSH_SECRET = Deno.env.get("ADMIN_PUSH_SECRET");
  const internalServiceRoleKey =
    Deno.env.get('M1_INTERNAL_SERVICE_ROLE_KEY') ||
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
    '';
  
  if (!ADMIN_PUSH_SECRET) {
    console.log(`[AUTO-PUSH-CRON] ⚠️ ADMIN_PUSH_SECRET not set, skipping native push`);
    return { sent: 0, failed: 0, skipped: true, rateLimited: false, retryAfterMs: null, totalTokens: 0, unregisteredCleaned: 0, noTokens: true, invocationOk: true, errorHint: 'missing_admin_push_secret' };
  }

  if (dryRun) {
    console.log(`[AUTO-PUSH-CRON] 📱 DRY RUN: Would send native push to user ${userId.slice(0,8)}...`);
    return { sent: 0, failed: 0, skipped: true, rateLimited: false, retryAfterMs: null, totalTokens: 0, unregisteredCleaned: 0, noTokens: true, invocationOk: true };
  }

  if (!internalServiceRoleKey) {
    console.error(`[AUTO-PUSH-CRON] ❌ Missing internal service role key for internal send-native-push call`);
    return {
      sent: 0,
      failed: 1,
      skipped: false,
      rateLimited: false,
      retryAfterMs: null,
      totalTokens: 0,
      unregisteredCleaned: 0,
      noTokens: false,
      invocationOk: false,
      errorHint: 'missing_internal_service_role_key',
    };
  }

  try {
    console.log(`[AUTO-PUSH-CRON] Native single payload preview: user_id=${userId.slice(0, 8)}..., title="${String(title).slice(0, 32)}", body="${String(body).slice(0, 32)}"`);
    const response = await fetch(`${SB_URL}/functions/v1/send-native-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Edge gateway auth (send-native-push verify_jwt default is true unless overridden).
        'Authorization': `Bearer ${internalServiceRoleKey}`,
        'x-admin-secret': ADMIN_PUSH_SECRET,
      },
      body: JSON.stringify({
        title,
        body,
        data,
        targetUserId: userId,
      }),
    });

    // Handle non-2xx responses (may not be JSON)
    let rawText: string | null = null;
    let result: any = null;
    try {
      rawText = await response.text();
      result = rawText ? JSON.parse(rawText) : null;
    } catch {
      result = rawText;
    }

    if (!response.ok) {
      const sbCode = (result && typeof result === 'object') ? (result.sb_error_code || result.error_code) : undefined;
      const msg = (result && typeof result === 'object') ? (result.msg || result.message || result.error) : (typeof result === 'string' ? result : undefined);
      console.error(`[AUTO-PUSH-CRON] ❌ send-native-push HTTP ${response.status}`, { sb_error_code: sbCode, message: msg });
      return {
        sent: 0,
        failed: 1,
        skipped: false,
        rateLimited: false,
        retryAfterMs: null,
        totalTokens: 0,
        unregisteredCleaned: 0,
        noTokens: false,
        invocationOk: false,
        lastErrorPreview: {
          status: response.status,
          reason: sbCode ? `${sbCode}${msg ? `: ${msg}` : ''}` : msg,
        },
        errorHint: 'send_native_push_http_error',
      };
    }
    
    if (result.success) {
      console.log(`[AUTO-PUSH-CRON] 📱 Native push sent: user=${userId.slice(0,8)}..., sent=${result.sent}, failed=${result.failed}`);
      // Scan per-token results for rate limit hints (APNs 429).
      let rateLimited = false;
      let retryAfterMs: number | null = null;
      let lastErrorPreview: {
        status?: number;
        reason?: string;
        apns_env?: string;
        topic?: string;
        token_preview?: string;
      } | undefined;
      try {
        const hits = Array.isArray(result.results) ? result.results : [];
        for (const r of hits) {
          if (r?.status === 429) {
            rateLimited = true;
            retryAfterMs = Number(r?.retry_after_ms) || parseRetryAfterMsFromAny(r?.error) || retryAfterMs;
          }
          if (!r?.success && !lastErrorPreview) {
            lastErrorPreview = {
              status: typeof r?.status === 'number' ? r.status : undefined,
              reason: r?.error?.reason || r?.error?.Reason || (typeof r?.error === 'string' ? r.error : undefined),
              apns_env: r?.apns_env,
              topic: r?.topic,
              token_preview: r?.token_preview,
            };
          }
        }
      } catch {
        /* ignore */
      }
      const totalTokens = Number(result.total) || 0;
      return {
        sent: result.sent || 0,
        failed: result.failed || 0,
        skipped: totalTokens === 0,
        rateLimited,
        retryAfterMs,
        totalTokens,
        unregisteredCleaned: Number(result.native_unregistered_cleaned) || 0,
        noTokens: totalTokens === 0,
        invocationOk: true,
        lastErrorPreview,
      };
    } else {
      console.log(`[AUTO-PUSH-CRON] ⚠️ Native push failed for user ${userId.slice(0,8)}...: ${result.error || 'unknown'}`);
      const retryAfterMs = parseRetryAfterMsFromAny(result.error);
      const rateLimited = retryAfterMs != null || result?.status === 429;
      return { sent: 0, failed: 1, skipped: false, rateLimited, retryAfterMs, totalTokens: 0, unregisteredCleaned: 0, noTokens: false, invocationOk: false, errorHint: String(result.error || 'unknown') };
    }
  } catch (error: any) {
    console.error(`[AUTO-PUSH-CRON] ❌ Native push error for user ${userId.slice(0,8)}...:`, error.message);
    const retryAfterMs = parseRetryAfterMsFromAny(error?.message) ?? parseRetryAfterMsFromAny(error);
    const rateLimited = retryAfterMs != null;
    return { sent: 0, failed: 1, skipped: false, rateLimited, retryAfterMs, totalTokens: 0, unregisteredCleaned: 0, noTokens: false, invocationOk: false, errorHint: String(error?.message || 'unknown') };
  }
}

async function sendNativePushBatch(
  items: Array<{ targetUserId: string; title: string; body: string; data?: Record<string, any> }>,
  dryRun: boolean
): Promise<{
  ok: boolean;
  sent: number;
  failed: number;
  results: any[];
  rateLimited: boolean;
  retryAfterMs: number | null;
  errorHint?: string;
}> {
  const ADMIN_PUSH_SECRET = Deno.env.get("ADMIN_PUSH_SECRET");
  if (!ADMIN_PUSH_SECRET) {
    console.log(`[AUTO-PUSH-CRON] ⚠️ ADMIN_PUSH_SECRET not set, skipping native push (batch)`);
    return { ok: true, sent: 0, failed: 0, results: [], rateLimited: false, retryAfterMs: null, errorHint: 'missing_admin_push_secret' };
  }
  if (dryRun) {
    console.log(`[AUTO-PUSH-CRON] 📱 DRY RUN: Would send native push batch: items=${items.length}`);
    return { ok: true, sent: 0, failed: 0, results: [], rateLimited: false, retryAfterMs: null };
  }

  try {
    const response = await fetch(`${SB_URL}/functions/v1/send-native-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_PUSH_SECRET,
      },
      body: JSON.stringify({ batch: items }),
    });

    const result = await response.json();
    const results = Array.isArray(result?.results) ? result.results : [];
    let rateLimited = false;
    let retryAfterMs: number | null = null;
    for (const r of results) {
      if (r?.status === 429) {
        rateLimited = true;
        retryAfterMs = Number(r?.retry_after_ms) || parseRetryAfterMsFromAny(r?.error) || retryAfterMs;
      }
    }
    return {
      ok: true,
      sent: Number(result?.sent) || 0,
      failed: Number(result?.failed) || 0,
      results,
      rateLimited,
      retryAfterMs,
    };
  } catch (error: any) {
    console.error(`[AUTO-PUSH-CRON] ❌ Native push batch error:`, error?.message || error);
    const retryAfterMs = parseRetryAfterMsFromAny(error?.message) ?? parseRetryAfterMsFromAny(error);
    const rateLimited = retryAfterMs != null || /rate limit/i.test(String(error?.message || ''));
    return { ok: false, sent: 0, failed: 1, results: [], rateLimited, retryAfterMs, errorHint: String(error?.message || 'unknown') };
  }
}

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
    const targetUserId = body.targetUserId || body.target_user_id;
    const targetAgentCode = body.targetAgentCode || body.target_agent_code;
    const requestedLimit = Number(body.limit);
    const debugSkipReasons = body.debugSkipReasons === true || body.debug_skip_reasons === true;
    const allowMassiveTest = body.allowMassiveTest === true || body.allow_massive_test === true;
    
    // 🆕 FORCE MODE: bypassa time slots (admin-only)
    const forceMode = body.force === true || req.headers.get("x-m1-force") === "1";
    
    // 🆕 RESET LOGS: cancella i log di oggi (admin-only, per debug)
    const resetLogs = body.reset_logs === true || body.resetLogs === true;

    // 🔒 SECURITY: Verify internal secret for cron/trigger calls
    // NOTE: verify_jwt = false in config.toml, so we MUST validate x-cron-secret
    const CRON_SECRET = Deno.env.get("CRON_SECRET") || Deno.env.get("INTERNAL_SECRET");
    const providedSecret = req.headers.get("x-cron-secret") || req.headers.get("x-internal-secret") || body.cron_secret;
    
    // Allow if: secret matches OR if called with service role key
    const authHeader = req.headers.get("authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    // 🔧 FIX 2026-02-06: Multiple auth methods
    let isServiceRole = false;
    if (authHeader && serviceRoleKey) {
      const providedToken = authHeader.replace("Bearer ", "").trim();
      // Compare full token OR first 50 chars (in case of slight differences)
      isServiceRole = providedToken === serviceRoleKey || 
                      providedToken.slice(0, 50) === serviceRoleKey.slice(0, 50);
    }
    
    // 🆕 ADMIN_PUSH_SECRET as alternative auth (same used by send-native-push)
    const adminPushSecret = Deno.env.get("ADMIN_PUSH_SECRET");
    const providedAdminSecret = req.headers.get("x-admin-secret") || body.admin_secret;
    const isAdminPushAuth = adminPushSecret && providedAdminSecret === adminPushSecret;
    
    // 🆕 Accept Authorization header with service_role JWT (verify role claim)
    let isServiceRoleJWT = false;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const payload = JSON.parse(atob(token.split('.')[1]));
        isServiceRoleJWT = payload.role === "service_role";
      } catch { /* ignore parse errors */ }
    }
    
    const isAdminAuth = (CRON_SECRET && providedSecret === CRON_SECRET) || isServiceRole || isAdminPushAuth || isServiceRoleJWT;
    
    // 🔧 2026-01-23: Made auth DETERMINISTIC (removed backwards-compat mode)
    // If CRON_SECRET is not configured, allow all requests (for initial setup)
    // If CRON_SECRET IS configured, require valid secret or service role
    if (CRON_SECRET && !isAdminAuth) {
      console.error("[AUTO-PUSH-CRON] ❌ Invalid cron secret - REJECTED");
      console.error(`[AUTO-PUSH-CRON] 🔍 Debug: CRON_SECRET set=${!!CRON_SECRET}, providedSecret set=${!!providedSecret}, isServiceRole=${isServiceRole}`);
      console.error(`[AUTO-PUSH-CRON] 🔍 Debug: authHeader present=${!!authHeader}, serviceRoleKey present=${!!serviceRoleKey}`);
      if (authHeader && serviceRoleKey) {
        const providedToken = authHeader.replace("Bearer ", "").trim();
        console.error(`[AUTO-PUSH-CRON] 🔍 Debug: token first 20 chars match=${providedToken.slice(0, 20) === serviceRoleKey.slice(0, 20)}`);
      }
      return json({ error: "Unauthorized - invalid cron secret" }, 401);
    }
    
    if (!CRON_SECRET) {
      console.warn("[AUTO-PUSH-CRON] ⚠️ CRON_SECRET not configured - allowing request (SET THIS IN PRODUCTION!)");
    }
    
    // 🔐 FORCE MODE requires admin auth, RESET LOGS allows with bypass flag for debugging
    if (forceMode && !isAdminAuth) {
      console.warn("[AUTO-PUSH-CRON] ❌ Force mode rejected - requires admin auth");
      return json({ error: "Unauthorized - force mode requires admin auth" }, 401);
    }
    
    // Reset logs requires either admin auth OR bypass flag (for debugging)
    if (resetLogs && !isAdminAuth && !bypassQuietHours) {
      console.warn("[AUTO-PUSH-CRON] ❌ Reset logs rejected - requires admin auth or bypass flag");
      return json({ error: "Unauthorized - reset_logs requires admin auth or bypass_quiet_hours" }, 401);
    }
    
    // 🆕 RESET LOGS: cancella i log di oggi per ripartire da zero
    if (resetLogs) {
      const supabaseReset = createClient(SB_URL, SERVICE_ROLE_KEY);
      const today = new Date().toISOString().split('T')[0];
      const { error: resetError, count } = await supabaseReset
        .from('auto_push_log')
        .delete()
        .eq('sent_date', today);
      
      if (resetError) {
        console.error("[AUTO-PUSH-CRON] ❌ Reset logs error:", resetError);
        return json({ error: "Failed to reset logs", details: resetError.message }, 500);
      }
      
      console.log(`[AUTO-PUSH-CRON] 🗑️ Reset complete: deleted logs for ${today}`);
      return json({ ok: true, message: `Logs reset for ${today}`, deleted: count || 'unknown' }, 200);
    }
    
    const runId = `run_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const startTime = Date.now();
    const rome = getRomeTimeParts();
    const hour = rome.hour;
    const allowedHours = [...ALLOWED_HOURS_ROME];
    const inAllowedSlot = allowedHours.includes(hour);
    const skipTimeSlot = forceMode || bypassQuietHours;
    const triggerSource = resolveTriggerSource(body, req.headers, isServiceRole);

    const baseDiagnostics = () => ({
      ok: true,
      run_id: runId,
      version: CRON_VERSION,
      trigger_source: triggerSource,
      dry_run: dryRun,
      force_mode: forceMode,
      config_enabled: null as boolean | null,
      current_rome_hour: hour,
      current_rome_time: rome.isoLocal,
      allowed_hours: allowedHours,
      in_allowed_slot: inAllowedSlot,
      time_slot_bypassed: skipTimeSlot,
      native_push_enabled: !!Deno.env.get('ADMIN_PUSH_SECRET'),
    });

    // 📊 RELIABILITY: Structured logging header
    console.log(`[AUTO-PUSH-CRON] ════════════════════════════════════════════`);
    console.log(`[AUTO-PUSH-CRON] 🆔 Run ID: ${runId}`);
    console.log(`[AUTO-PUSH-CRON] 🔧 VERSION: ${CRON_VERSION}`);
    console.log(`[AUTO-PUSH-CRON] 🕐 Rome: ${rome.isoLocal} (hour=${hour}, in_slot=${inAllowedSlot})`);
    console.log(`[AUTO-PUSH-CRON] 📡 Trigger: ${triggerSource}`);
    console.log(`[AUTO-PUSH-CRON] ✅ Auth: ${isServiceRole ? 'service_role' : providedSecret ? 'cron_secret' : 'no_secret_configured'}`);
    console.log(`[AUTO-PUSH-CRON] ⚙️ Params: dry=${dryRun}, bypass=${bypassQuietHours}, force=${forceMode}, user=${forceUserId || targetUserId || 'native_tokens'}`);
    console.log(`[AUTO-PUSH-CRON] 🔑 VAPID: contact=${!!VAPID_CONTACT}, public=${!!VAPID_PUBLIC_KEY}, private=${!!VAPID_PRIVATE_KEY}`);
    console.log(`[AUTO-PUSH-CRON] ════════════════════════════════════════════`);

    // 2. Load config
    const supabase = createClient(SB_URL, SERVICE_ROLE_KEY);
    const { data: config, error: configError } = await supabase
      .from('auto_push_config')
      .select('*')
      .limit(1)
      .single();

    if (configError || !config) {
      console.error("[AUTO-PUSH-CRON] ❌ Config error:", configError);
      return json({ error: "Config not found", ...baseDiagnostics(), config_enabled: null }, 500);
    }

    if (!config.enabled && !dryRun) {
      console.log("[AUTO-PUSH-CRON] ⏸️ Auto-push disabled");
      return json({
        ...baseDiagnostics(),
        config_enabled: false,
        message: "Auto-push disabled",
        skip_reasons_count: { config_disabled: 1 },
      }, 200);
    }

    // 3. Time slot (Europe/Rome — evaluated on every invocation, DST-safe)
    if (!skipTimeSlot && !inAllowedSlot) {
      console.log(`[AUTO-PUSH-CRON] ⏸️ Not in allowed time slot (${hour}:xx Rome). Allowed: ${allowedHours.join(', ')}`);
      return json({
        ...baseDiagnostics(),
        config_enabled: !!config.enabled,
        message: `Not in time slot. Current: ${hour}:xx Rome, Allowed: ${allowedHours.join(', ')}`,
        sent: 0,
        skipped: 0,
        users_processed: 0,
        skip_reasons_count: { outside_time_slot: 1 },
      }, 200);
    }

    if (forceMode) {
      console.log(`[AUTO-PUSH-CRON] ⚡ FORCE MODE: Time slot bypassed - run_id: ${runId}`);
    } else if (bypassQuietHours) {
      console.log(`[AUTO-PUSH-CRON] ⚡ Time slot check bypassed (bypassQuietHours)`);
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Time check passed (${hour}:xx Rome, force=${forceMode})`);

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

    // 5. Build candidate users — primary source: active iOS APNs push_tokens (deterministic)
    const hasExplicitTarget = !!(targetUserId || targetAgentCode || forceUserId);
    const batchLimit = hasExplicitTarget
      ? (allowMassiveTest
        ? (Number.isFinite(requestedLimit) ? Math.max(1, requestedLimit) : 1)
        : (Number.isFinite(requestedLimit) ? Math.max(1, requestedLimit) : 1))
      : (Number.isFinite(requestedLimit) ? Math.max(1, requestedLimit) : DEFAULT_CANDIDATE_BATCH);

    if (hasExplicitTarget && !allowMassiveTest && Number.isFinite(requestedLimit) && requestedLimit > 1) {
      console.log(`[AUTO-PUSH-CRON] 🛡️ Target mode: capping limit=${batchLimit} (requested ${requestedLimit})`);
    }

    const profileSelect =
      'id, full_name, username, agent_code, pulse_energy, credits, subscription_tier, city, updated_at, preferred_language';

    let totalActiveNativeTokens = 0;
    let uniqueCandidateUsers = 0;
    let usersSelected = 0;
    let users: UserProfile[] = [];
    const tokenByUser = new Map<string, PushTokenRow>();

    // Resolve agent_code → user_id when needed
    let resolvedTargetUserId: string | null = targetUserId || forceUserId || null;
    if (targetAgentCode && !resolvedTargetUserId) {
      const { data: agentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('agent_code', targetAgentCode)
        .limit(1)
        .maybeSingle();
      resolvedTargetUserId = agentProfile?.id ?? null;
    }

    let tokenQuery = supabase
      .from('push_tokens')
      .select('user_id, token, updated_at, last_used_at, created_at, is_active, platform, endpoint_type')
      .eq('is_active', true)
      .eq('platform', 'ios')
      .eq('endpoint_type', 'apns');

    if (resolvedTargetUserId) {
      console.log(`[AUTO-PUSH-CRON] 🎯 Token filter user: ${maskId(resolvedTargetUserId)}`);
      tokenQuery = tokenQuery.eq('user_id', resolvedTargetUserId);
    }

    const { data: tokenRows, error: tokenError } = await tokenQuery;

    if (tokenError) {
      console.error('[AUTO-PUSH-CRON] ❌ push_tokens query error:', tokenError);
      return json({ error: 'push_tokens query failed', details: tokenError.message, ...baseDiagnostics(), config_enabled: !!config.enabled }, 500);
    }

    totalActiveNativeTokens = tokenRows?.length ?? 0;
    const validRows = (tokenRows || []).filter(
      (r: PushTokenRow & { is_active?: boolean }) => isValidApnsToken(r.token)
    );
    const invalidTokenCount = totalActiveNativeTokens - validRows.length;

    for (const [uid, row] of dedupeTokensByUser(validRows)) {
      tokenByUser.set(uid, row);
    }
    uniqueCandidateUsers = tokenByUser.size;

    let candidateUserIds = sortUserIdsDeterministic([...tokenByUser.keys()], tokenByUser);
    candidateUserIds = candidateUserIds.slice(0, batchLimit);
    usersSelected = candidateUserIds.length;

    console.log(
      `[AUTO-PUSH-CRON] 📱 Native tokens: raw=${totalActiveNativeTokens}, valid_deduped=${uniqueCandidateUsers}, selected=${usersSelected}, invalid=${invalidTokenCount}`
    );

    if (candidateUserIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(profileSelect)
        .in('id', candidateUserIds);

      if (profilesError) {
        console.error('[AUTO-PUSH-CRON] ❌ profiles query error:', profilesError);
        return json({ error: 'Profiles query failed', details: profilesError.message, ...baseDiagnostics(), config_enabled: !!config.enabled }, 500);
      }

      const profileMap = new Map((profiles || []).map((p: UserProfile) => [p.id, p]));
      users = candidateUserIds
        .map((id) => profileMap.get(id))
        .filter((p): p is UserProfile => !!p);
    }

    // Explicit target without profile row but with token — minimal profile stub
    if (hasExplicitTarget && users.length === 0 && resolvedTargetUserId && tokenByUser.has(resolvedTargetUserId)) {
      users = [{
        id: resolvedTargetUserId,
        preferred_language: 'it',
      }];
    }

    // Explicit target fallback (webpush-only / missing token) — profile path for tests
    if (hasExplicitTarget && users.length === 0) {
      let fallbackQuery = supabase.from('profiles').select(profileSelect);
      if (forceUserId) fallbackQuery = fallbackQuery.eq('id', forceUserId);
      if (targetUserId) fallbackQuery = fallbackQuery.eq('id', targetUserId);
      if (targetAgentCode) fallbackQuery = fallbackQuery.eq('agent_code', targetAgentCode);
      const { data: fallbackUsers, error: fallbackError } = await fallbackQuery.limit(batchLimit);
      if (fallbackError) {
        return json({ error: 'Users query failed', details: fallbackError.message, ...baseDiagnostics(), config_enabled: !!config.enabled }, 500);
      }
      users = fallbackUsers || [];
      console.log(`[AUTO-PUSH-CRON] ⚠️ Target fallback profiles (no valid native token): ${users.length}`);
    }

    if (!users || users.length === 0) {
      console.log('[AUTO-PUSH-CRON] ⏸️ No users to process');
      return json({
        ...baseDiagnostics(),
        config_enabled: !!config.enabled,
        message: hasExplicitTarget ? 'No users for target' : 'No native token candidates',
        total_active_native_tokens: totalActiveNativeTokens,
        unique_candidate_users: uniqueCandidateUsers,
        users_selected: 0,
        users_processed: 0,
        sent: 0,
        skipped: 0,
        skip_reasons_count: hasExplicitTarget ? { no_token: 1 } : { no_token: uniqueCandidateUsers === 0 ? 1 : 0 },
      }, 200);
    }

    console.log(`[AUTO-PUSH-CRON] ✅ Processing ${users.length} users (deterministic, limit=${batchLimit})`);
    if (hasExplicitTarget) {
      console.log(`[AUTO-PUSH-CRON] 🧪 Target mode: users=${users.length}, has_native_token=${tokenByUser.size > 0}`);
    }

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
      
      // Check time slot from details.sent_at (Europe/Rome, DST-safe)
      const sentAt = log.details?.sent_at;
      if (sentAt) {
        const sentHour = getRomeHourFromIso(sentAt);
        
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
    const logsToInsert: any[] = [];
    let sentCount = 0;
    let skippedCount = 0;
    let nativeAttempted = 0;
    let nativeSentTotal = 0;
    let nativeFailedTotal = 0;
    let nativeSkippedTotal = 0;
    let nativeUnregisteredCleanedTotal = 0;
    let nativeRateLimitedTotal = 0;
    let nativeDeferredRateLimitTotal = 0;
    let nativeLastErrorPreview: any = null;
    const nativeWaitBudgetStartedAt = Date.now();
    let nativeBatches = 0;
    const nativeDeferredUsers: string[] = [];
    const nativePending = new Map<
      string,
      {
        agent_code: string;
        template_id: string;
        userLang: string;
        renderedTitle: string;
        renderedBody: string;
        deeplink: string;
        // webpush
        webpushSent: number;
        webpushFailed: number;
        // native (filled later)
        nativeSent: number;
        nativeFailed: number;
        nativeSkippedNoToken: boolean;
        nativeRateLimited: boolean;
        nativeRetryAfterMs: number | null;
      }
    >();

    let webpushAttempted = 0;
    let webpushSentTotal = 0;
    let webpushFailedTotal = 0;

    const nativeBatchItems: Array<{ targetUserId: string; title: string; body: string; data?: Record<string, any> }> = [];
    const skipReasonsCount: Record<string, number> = {};
    const sampleSkippedUsers: Array<{ who: string; reason: string }> = [];
    const sampleSentUsers: Array<{ who: string; native_sent: number; webpush_sent: number }> = [];
    let eligibleAfterForceCount = 0;
    let nativeCandidatesCount = 0;
    let webpushCandidatesCount = 0;

    const bumpSkip = (reason: string, user: UserProfile): void => {
      skipReasonsCount[reason] = (skipReasonsCount[reason] || 0) + 1;
      if (sampleSkippedUsers.length < 10) {
        const who = `${user.agent_code || 'n/a'} (${maskId(user.id)})`;
        sampleSkippedUsers.push({ who, reason });
      }
    };

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

    // Deterministic order (already sorted via token timestamps; preserve profile order)
    const selectedUsers = users.slice(0, batchLimit);

    // 🔍 DEBUG: Log today's log count
    console.log(`[AUTO-PUSH-CRON] 📊 Today's logs count: ${todayLogs?.length || 0}`);
    console.log(`[AUTO-PUSH-CRON] 📊 Users in notifCount map: ${userNotifCount.size}`);

    for (const user of selectedUsers) {
      if (!tokenByUser.has(user.id) && !dryRun) {
        skippedCount++;
        if (debugSkipReasons) bumpSkip('no_token', user);
        console.log(`[AUTO-PUSH-CRON] ⏭️ ${user.agent_code || maskId(user.id)}: no valid native token`);
        continue;
      }
      // Check daily limit
      const userTodayCount = userNotifCount.get(user.id) || 0;
      
      // 🔍 DEBUG: Log first 3 users for debugging
      if (sentCount + skippedCount < 3) {
        console.log(`[AUTO-PUSH-CRON] 🔍 DEBUG User ${user.agent_code}: todayCount=${userTodayCount}, id=${user.id?.slice(0,8)}...`);
      }
      
      const bypassDailyLimit = hasExplicitTarget && forceMode;
      const bypassSlotLimit = hasExplicitTarget && forceMode;

      if (!bypassDailyLimit && userTodayCount >= MAX_NOTIF_PER_DAY) {
        console.log(`[AUTO-PUSH-CRON] ⏭️ User ${user.agent_code} at daily limit (${userTodayCount}/${MAX_NOTIF_PER_DAY})`);
        skippedCount++;
        if (debugSkipReasons) bumpSkip('daily_limit', user);
        continue;
      }
      
      // Check time slot limit (1 per slot)
      const slotCount = getSlotCount(user.id);
        
      if (!bypassSlotLimit && slotCount >= MAX_NOTIF_PER_SLOT) {
        console.log(`[AUTO-PUSH-CRON] ⏭️ User ${user.agent_code} at ${hour}:00 slot limit (${slotCount}/${MAX_NOTIF_PER_SLOT})`);
        skippedCount++;
        if (debugSkipReasons) bumpSkip('slot_limit', user);
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
        console.log(`[AUTO-PUSH-CRON] ⏭️ SKIP ${user.agent_code}: No templates for segment (userTemplates=${userTemplates.length}, allTemplates=${allTemplates.length})`);
        skippedCount++;
        if (debugSkipReasons) bumpSkip('segment_mismatch', user);
        continue;
      }
      
      // 🔍 DEBUG: If we got here, we should send
      console.log(`[AUTO-PUSH-CRON] ✅ User ${user.agent_code} eligible: templates=${segmentedTemplates.length}, todayCount=${userTodayCount}, slotCount=${slotCount}, lang=${userLang}`);
      eligibleAfterForceCount += 1;

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
        // 🔧 V16 (2026-02-06): NATIVE-FIRST PUSH LOGIC
        // Check BOTH webpush_subscriptions AND push_tokens (native iOS/Android)
        // Send to whichever exists, don't skip user if only one type exists
        let nativeSent = 0;
        let nativeFailed = 0;
        let nativeSkippedNoToken = false;
        let nativeRateLimited = false;
        let nativeRetryAfterMs: number | null = null;
        let webpushSent = 0;
        let webpushFailed = 0;

        try {

          // ════════════════════════════════════════════════════════════════════
          // STEP 1: NATIVE PUSH (SINGLE MODE) — align with Send Test Push pipeline
          // ════════════════════════════════════════════════════════════════════
          nativeAttempted += 1;
          const nativeRes = await sendNativePushForUser(
            user.id,
            renderedTitle,
            renderedBody,
            {
              template_id: selectedTemplate.id,
              deeplink: selectedTemplate.deeplink,
              ctx: 'auto-cron-native',
            },
            dryRun
          );

          nativeSent = nativeRes.sent;
          nativeFailed = nativeRes.failed;
          nativeSkippedNoToken = nativeRes.noTokens === true;
          nativeRateLimited = nativeRes.rateLimited;
          nativeRetryAfterMs = nativeRes.retryAfterMs;

          nativeSentTotal += nativeSent;
          nativeFailedTotal += nativeFailed;
          nativeUnregisteredCleanedTotal += nativeRes.unregisteredCleaned;
          if (nativeSkippedNoToken) nativeSkippedTotal += 1;
          if (nativeRateLimited) nativeRateLimitedTotal += 1;

          if (nativeFailed > 0 && nativeRes.lastErrorPreview) {
            nativeLastErrorPreview = nativeRes.lastErrorPreview;
            console.log(`[AUTO-PUSH-CRON] Native error preview:`, nativeRes.lastErrorPreview);
          }

          // Light pacing between native invocations (dryRun: never wait).
          if (!dryRun) {
            await sleep(randBetween(NATIVE_SINGLE_DELAY_MS_MIN, NATIVE_SINGLE_DELAY_MS_MAX));
          }

          // ════════════════════════════════════════════════════════════════════
          // STEP 2: Also try WEBPUSH (PWA via webpush_subscriptions)
          // ════════════════════════════════════════════════════════════════════
          const { data: userSubs, error: subsError } = await supabase
            .from('webpush_subscriptions')
            .select('endpoint, keys')
            .eq('user_id', user.id)
            .eq('is_active', true);
          
          if (!subsError && userSubs && userSubs.length > 0) {
            webpushCandidatesCount += 1;
            console.log(`[AUTO-PUSH-CRON] 🌐 Found ${userSubs.length} webpush subscription(s) for ${user.agent_code}`);
            
            // Configure VAPID
            webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
            
            const payload = JSON.stringify({
              title: renderedTitle,
              body: renderedBody,
              url: selectedTemplate.deeplink || '/home',
              icon: '/icon-512.png',
              badge: '/icon-192.png',
              tag: `auto_${selectedTemplate.id}`,
              renotify: true,
              data: {
                template_id: selectedTemplate.id,
                lang: userLang,
                ctx: 'auto-cron'
              }
            });
            
            for (const sub of userSubs) {
              try {
                const subscription = {
                  endpoint: sub.endpoint,
                  keys: {
                    p256dh: sub.keys?.p256dh || sub.keys?.['p256dh'],
                    auth: sub.keys?.auth || sub.keys?.['auth']
                  }
                };
                
                if (!subscription.endpoint || !subscription.keys.p256dh || !subscription.keys.auth) {
                  console.warn(`[AUTO-PUSH-CRON] ⚠️ Invalid webpush subscription for ${user.agent_code}`);
                  continue;
                }
                
                await webpush.sendNotification(subscription, payload);
                webpushSent++;
                console.log(`[AUTO-PUSH-CRON] ✅ Webpush sent to ${user.agent_code}`);
              } catch (pushErr: any) {
                webpushFailed++;
                console.error(`[AUTO-PUSH-CRON] ❌ Webpush error for ${user.agent_code}:`, pushErr?.statusCode || pushErr?.message);
                // Mark expired subscriptions as inactive (410 = Gone)
                if (pushErr?.statusCode === 410) {
                  await supabase
                    .from('webpush_subscriptions')
                    .update({ is_active: false })
                    .eq('endpoint', sub.endpoint);
                }
              }
            }
          } else {
            console.log(`[AUTO-PUSH-CRON] ℹ️ No webpush subscriptions for ${user.agent_code} (native-only user)`);
          }

          webpushAttempted += 1;
          webpushSentTotal += webpushSent;
          webpushFailedTotal += webpushFailed;

          nativePending.set(user.id, {
            agent_code: user.agent_code || user.id.slice(0, 8),
            template_id: selectedTemplate.id,
            userLang,
            renderedTitle,
            renderedBody,
            deeplink: selectedTemplate.deeplink,
            webpushSent,
            webpushFailed,
            nativeSent,
            nativeFailed,
            nativeSkippedNoToken,
            nativeRateLimited,
            nativeRetryAfterMs,
          });
          nativeCandidatesCount += 1;
          
        } catch (error: any) {
          // If native already succeeded, do NOT mark this user as skipped/exception.
          // Persist the success so counters and logs remain coherent.
          if (nativeSent > 0) {
            console.warn(
              `[AUTO-PUSH-CRON] ⚠️ Partial failure after native success for ${user.agent_code}: ${error.message}`
            );
            nativePending.set(user.id, {
              agent_code: user.agent_code || user.id.slice(0, 8),
              template_id: selectedTemplate.id,
              userLang,
              renderedTitle,
              renderedBody,
              deeplink: selectedTemplate.deeplink,
              webpushSent,
              webpushFailed,
              nativeSent,
              nativeFailed,
              nativeSkippedNoToken,
              nativeRateLimited,
              nativeRetryAfterMs,
            });
            nativeCandidatesCount += 1;
            continue;
          }
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
          if (debugSkipReasons) bumpSkip('exception', user);
          console.log(`[AUTO-PUSH-CRON] ❌ Exception for ${user.agent_code}: ${error.message}`);
        }
      }
    }

    // 8. Native push batches DISABLED — cron uses single-mode per user (see loop above).

    // 9. Build logs from pending results (SUCCESS if EITHER native OR webpush worked)
    for (const [userId, p] of nativePending.entries()) {
      const totalSent = p.nativeSent + p.webpushSent;
      const totalFailed = p.nativeFailed + p.webpushFailed;

      if (totalSent > 0) {
        logsToInsert.push({
          template_id: p.template_id,
          user_id: userId,
          sent_date: today,
          status: 'sent',
          details: {
            lang: p.userLang,
            title: p.renderedTitle,
            body: p.renderedBody,
            deeplink: p.deeplink,
            sent_at: new Date().toISOString(),
            // Webpush stats
            webpush_sent: p.webpushSent,
            webpush_failed: p.webpushFailed,
            // Native push stats
            native_sent: p.nativeSent,
            native_failed: p.nativeFailed,
            native_skipped_no_token: p.nativeSkippedNoToken,
            native_rate_limited: p.nativeRateLimited,
            native_retry_after_ms: p.nativeRetryAfterMs,
            // Total
            total_sent: totalSent,
            total_failed: totalFailed,
          },
        });
        sentCount++;
        console.log(`[AUTO-PUSH-CRON] ✅ SUCCESS for ${p.agent_code}: native=${p.nativeSent}, webpush=${p.webpushSent}`);
        if (sampleSentUsers.length < 10) {
          sampleSentUsers.push({
            who: `${p.agent_code} (${maskId(userId)})`,
            native_sent: p.nativeSent,
            webpush_sent: p.webpushSent,
          });
        }
      } else if (p.nativeSkippedNoToken && p.webpushSent === 0 && p.webpushFailed === 0) {
        console.log(`[AUTO-PUSH-CRON] ⏭️ No push channels for ${p.agent_code} (no native token, no webpush)`);
        skippedCount++;
      } else {
        logsToInsert.push({
          template_id: p.template_id,
          user_id: userId,
          sent_date: today,
          status: 'error',
          details: {
            error: 'All push channels failed',
            lang: p.userLang,
            title: p.renderedTitle,
            body: p.renderedBody,
            webpush_failed: p.webpushFailed,
            native_failed: p.nativeFailed,
            native_rate_limited: p.nativeRateLimited,
            native_retry_after_ms: p.nativeRetryAfterMs,
          },
        });
        skippedCount++;
      }
    }

    // 10. Insert logs
    if (logsToInsert.length > 0) {
      const { error: logError } = await supabase
        .from('auto_push_log')
        .insert(logsToInsert);

      if (logError) {
        console.error("[AUTO-PUSH-CRON] ⚠️ Log insert error:", logError);
      }
    }

    const durationMs = Date.now() - startTime;
    console.log(`[AUTO-PUSH-CRON] ════════════════════════════════════════════`);
    console.log(`[AUTO-PUSH-CRON] ✅ COMPLETE: run_id=${runId}`);
    console.log(
      `[AUTO-PUSH-CRON] 📊 Stats: sent=${sentCount}, skipped=${skippedCount}, duration=${durationMs}ms, ` +
      `webpush_attempted=${webpushAttempted}, webpush_sent=${webpushSentTotal}, webpush_failed=${webpushFailedTotal}, ` +
      `native_mode=single, native_attempted=${nativeAttempted}, native_sent=${nativeSentTotal}, native_failed=${nativeFailedTotal}, native_unregistered_cleaned=${nativeUnregisteredCleanedTotal}, ` +
      `native_skipped_no_token=${nativeSkippedTotal}, native_rate_limited=${nativeRateLimitedTotal}, native_deferred_rate_limit=${nativeDeferredRateLimitTotal}`
    );
    console.log(`[AUTO-PUSH-CRON] ════════════════════════════════════════════`);

    return json({
      ok: true,
      run_id: runId,
      version: CRON_VERSION,
      trigger_source: triggerSource,
      config_enabled: !!config.enabled,
      current_rome_hour: hour,
      current_rome_time: rome.isoLocal,
      allowed_hours: allowedHours,
      in_allowed_slot: inAllowedSlot,
      time_slot_bypassed: skipTimeSlot,
      total_active_native_tokens: totalActiveNativeTokens,
      unique_candidate_users: uniqueCandidateUsers,
      users_selected: usersSelected,
      users_processed: selectedUsers.length,
      sent: sentCount,
      skipped: skippedCount,
      dry_run: dryRun,
      force_mode: forceMode,
      duration_ms: durationMs,
      selection_mode: 'push_tokens_ios_apns_deterministic',
      batch_limit: batchLimit,
      native_push_enabled: !!Deno.env.get('ADMIN_PUSH_SECRET'),
      native_mode: 'single',
      native_attempted: nativeAttempted,
      native_sent: nativeSentTotal,
      native_failed: nativeFailedTotal,
      native_unregistered_cleaned: nativeUnregisteredCleanedTotal,
      native_skipped_no_token: nativeSkippedTotal,
      native_rate_limited: nativeRateLimitedTotal,
      native_deferred_rate_limit: nativeDeferredRateLimitTotal,
      webpush_attempted: webpushAttempted,
      webpush_sent: webpushSentTotal,
      webpush_failed: webpushFailedTotal,
      deferred_native_users: nativeDeferredUsers,
      native_last_error_preview: nativeLastErrorPreview,
      skip_reasons_count: debugSkipReasons ? skipReasonsCount : (Object.keys(skipReasonsCount).length ? skipReasonsCount : undefined),
      sample_skipped_users: debugSkipReasons ? sampleSkippedUsers : (sampleSkippedUsers.length ? sampleSkippedUsers : undefined),
      sample_sent_users: sampleSentUsers.length ? sampleSentUsers : undefined,
      eligible_after_force_count: debugSkipReasons ? eligibleAfterForceCount : undefined,
      native_candidates_count: debugSkipReasons ? nativeCandidatesCount : nativeCandidatesCount,
      webpush_candidates_count: debugSkipReasons ? webpushCandidatesCount : undefined,
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

// ============================================================================
// PHASE 4 — NATIVE MIRROR PREP (DISABLED BY DEFAULT)
// This abstraction allows sending the same notification payload to:
// - WebPush (PWA) ← currently active
// - APNs (iOS native) ← disabled, for future use
// ============================================================================

/**
 * Unified notification payload structure
 * Used by both WebPush and Native senders
 */
interface UnifiedNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

/**
 * Configuration for native mirror feature
 * Set NATIVE_PUSH_MIRROR_ENABLED=true in Edge Function env to enable
 */
const NATIVE_MIRROR_CONFIG = {
  enabled: Deno.env.get("NATIVE_PUSH_MIRROR_ENABLED") === "true",
  testOnly: true, // Only send to users with test flag
};

/**
 * Native APNs sender stub (DISABLED)
 * Will be implemented when we enable native mirror
 * 
 * @param userId - Target user ID
 * @param payload - Unified notification payload
 * @returns Promise<{ sent: number; failed: number }>
 */
async function sendNativeAPNs(
  _userId: string, 
  _payload: UnifiedNotificationPayload
): Promise<{ sent: number; failed: number }> {
  if (!NATIVE_MIRROR_CONFIG.enabled) {
    // Native mirror is disabled - return immediately
    return { sent: 0, failed: 0 };
  }

  // TODO: Implement when enabling native mirror
  // 1. Query push_tokens table for user's APNs tokens
  // 2. Call send-native-push Edge Function with payload
  // 3. Return results
  
  console.log(`[NATIVE-MIRROR] 🔇 Native mirror is DISABLED (set NATIVE_PUSH_MIRROR_ENABLED=true to enable)`);
  return { sent: 0, failed: 0 };
}

/**
 * Create unified payload from template (for future native mirror)
 */
function createUnifiedPayload(
  title: string,
  body: string,
  templateId: string,
  deeplink?: string,
  lang?: string
): UnifiedNotificationPayload {
  return {
    title,
    body,
    url: deeplink || '/home',
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: `auto_${templateId}`,
    data: {
      template_id: templateId,
      lang: lang || 'it',
      ctx: 'auto-cron',
      timestamp: new Date().toISOString()
    }
  };
}

// Export for potential testing
export { sendNativeAPNs, createUnifiedPayload, UnifiedNotificationPayload, NATIVE_MIRROR_CONFIG };

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
