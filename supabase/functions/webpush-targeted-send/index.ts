// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// webpush-targeted-send: Invio push a user_ids specifici

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webpush from "npm:web-push@3.6.7";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

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
    // Auth: x-admin-token richiesto
    const adminHdr = req.headers.get("x-admin-token")?.trim() || "";
    const ADMIN = Deno.env.get("PUSH_ADMIN_TOKEN")?.trim() || "";
    
    if (!adminHdr || !ADMIN || adminHdr !== ADMIN) {
      console.error("[WEBPUSH-TARGETED] ❌ Invalid or missing admin token");
      return json({ error: "Unauthorized", reason: "invalid_admin_token" }, 401, origin);
    }

    console.log("[WEBPUSH-TARGETED] ✅ Admin authenticated");

    // Parse body
    const body = await req.json().catch(() => ({}));
    let userIds: string[] = [];
    
    // Normalize user_ids (string | string[])
    if (Array.isArray(body.user_ids)) {
      userIds = body.user_ids;
    } else if (typeof body.user_ids === "string") {
      userIds = [body.user_ids];
    } else {
      return json({ error: "Missing or invalid user_ids (expected string or string[])" }, 400, origin);
    }

    // Remove duplicates and validate
    userIds = [...new Set(userIds)].filter(id => id && typeof id === "string");

    if (userIds.length === 0) {
      return json({ error: "No valid user_ids provided" }, 400, origin);
    }

    const payload = body?.payload;
    if (!payload?.title || !payload?.body) {
      return json({ error: "Missing payload.title/body" }, 400, origin);
    }

    // Validate payload fields
    if (payload.title.length > 80) {
      return json({ error: "Title too long (max 80 chars)" }, 400, origin);
    }
    if (payload.body.length > 240) {
      return json({ error: "Body too long (max 240 chars)" }, 400, origin);
    }

    // Service role client
    const url = Deno.env.get("SUPABASE_URL")!;
    const srk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, srk);

    // Get active subscriptions for these user_ids (batch 100)
    const batchSize = 100;
    const batches: string[][] = [];
    for (let i = 0; i < userIds.length; i += batchSize) {
      batches.push(userIds.slice(i, i + batchSize));
    }

    let allSubs: any[] = [];
    
    for (const batch of batches) {
      const { data, error } = await supabase
        .from("webpush_subscriptions")
        .select("endpoint, keys, user_id")
        .eq("is_active", true)
        .in("user_id", batch);

      if (error) {
        console.error("[WEBPUSH-TARGETED] DB error:", error);
        return json({ error: "DB error", details: error.message }, 500, origin);
      }

      if (data) {
        allSubs = allSubs.concat(data);
      }
    }

    const total = allSubs.length;

    if (total === 0) {
      return json({ 
        success: true, 
        total: 0, 
        sent: 0, 
        failed: 0, 
        errors: [],
        message: "No active subscriptions found for provided user_ids" 
      }, 200, origin);
    }

    // Configure VAPID
    webpush.setVapidDetails(
      Deno.env.get("VAPID_CONTACT")!,
      Deno.env.get("VAPID_PUBLIC_KEY")!,
      Deno.env.get("VAPID_PRIVATE_KEY")!
    );

    // Build final payload
    const finalPayload = {
      title: payload.title,
      body: payload.body,
      url: payload.url || "/notifications",
      image: payload.image || undefined,
      extra: payload.extra || {}
    };

    let sent = 0;
    let failed = 0;
    const errors: Array<{ user_id: string; endpoint: string; reason: string }> = [];

    // Send to all subscriptions
    for (const sub of allSubs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(finalPayload)
        );
        sent++;
      } catch (e: any) {
        failed++;
        const reason = e?.statusCode || e?.message || "unknown_error";
        errors.push({
          user_id: sub.user_id,
          endpoint: sub.endpoint.substring(0, 50) + "...",
          reason: String(reason)
        });
        console.error("[WEBPUSH-TARGETED] Send error:", reason, "user:", sub.user_id);
      }
    }

    return json({
      success: true,
      total,
      sent,
      failed,
      errors: errors.slice(0, 5), // Limit to 5 errors
      message: sent > 0 ? "OK" : "All sends failed"
    }, 200, origin);

  } catch (e: any) {
    console.error("[WEBPUSH-TARGETED] Internal error:", e);
    return json({ error: "Internal server error", details: e?.message }, 500, origin);
  }
});

// Helper
function json(obj: unknown, status = 200, origin = "*"): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Content-Type": "application/json",
    },
  });
}
