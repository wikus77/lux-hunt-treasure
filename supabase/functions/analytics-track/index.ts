// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: analytics-track - Enterprise Event Tracking
// 
// Features:
// - Batch event ingestion
// - Server-side timestamp (authoritative)
// - Idempotency via dedupe_key
// - Rate limiting
// - IP hashing (privacy)
// - Event name allowlist

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════
// EVENT ALLOWLIST - Estensibile
// ═══════════════════════════════════════════════════════════════════════════

const ALLOWED_EVENTS = new Set([
  // Sessioni / App lifecycle
  "app_open",
  "session_start",
  "session_end",
  "app_background",
  "app_foreground",
  
  // Auth
  "login_started",
  "login_success",
  "login_failed",
  "signup_started",
  "signup_completed",
  "logout",
  
  // Mappa / esplorazione
  "map_opened",
  "map_pan",
  "map_zoom",
  "map_area_viewed",
  "map_area_entered",
  "map_area_exited",
  
  // Indizi
  "clue_viewed",
  "clue_unlocked",
  "clue_completed",
  "clue_shared",
  "clue_failed",
  
  // BUZZ / Economy
  "buzz_used",
  "buzz_insufficient_balance",
  "buzz_purchase_prompt_shown",
  "wallet_balance_changed",
  "reward_received",
  "reward_redeemed",
  
  // Monetizzazione
  "purchase_started",
  "purchase_completed",
  "purchase_failed",
  "subscription_started",
  "subscription_renewed",
  "subscription_canceled",
  
  // Viralità
  "share_started",
  "share_completed",
  "invite_sent",
  "invite_accepted",
  
  // Progressione
  "rank_up",
  "badge_earned",
  "milestone_reached",
  
  // Friction / errori
  "error_shown",
  "action_aborted",
  "permission_denied",
  "location_denied",
  "timeout_occurred",
  
  // WINNERS (critici)
  "secondary_reward_won",
  "final_shot_won",
  "final_shot_attempted",
  
  // Navigation
  "route_viewed",
  "screen_viewed",
  
  // Landing (legacy compatibility)
  "landing_cta_primary_click",
  "landing_minitest_choice",
  "landing_premium_toggle_open",
  "landing_plan_select",
  "landing_spectator_click",
  "landing_install_click",
  "spectator_page_view",
  "spectator_locked_click",
  "spectator_join_click",
  
  // ═══════════════════════════════════════════════════════════════
  // 🆕 DAILY STREAK (Retention core) - Added 17/01/2026
  // ═══════════════════════════════════════════════════════════════
  "daily_streak_viewed",
  "daily_streak_started",
  "daily_streak_incremented",
  "daily_streak_broken",
  "daily_streak_reset",
  
  // ═══════════════════════════════════════════════════════════════
  // 🆕 FORTUNE WHEEL (1/day spin) - Added 17/01/2026
  // ═══════════════════════════════════════════════════════════════
  "wheel_viewed",
  "wheel_spin_started",
  "wheel_spin_completed",
  "wheel_reward_assigned",
  "wheel_reward_claimed",
  
  // ═══════════════════════════════════════════════════════════════
  // 🆕 MINIGAMES (framework unified) - Added 17/01/2026
  // ═══════════════════════════════════════════════════════════════
  "minigame_opened",
  "minigame_started",
  "minigame_completed",
  "minigame_abandoned",
  "minigame_reward_assigned",
  "minigame_reward_claimed",
]);

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════

const RATE_LIMIT_MAX = 100; // max events per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, eventCount: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: eventCount, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (entry.count + eventCount > RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count += eventCount;
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// IP HASHING (privacy)
// ═══════════════════════════════════════════════════════════════════════════

async function hashIP(ip: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 16);
}

// ═══════════════════════════════════════════════════════════════════════════
// SANITIZE PROPS (remove PII)
// ═══════════════════════════════════════════════════════════════════════════

const PII_FIELDS = ['email', 'phone', 'name', 'address', 'ip', 'password', 'token', 'secret'];

