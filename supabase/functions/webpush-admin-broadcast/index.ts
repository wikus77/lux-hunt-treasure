// supabase/functions/webpush-admin-broadcast/index.ts
import webpush from "npm:web-push";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SubRow = {
  user_id: string;
  token: string;
  device_info: { p256dh?: string; auth?: string; keys?: { p256dh?: string; auth?: string } } | null;
};

const cors = (req: Request, init: ResponseInit = {}, body?: BodyInit) => {
  const origin = req.headers.get("origin") ?? "*";
  const allow = [Deno.env.get("ORIGIN_WEB") ?? "https://m1ssion.eu", Deno.env.get("ORIGIN_APP") ?? "https://lovable.dev"];
  const h = new Headers(init.headers);
  h.set("access-control-allow-origin", allow.includes(origin) ? origin : allow[0]);
  h.set("vary", "origin");
  h.set("access-control-allow-methods", "POST, OPTIONS");
  h.set("access-control-allow-headers", "authorization, apikey, content-type, x-client-info, x-admin-token");
  return new Response(body, { ...init, headers: h });
};

const normalize = (ep: string) =>
  ep.replace(/^https:\/\/fcm\.googleapis\.com\/fcm\/send\//, "https://fcm.googleapis.com/wp/");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return cors(req, { status: 204 });
  try {
    // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
    const auth = req.headers.get("authorization") ?? "";
    const apiKey = req.headers.get("apikey") ?? "";
    const xAdmin = req.headers.get("x-admin-token") ?? "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const SRV = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const ADMIN_TOKEN = Deno.env.get("PUSH_ADMIN_TOKEN") || "";

    if (!bearer && !apiKey && !xAdmin) {
      return cors(req, { status: 401 }, JSON.stringify({ error: "Missing credentials" }));
    }

    let isService = false;
    let uid: string | undefined;

    // Service-role acceptance via Authorization or apikey
    if (bearer && SRV && bearer === SRV) isService = true;
    if (!isService && apiKey && SRV && apiKey === SRV) isService = true;

    // Try decode JWT to detect service_role or extract sub for admin allowlist
    if (!isService && bearer) {
      try {
        const jwtPayload = JSON.parse(atob(bearer.split(".")[1] || "e30="));
        uid = jwtPayload?.sub as string | undefined;
        const role = jwtPayload?.role || jwtPayload?.user_role || jwtPayload?.app_metadata?.role;
        if (role === "service_role") isService = true;
      } catch {
        // ignore decode errors
      }
    }

    // Fallback admin token header
    if (!isService && ADMIN_TOKEN && xAdmin && xAdmin === ADMIN_TOKEN) isService = true;

    // Admin user allowlist
    const admins = (Deno.env.get("ADMIN_USER_IDS") ?? "").split(",").map(s => s.trim()).filter(Boolean);
    const isAdminUser = !!uid && admins.includes(uid);

    if (!(isService || isAdminUser)) {
      return cors(req, { status: 403 }, JSON.stringify({ error: "Forbidden" }));
    }

    const { title, body, url, target } = await req.json();
    if (!title || !body) return cors(req, { status: 400 }, JSON.stringify({ error: "Missing title/body" }));

    const SUPABASE_URL = Deno.env.get("SB_URL") ?? Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
    const PUB = Deno.env.get("VAPID_PUBLIC_KEY")!, PRIV = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const CONTACT = Deno.env.get("VAPID_CONTACT") || "mailto:admin@example.com";
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !PUB || !PRIV) {
      return cors(req, { status: 500 }, JSON.stringify({ error: "Missing server env" }));
    }
    webpush.setVapidDetails(CONTACT, PUB, PRIV);

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    let q = sb.from("fcm_subscriptions").select("user_id, token, device_info").eq("is_active", true).in("platform", ["web","desktop","ios","android"]);
    if (target?.user_ids_csv) {
      const ids = String(target.user_ids_csv).split(",").map((s)=>s.trim()).filter(Boolean);
      if (ids.length) q = q.in("user_id", ids);
    }
    const { data: rows, error } = await q;
    if (error) return cors(req, { status: 500 }, JSON.stringify({ error: error.message }));

    let success = 0, failed = 0, deactivated = 0;
    const details: any[] = [];
    const payload = JSON.stringify({ title, body, data: { url: url || "/" }, icon: "/favicon.ico", badge: "/favicon.ico" });

    for (const r of rows as SubRow[]) {
      const keys = r.device_info?.keys ?? r.device_info ?? {};
      const p256dh = keys?.p256dh; const authk = keys?.auth;
      if (!p256dh || !authk || !r.token) { failed++; continue; }
      const subscription = { endpoint: normalize(r.token), keys: { p256dh, auth: authk } } as any;
      try {
        const res = await webpush.sendNotification(subscription, payload, { TTL: 60 }) as any;
        const code = res?.statusCode ?? 201;
        if (code === 410 || code === 404) {
          await sb.from("fcm_subscriptions").update({ is_active: false }).eq("token", r.token);
          deactivated++; failed++;
        } else if (code >= 200 && code < 300) {
          success++;
        } else {
          failed++;
        }
        details.push({ user_id: r.user_id, code, endpoint: subscription.endpoint.slice(0, 60) + "…" });
      } catch (e: any) {
        const code = e?.statusCode ?? 500;
        if (code === 410 || code === 404) {
          await sb.from("fcm_subscriptions").update({ is_active: false }).eq("token", r.token);
          deactivated++; failed++;
        } else failed++;
        details.push({ user_id: r.user_id, code, endpoint: r.token.slice(0, 60) + "…" });
      }
    }
    return cors(req, { status: 200 }, JSON.stringify({ success, failed, deactivated, total: rows?.length ?? 0, details }));
  } catch (err: any) {
    return cors(req, { status: 500 }, JSON.stringify({ error: err?.message || "server error" }));
  }
});