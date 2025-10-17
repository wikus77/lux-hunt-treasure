import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
const url = Deno.env.get("SUPABASE_URL")!;
const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors() });
    const body = await req.json().catch(() => ({}));
    const code = String((body?.code || "")).trim().toUpperCase();
    if (!code) return json({ status:"error", error:"missing_code" }, 400);
    const sb = createClient(url, anon, { global:{ headers:{ Authorization: req.headers.get("Authorization") ?? "" } }});
    const { data: qr } = await sb.from("qr_codes")
      .select("code,reward_type,reward_value,is_active,expires_at").eq("code", code).maybeSingle();
    const valid = !!qr && qr.is_active !== false && (!qr.expires_at || new Date(qr.expires_at) > new Date());
    if (!valid) return json({ status:"error", error:"invalid_or_inactive_code" }, 400);
    return json({ status:"ok", reward_type: qr!.reward_type || "buzz_credit", reward_value: qr!.reward_value ?? 1 });
  } catch (e) { return json({ status:"error", error:"internal_error", detail:String(e?.message ?? e) }, 500); }
});
function cors(){return {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"}}
function json(p:any,s=200){return new Response(JSON.stringify(p),{status:s,headers:{ "content-type":"application/json", ...cors() }})}