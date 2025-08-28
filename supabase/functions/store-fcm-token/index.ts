import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOW = [
  "https://m1ssion.eu",
  "https://www.m1ssion.eu",
  "http://localhost:3000",
  "http://localhost:5173"
];

serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const cors = {
    "access-control-allow-origin": ALLOW.includes(origin) ? origin : "https://m1ssion.eu",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-allow-methods": "POST, OPTIONS",
    "vary": "origin"
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    // JWT obbligatorio in prod
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing JWT" }), { status: 401, headers: { ...cors, "content-type": "application/json" }});
    }

    const { fid, token } = await req.json();
    if (!fid || !token) {
      return new Response(JSON.stringify({ error: "fid and token required" }), { status: 400, headers: { ...cors, "content-type": "application/json" }});
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } }
    });

    const user = await supabase.auth.getUser();
    if (!user.data.user) return new Response(JSON.stringify({ error: "Invalid JWT" }), { status: 401, headers: { ...cors, "content-type": "application/json" }});

    const ua = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

    const { data, error } = await supabase
      .from("fcm_tokens")
      .upsert({ user_id: user.data.user.id, fid, token, user_agent: ua, ip }, { onConflict: "fid" })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, data }), { headers: { ...cors, "content-type": "application/json" }});
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "content-type": "application/json" }});
  }
});