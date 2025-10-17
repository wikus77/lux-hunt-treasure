// © 2025 Joseph MULÉ – M1SSION™
// webpush-send – Admin Bypass + Unified Auth Fix

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webpush from "npm:web-push@3.6.7";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info, x-admin-token",
      },
    });
  }

  try {
    // ✅ BYPASS ADMIN FIRST - controllare PRIMA di validare JWT
    const adminHdr = req.headers.get("x-admin-token")?.trim() || "";
    const ADMIN = Deno.env.get("PUSH_ADMIN_TOKEN")?.trim() || "";
    
    // Se header admin presente, verificare validità
    if (adminHdr) {
      if (!ADMIN || adminHdr !== ADMIN) {
        console.error("[WEBPUSH-SEND] ❌ Invalid admin token");
        return json({ error: "Unauthorized", reason: "invalid_admin_token" }, 401, origin);
      }
      
      // Token admin valido → BYPASS completo (no Authorization required)
      console.log("[WEBPUSH-SEND] ✅ Admin bypass attivo");
      const url = Deno.env.get("SUPABASE_URL")!;
      const srk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
      const supabase = createClient(url, srk);

      const body = await req.json().catch(() => ({}));
      const payload = body?.payload;
      if (!payload?.title || !payload?.body) {
        return json({ error: "Missing payload.title/body" }, 400, origin);
      }

      const { data: subs, error } = await supabase
        .from("webpush_subscriptions")
        .select("endpoint, keys")
        .eq("is_active", true);

      if (error) {
        console.error("[WEBPUSH-SEND][ADMIN] DB error:", error);
        return json({ error: "DB error", details: error.message }, 500, origin);
      }

      // VAPID
      webpush.setVapidDetails(
        Deno.env.get("VAPID_CONTACT")!,
        Deno.env.get("VAPID_PUBLIC_KEY")!,
        Deno.env.get("VAPID_PRIVATE_KEY")!
      );

      let total = subs?.length || 0;
      let sent = 0, failed = 0;
      if (Array.isArray(subs)) {
        for (const s of subs) {
          try {
            await webpush.sendNotification(s, JSON.stringify(payload));
            sent++;
          } catch (e: any) {
            failed++;
            console.error("[WEBPUSH-SEND][ADMIN] send error:", e?.statusCode || e?.message || e);
          }
        }
      }

      return json({ success: true, mode: "admin", total, sent, failed, message: total ? "OK" : "No active subscriptions found" }, 200, origin);
    }

    // ➜ Flusso JWT normale (user path) - arriva qui solo se NON c'è admin token
    const auth = req.headers.get("Authorization");
    if (!auth) {
      return json({ 
        error: "Unauthorized", 
        reason: "missing_authorization",
        message: "Missing Authorization header. Use x-admin-token for admin bypass or Bearer token for user auth." 
      }, 401, origin);
    }

    const match = auth.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return json({ code: 401, message: "Invalid authorization format" }, 401, origin);
    }
    const token = match[1];

    // Validate JWT
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const userRes = await fetch(`${url}/auth/v1/user`, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "apikey": anonKey
      }
    });

    if (!userRes.ok) {
      return json({ code: 401, message: "Invalid JWT token" }, 401, origin);
    }

    const user = await userRes.json();
    const userId = user?.id;

    if (!userId) {
      return json({ code: 401, message: "User ID not found in token" }, 401, origin);
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const payload = body?.payload;
    const audience = body?.audience || "self";

    if (!payload?.title || !payload?.body) {
      return json({ error: "Missing payload.title/body" }, 400, origin);
    }

    // Get subscriptions based on audience
    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    let query = supabase
      .from("webpush_subscriptions")
      .select("endpoint, keys")
      .eq("is_active", true);

    if (audience === "self") {
      query = query.eq("user_id", userId);
    }

    const { data: subs, error } = await query;

    if (error) {
      console.error("[WEBPUSH-SEND][USER] DB error:", error);
      return json({ error: "DB error", details: error.message }, 500, origin);
    }

    // Configure VAPID
    webpush.setVapidDetails(
      Deno.env.get("VAPID_CONTACT")!,
      Deno.env.get("VAPID_PUBLIC_KEY")!,
      Deno.env.get("VAPID_PRIVATE_KEY")!
    );

    let total = subs?.length || 0;
    let sent = 0, failed = 0;

    if (Array.isArray(subs)) {
      for (const s of subs) {
        try {
          await webpush.sendNotification(s, JSON.stringify(payload));
          sent++;
        } catch (e: any) {
          failed++;
          console.error("[WEBPUSH-SEND][USER] send error:", e?.statusCode || e?.message || e);
        }
      }
    }

    return json({ success: true, mode: "user", total, sent, failed, message: total ? "OK" : "No active subscriptions found" }, 200, origin);

  } catch (e) {
    console.error("[WEBPUSH-SEND] Internal error:", e);
    return json({ error: "Internal server error" }, 500, origin);
  }
});

// helper
function json(obj: unknown, status = 200, origin = "*"): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Content-Type": "application/json",
    },
  });
}