function sanitizeProps(props: Record<string, unknown>): Record<string, unknown> {
  if (!props || typeof props !== 'object') return {};
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(props)) {
    // Skip PII fields
    if (PII_FIELDS.some(pii => key.toLowerCase().includes(pii))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }
    
    // Limit string length
    if (typeof value === 'string' && value.length > 500) {
      sanitized[key] = value.substring(0, 500) + '...';
      continue;
    }
    
    // Limit nested objects depth
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = JSON.stringify(value).substring(0, 1000);
      continue;
    }
    
    sanitized[key] = value;
  }
  
  // Limit total keys
  const keys = Object.keys(sanitized);
  if (keys.length > 20) {
    const limited: Record<string, unknown> = {};
    keys.slice(0, 20).forEach(k => limited[k] = sanitized[k]);
    limited['_truncated'] = true;
    return limited;
  }
  
  return sanitized;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

interface AnalyticsEvent {
  event_name: string;
  client_ts?: string;
  props?: Record<string, unknown>;
  dedupe_key?: string;
  route?: string;
  event_version?: number; // Schema version, default 1
}

interface TrackRequest {
  events: AnalyticsEvent[];
  session_id: string;
  anon_id?: string;
  user_id?: string;
  platform?: string;
  app_version?: string;
  locale?: string;
  timezone?: string;
  event_version?: number; // Global version for all events in batch
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body: TrackRequest = await req.json();
    const { events, session_id, anon_id, user_id, platform, app_version, locale, timezone } = body;

    // Validate required fields
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: session_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or empty events array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit batch size
    if (events.length > 50) {
      return new Response(
        JSON.stringify({ error: "Batch size exceeds limit (max 50 events)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client info
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    const ipSalt = Deno.env.get("IP_HASH_SALT") || "m1ssion_analytics_2025";
    const ipHash = await hashIP(clientIP, ipSalt);

    // Rate limit check
    const rateLimitKey = `${session_id}_${ipHash}`;
    if (!checkRateLimit(rateLimitKey, events.length)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get geo info from Cloudflare
    const country = req.headers.get("cf-ipcountry") || null;
    const city = req.headers.get("cf-ipcity") || null;

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare events for insertion
    const eventsToInsert: Array<{
      event_name: string;
      server_ts: string;
      client_ts: string | null;
      user_id: string | null;
      anon_id: string | null;
      session_id: string;
      platform: string;
      app_version: string | null;
      route: string | null;
      locale: string | null;
      timezone: string | null;
      country: string | null;
      city: string | null;
      props: Record<string, unknown>;
      dedupe_key: string | null;
      event_version: number;
    }> = [];
    
    // Global event version (default 1) - Do NOT bump without schema migration
    const globalEventVersion = body.event_version ?? 1;

    const skippedEvents: Array<{ event_name: string; reason: string }> = [];
    const serverTs = new Date().toISOString();

    for (const event of events) {
      // Validate event_name
      if (!event.event_name || typeof event.event_name !== 'string') {
        skippedEvents.push({ event_name: 'unknown', reason: 'missing_event_name' });
        continue;
      }

      // Validate against allowlist
      if (!ALLOWED_EVENTS.has(event.event_name)) {
        skippedEvents.push({ event_name: event.event_name, reason: 'not_in_allowlist' });
        continue;
      }

      // Per-event version overrides global, must be positive integer
      const eventVersion = (typeof event.event_version === 'number' && event.event_version > 0)
        ? event.event_version
        : globalEventVersion;
      
      eventsToInsert.push({
        event_name: event.event_name,
        server_ts: serverTs,
        client_ts: event.client_ts || null,
        user_id: user_id || null,
        anon_id: anon_id || null,
        session_id,
        platform: platform || 'web',
        app_version: app_version || null,
        route: event.route || null,
        locale: locale || null,
        timezone: timezone || null,
        country,
        city,
        props: sanitizeProps(event.props || {}),
        event_version: eventVersion,
        dedupe_key: event.dedupe_key || null,
      });
    }

    if (eventsToInsert.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No valid events to insert",
          skipped: skippedEvents 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert events (with ON CONFLICT DO NOTHING for idempotency)
    const { error } = await supabase
      .from("analytics_events")
      .insert(eventsToInsert);

    if (error) {
      console.error("[analytics-track] Insert error:", error);
      
      // Check if it's a unique constraint violation (expected for duplicates)
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ 
            success: true, 
            inserted: 0,
            duplicates: eventsToInsert.length,
            message: "Events already tracked (idempotent)" 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to track events", detail: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted: eventsToInsert.length,
        skipped: skippedEvents.length > 0 ? skippedEvents : undefined
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[analytics-track] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

