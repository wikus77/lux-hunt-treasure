// supabase/functions/webpush-admin-broadcast/index.ts
import webpush from "npm:web-push";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = (req, init = {}, body)=>{
  const origin = req.headers.get("origin") ?? "*";
  const allow = [
    Deno.env.get("ORIGIN_WEB") ?? "https://m1ssion.eu",
    Deno.env.get("ORIGIN_APP") ?? "https://lovable.dev"
  ];
  const h = new Headers(init.headers);
  h.set("access-control-allow-origin", allow.includes(origin) ? origin : allow[0]);
  h.set("vary", "origin");
  h.set("access-control-allow-methods", "POST, OPTIONS");
<<<<<<< HEAD
  h.set("access-control-allow-headers", "authorization, apikey, content-type, x-client-info");
  return new Response(body, { ...init, headers: h });
};

const normalize = (ep: string) =>
  ep.replace(/^https:\/\/fcm\.googleapis\.com\/fcm\/send\//, "https://fcm.googleapis.com/wp/");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return cors(req, { status: 204 });
  try {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return cors(req, { status: 401 }, JSON.stringify({ error: "Missing bearer" }));

    // verify minimal JWT and pull `sub`
    const jwtPayload = JSON.parse(atob(token.split(".")[1] || "e30="));
    const uid = jwtPayload?.sub as string | undefined;
    const admins = (Deno.env.get("ADMIN_USER_IDS") ?? "").split(",").map(s => s.trim()).filter(Boolean);
    if (!uid || !admins.includes(uid)) return cors(req, { status: 403 }, JSON.stringify({ error: "Forbidden" }));

=======
  h.set("access-control-allow-headers", "authorization, apikey, content-type, x-client-info, x-admin-token");
  return new Response(body, {
    ...init,
    headers: h
  });
};
const normalize = (ep)=>ep.replace(/^https:\/\/fcm\.googleapis\.com\/fcm\/send\//, "https://fcm.googleapis.com/wp/");
const json = (b, s = 200)=>new Response(JSON.stringify(b), {
    status: s,
    headers: {
      'Content-Type': 'application/json'
    }
  });
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return cors(req, {
    status: 204
  });
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') ?? ''
        }
      }
    });
    // 1) Utente autenticato via JWT
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return cors(req, {
      status: 401
    }, JSON.stringify({
      error: 'Unauthorized access'
    }));
    // 2) Deve essere admin (profiles.is_admin) oppure presentare x-admin-token server-side
    const { data: prof } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
    const adminHeader = req.headers.get('x-admin-token');
    const isAdminHeaderOK = !!adminHeader && adminHeader === Deno.env.get('PUSH_ADMIN_TOKEN');
    if (!(prof?.is_admin || isAdminHeaderOK)) {
      return cors(req, {
        status: 401
      }, JSON.stringify({
        error: 'Unauthorized access'
      }));
    }
    // >>> RESTO DELLA LOGICA DI INVIO ESISTENTE <<<
>>>>>>> 18c0d0c8 (Fix: SW copy, functions and vite config for push)
    const { title, body, url, target } = await req.json();
    if (!title || !body) return cors(req, {
      status: 400
    }, JSON.stringify({
      error: "Missing title/body"
    }));
    const SUPABASE_URL = Deno.env.get("SB_URL") ?? Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
    const PUB = Deno.env.get("VAPID_PUBLIC_KEY"), PRIV = Deno.env.get("VAPID_PRIVATE_KEY");
    const CONTACT = Deno.env.get("VAPID_CONTACT") || "mailto:admin@example.com";
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !PUB || !PRIV) {
      return cors(req, {
        status: 500
      }, JSON.stringify({
        error: "Missing server env"
      }));
    }
    webpush.setVapidDetails(CONTACT, PUB, PRIV);
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    let q = sb.from("fcm_subscriptions").select("user_id, token, device_info").eq("is_active", true).in("platform", [
      "web",
      "desktop",
      "ios",
      "android"
    ]);
    if (target?.user_ids_csv) {
      const ids = String(target.user_ids_csv).split(",").map((s)=>s.trim()).filter(Boolean);
      if (ids.length) q = q.in("user_id", ids);
    }
<<<<<<< HEAD
    const { data: rows, error } = await q;
    if (error) return cors(req, { status: 500 }, JSON.stringify({ error: error.message }));

=======
    const { data: rows, error: dbError } = await q;
    if (dbError) return cors(req, {
      status: 500
    }, JSON.stringify({
      error: dbError.message
    }));
>>>>>>> 18c0d0c8 (Fix: SW copy, functions and vite config for push)
    let success = 0, failed = 0, deactivated = 0;
    const details = [];
    const payload = JSON.stringify({
      title,
      body,
      data: {
        url: url || "/"
      },
      icon: "/favicon.ico",
      badge: "/favicon.ico"
    });
    for (const r of rows){
      const keys = r.device_info?.keys ?? r.device_info ?? {};
      const p256dh = keys?.p256dh;
      const authk = keys?.auth;
      if (!p256dh || !authk || !r.token) {
        failed++;
        continue;
      }
      const subscription = {
        endpoint: normalize(r.token),
        keys: {
          p256dh,
          auth: authk
        }
      };
      try {
        const res = await webpush.sendNotification(subscription, payload, {
          TTL: 60
        });
        const code = res?.statusCode ?? 201;
        if (code === 410 || code === 404) {
          await sb.from("fcm_subscriptions").update({
            is_active: false
          }).eq("token", r.token);
          deactivated++;
          failed++;
        } else if (code >= 200 && code < 300) {
          success++;
        } else {
          failed++;
        }
        details.push({
          user_id: r.user_id,
          code,
          endpoint: subscription.endpoint.slice(0, 60) + "…"
        });
      } catch (e) {
        const code = e?.statusCode ?? 500;
        if (code === 410 || code === 404) {
          await sb.from("fcm_subscriptions").update({
            is_active: false
          }).eq("token", r.token);
          deactivated++;
          failed++;
        } else failed++;
        details.push({
          user_id: r.user_id,
          code,
          endpoint: r.token.slice(0, 60) + "…"
        });
      }
    }
    return cors(req, {
      status: 200
    }, JSON.stringify({
      success,
      failed,
      deactivated,
      total: rows?.length ?? 0,
      details
    }));
  } catch (err) {
    return cors(req, {
      status: 500
    }, JSON.stringify({
      error: err?.message || "server error"
    }));
  }
});
