/* supabase/functions/webpush-send/index.ts */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import webpushDefault from "npm:web-push@3.6.7";

type Audience =
  | "all"
  | { user_id: string }
  | { endpoint: string };

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  image?: string;
  badge?: string;
  data?: Record<string, unknown>;
};

type RequestBody = {
  audience: Audience;
  payload: PushPayload;
};

const ALLOWED_ORIGINS = new Set<string>([
  "https://m1ssion.eu",
  "https://m1ssion.pages.dev",
  "https://*.pages.dev",
  "http://localhost:5173",
]);

function cors(req: Request, extra: Record<string, string> = {}) {
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = [...ALLOWED_ORIGINS].some((o) =>
    o.includes("*")
      ? new RegExp("^" + o.replace(".", "\\.").replace("*", ".*") + "$").test(origin)
      : o === origin
  )
    ? origin
    : "https://m1ssion.eu";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, apikey, x-client-info, x-mi-dropper-version, x-admin-token",
    "Vary": "Origin",
    "Content-Type": "application/json",
    ...extra,
  };
}

function json(req: Request, status: number, obj: unknown) {
  return new Response(JSON.stringify(obj), { status, headers: cors(req) });
}

function envOrThrow(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function fetchSubscriptionsByAudience(
  audience: Audience,
  srk: string,
  url: string,
): Promise<Array<{ endpoint: string; keys: { p256dh: string; auth: string } }>> {
  const base = `${url}/rest/v1/webpush_subscriptions`;
  const headers = {
    "apikey": srk,
    "Authorization": `Bearer ${srk}`,
    "Accept": "application/json",
  };

  let q = `${base}?select=endpoint,keys,is_active&is_active=eq.true`;

  if (typeof audience === "object" && "user_id" in audience) {
    q = `${base}?select=endpoint,keys,is_active&is_active=eq.true&user_id=eq.${audience.user_id}`;
  }
  if (typeof audience === "object" && "endpoint" in audience) {
    q = `${base}?select=endpoint,keys,is_active&is_active=eq.true&endpoint=eq.${encodeURIComponent(audience.endpoint)}`;
  }

  const r = await fetch(q, { headers });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`DB fetch subscriptions failed: ${r.status} ${t}`);
  }
  const rows = await r.json();
  return (rows as any[]).map((r) => ({
    endpoint: r.endpoint,
    keys: r.keys,
  }));
}

async function deactivateEndpoint(
  endpoint: string,
  srk: string,
  url: string,
): Promise<void> {
  const base = `${url}/rest/v1/webpush_subscriptions`;
  const headers = {
    "apikey": srk,
    "Authorization": `Bearer ${srk}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };
  // set is_active=false for this endpoint
  const r = await fetch(`${base}?endpoint=eq.${encodeURIComponent(endpoint)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ is_active: false }),
  });
  // best effort; ignore failures
  await r.text().catch(() => {});
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(req) });
  }
  if (req.method !== "POST") {
    return json(req, 405, { error: "method_not_allowed" });
  }

  // --- Read env
  let mode: "admin" | "user" = "user";
  let srk = "";
  let sbUrl = "";
  let vapidPub = "";
  let vapidPriv = "";
  let vapidSub = "";

  try {
    srk = envOrThrow("SUPABASE_SERVICE_ROLE_KEY");
    sbUrl = envOrThrow("SUPABASE_URL");
    vapidPub = envOrThrow("VAPID_PUBLIC_KEY");
    vapidPriv = envOrThrow("VAPID_PRIVATE_KEY");
    vapidSub = Deno.env.get("VAPID_CONTACT") ?? Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@m1ssion.eu";
  } catch (e) {
    return json(req, 500, { error: "missing_env", details: String(e) });
  }

  // --- Admin bypass first
  const adminHeader = req.headers.get("x-admin-token") || "";
  const adminSecret = Deno.env.get("PUSH_ADMIN_TOKEN") || "";
  if (adminHeader && adminSecret && adminHeader === adminSecret) {
    console.log("[WEBPUSH-SEND] ✅ Admin bypass attivo");
    mode = "admin";
  }

  // --- Parse body
  let body: RequestBody | null = null;
  try {
    body = await req.json();
  } catch {
    return json(req, 400, { error: "invalid_json" });
  }
  if (!body?.payload?.title || !body?.payload?.body) {
    return json(req, 400, { error: "missing_payload_title_body" });
  }
  const audience = body.audience ?? "all";
  const payload = body.payload;

  // --- If not admin, require JWT (user path)
  if (mode !== "admin") {
    const auth = req.headers.get("Authorization") || "";
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      return json(req, 401, { error: "unauthorized", reason: "missing_authorization_header" });
    }
    const token = m[1];

    // Validate token via /auth/v1/user
    const r = await fetch(`${sbUrl}/auth/v1/user`, {
      headers: { "Authorization": `Bearer ${token}`, "apikey": srk },
    });
    if (!r.ok) {
      return json(req, 401, { error: "unauthorized", reason: "invalid_jwt" });
    }
  }

  // --- Configure web-push
  try {
    webpushDefault.setVapidDetails(vapidSub, vapidPub, vapidPriv);
  } catch (e) {
    return json(req, 500, { error: "vapid_error", details: String(e) });
  }

  // --- Fetch subscriptions
  let subs: Array<{ endpoint: string; keys: { p256dh: string; auth: string } }> = [];
  try {
    subs = await fetchSubscriptionsByAudience(audience, srk, sbUrl);
  } catch (e) {
    return json(req, 500, { error: "db_fetch_failed", details: String(e) });
  }
  const total = subs.length;
  if (total === 0) {
    return json(req, 200, { success: true, mode, total: 0, sent: 0, failed: 0, message: "No active subscriptions found" });
  }

  // --- Build notification payload (JSON string)
  const notif = {
    title: payload.title,
    body: payload.body,
    data: { url: payload.url, ...(payload.data || {}) },
    icon: payload.icon,
    image: payload.image,
    badge: payload.badge,
  };
  const notifString = JSON.stringify(notif);

  let sent = 0;
  let failed = 0;

  // --- Send sequentially (small audiences). For large audiences, batch/Promise.allSettled.
  for (const s of subs) {
    const subscription = {
      endpoint: s.endpoint,
      keys: { p256dh: s.keys?.p256dh, auth: s.keys?.auth },
    } as any;

    try {
      await webpushDefault.sendNotification(subscription, notifString);
      sent++;
    } catch (err: any) {
      failed++;
      const msg = String(err?.message || err);
      // Deactivate 404/410
      if (msg.includes("410") || msg.includes("404") || msg.toLowerCase().includes("gone")) {
        await deactivateEndpoint(s.endpoint, srk, sbUrl).catch(() => {});
      }
    }
  }

  return json(req, 200, { success: true, mode, total, sent, failed });
});