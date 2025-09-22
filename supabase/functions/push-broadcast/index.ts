// supabase/functions/push-broadcast/index.ts
import webpush from "npm:web-push";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
function cors(req, init = {}, body) {
  const origin = req.headers.get("origin") ?? "*";
  const allow = [
    Deno.env.get("ORIGIN_WEB") ?? "https://m1ssion.eu",
    Deno.env.get("ORIGIN_APP") ?? "https://lovable.dev"
  ];
  const h = new Headers(init.headers);
  h.set("access-control-allow-origin", allow.includes(origin) ? origin : allow[0]);
  h.set("vary", "origin");
  h.set("access-control-allow-methods", "POST, OPTIONS");
  h.set("access-control-allow-headers", "authorization, content-type, x-client-info");
  return new Response(body, {
    ...init,
    headers: h
  });
}
const normalizeEndpoint = (ep)=>{
  // preserva Apple WebPush e altri provider
  if (ep.startsWith("https://web.push.apple.com/")) return ep;
  if (ep.startsWith("https://updates.push.services.mozilla.com/")) return ep;
  // normalizza FCM "fcm/send" -> usa com'è (il nostro sender supporta entrambi)
  if (ep.startsWith("https://fcm.googleapis.com/fcm/send/")) return ep;
  if (ep.startsWith("https://fcm.googleapis.com/wp/")) return ep;
  return ep;
};
async function getAuthedUserIdOrServiceRole(req) {
  const supabaseUrl = Deno.env.get("SB_URL") ?? Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  const srk = Deno.env.get("SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey) return {
    userId: null,
    isServiceRole: false
  };
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const isServiceRole = !!(bearer && srk && bearer === srk); // solo per test da terminale
  const client = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  });
  const { data: userData } = await client.auth.getUser();
  const userId = userData?.user?.id ?? null;
  return {
    userId,
    isServiceRole
  };
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return cors(req, {
    status: 204
  });
  try {
    // ----- AuthZ -----
    const { userId, isServiceRole } = await getAuthedUserIdOrServiceRole(req);
    const allowCsv = (Deno.env.get("ADMIN_USER_IDS") ?? "").trim();
    const allow = allowCsv ? allowCsv.split(",").map((s)=>s.trim()).filter(Boolean) : [];
    const allowed = isServiceRole || userId && allow.includes(userId);
    if (!allowed) {
      return cors(req, {
        status: 403
      }, JSON.stringify({
        error: "Forbidden"
      }));
    }
    // ----- Input -----
    const body = await req.json();
    if (!body?.title || !body?.body) {
      return cors(req, {
        status: 400
      }, JSON.stringify({
        error: "Missing title/body"
      }));
    }
    // ----- VAPID -----
    const pub = Deno.env.get("VAPID_PUBLIC_KEY");
    const priv = Deno.env.get("VAPID_PRIVATE_KEY");
    const contact = Deno.env.get("VAPID_CONTACT") || "mailto:admin@example.com";
    if (!pub || !priv) {
      return cors(req, {
        status: 500
      }, JSON.stringify({
        error: "Missing VAPID keys"
      }));
    }
    webpush.setVapidDetails(contact, pub, priv);
    // ----- DB -----
    const supabaseUrl = Deno.env.get("SB_URL") ?? Deno.env.get("SUPABASE_URL");
    const srk = Deno.env.get("SERVICE_ROLE_KEY");
    const sb = createClient(supabaseUrl, srk);
    let query = sb.from("fcm_subscriptions").select("*").eq("is_active", true);
    if (body.user_ids?.length) {
      query = query.in("user_id", body.user_ids);
    }
    const { data: subs, error } = await query.returns();
    if (error) throw error;
    const requested = subs?.length ?? 0;
    let sent = 0, failed = 0, deactivated = 0;
    // ----- SEND -----
    const icon = body.icon ?? "/favicon.ico";
    const badge = body.badge ?? "/favicon.ico";
    const sendOne = async (s)=>{
      const p256dh = s.device_info?.keys?.p256dh ?? s.device_info?.p256dh;
      const auth = s.device_info?.keys?.auth ?? s.device_info?.auth;
      if (!p256dh || !auth || !s.token) throw new Error("Invalid subscription row");
      const sub = {
        endpoint: normalizeEndpoint(s.token),
        keys: {
          p256dh,
          auth
        }
      };
      const payload = JSON.stringify({
        title: body.title,
        body: body.body,
        data: {
          ...body.data ?? {},
          url: body.url ?? "/"
        },
        icon,
        badge
      });
      try {
        const res = await webpush.sendNotification(sub, payload, {
          TTL: 60
        });
        const code = res?.statusCode ?? 201;
        if (code >= 200 && code < 300) {
          sent++;
        } else {
          failed++;
        }
      } catch (e) {
        const sc = e?.statusCode;
        if (sc === 404 || sc === 410) {
          await sb.from("fcm_subscriptions").update({
            is_active: false
          }).eq("id", s.id);
          deactivated++;
        } else {
          failed++;
        }
      }
    };
    await Promise.all((subs ?? []).map(sendOne));
    return cors(req, {
      status: 200
    }, JSON.stringify({
      success: true,
      requested,
      sent,
      failed,
      deactivated
    }));
  } catch (err) {
    return cors(req, {
      status: 500
    }, JSON.stringify({
      success: false,
      error: {
        message: err?.message ?? "Internal error"
      }
    }));
  }
});
