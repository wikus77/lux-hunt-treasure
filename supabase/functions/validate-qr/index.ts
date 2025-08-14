// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ALLOWED_ORIGINS = new Set([
  "https://m1ssion.eu",
  "https://www.m1ssion.eu",
  "https://lovable.dev",
  "http://localhost:5173",
  "http://localhost:5174",
]);

const baseCors = {
  "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function withCors(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "*";
  return { ...baseCors, "Access-Control-Allow-Origin": allowOrigin };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: withCors(origin) });

  try {
    const url = new URL(req.url);
    const raw = url.searchParams.get("c") ?? url.searchParams.get("code");
    const code = (raw ?? "").trim().toUpperCase();

    if (!code) {
      return Response.json({ ok: false, valid: false, error: "missing_code" }, { headers: withCors(origin) });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: qc, error } = await admin
      .from("qr_codes")
      .select("code,title,reward_type,reward_value,lat,lng,is_active")
      .eq("code", code)
      .maybeSingle();

    if (error || !qc) {
      return Response.json({ ok: true, valid: false, source: "qr_codes" }, { headers: withCors(origin) });
    }

    return Response.json({
      ok: true,
      valid: qc.is_active === true,
      code: qc.code,
      title: qc.title,
      reward_type: qc.reward_type,
      reward_value: qc.reward_value ?? 1,
      lat: qc.lat,
      lng: qc.lng,
      is_active: qc.is_active,
      status: qc.is_active ? "ACTIVE" : "USED",
      source: "qr_codes",
    }, { headers: withCors(origin) });

  } catch (e: any) {
    return Response.json({ ok: false, valid: false, error: "internal_error", detail: String(e?.message ?? e) }, { headers: withCors(origin) });
  }
});