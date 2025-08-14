// supabase/functions/validate-qr/index.ts
// CORS-safe validation – GET/OPTIONS – returns {ok, valid, ...}

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ORIGINS = new Set<string>([
  "https://m1ssion.eu",
  "https://www.m1ssion.eu",
  "https://lovable.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "capacitor://localhost",
  "ionic://localhost",
]);

function cors(req: Request) {
  const origin = req.headers.get("Origin") ?? "*";
  const allow = ORIGINS.has(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
  };
}

serve(async (req) => {
  const headers = cors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers });

  const url = new URL(req.url);
  const code = String(url.searchParams.get("code") ?? url.searchParams.get("c") ?? "")
    .trim()
    .toUpperCase();

  if (!code) return new Response(JSON.stringify({ ok: false, valid: false, error: "missing_code" }), { headers, status: 400 });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);

  const { data: qc, error } = await sb
    .from("qr_codes")
    .select("code, title, reward_type, reward_value, lat, lng, is_active, status, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (error) return new Response(JSON.stringify({ ok: false, valid: false, error: error.message }), { headers, status: 500 });

  const nowIso = new Date().toISOString();
  const expired = qc?.expires_at && qc.expires_at <= nowIso;

  const valid = Boolean(qc && qc.is_active === true && !expired);
  return new Response(
    JSON.stringify({ ok: true, valid, code, ...(qc ?? {}), source: "qr_codes" }),
    { headers, status: valid ? 200 : 404 },
  );
});