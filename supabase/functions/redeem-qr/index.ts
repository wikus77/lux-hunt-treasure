// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
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

function withCors(origin: string | null, extra: Record<string, string> = {}) {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "*";
  return {
    ...baseCors,
    "Access-Control-Allow-Origin": allowOrigin,
    ...extra,
  };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: withCors(origin) });
  }

  try {
    const { code } = await req.json().catch(() => ({}));
    if (!code || typeof code !== "string") {
      return Response.json(
        { status: "error", error: "invalid_request", detail: "missing code" },
        { headers: withCors(origin) },
      );
    }

    const upper = code.trim().toUpperCase();

    // Client con JWT utente per ottenere user_id
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: auth } = await userClient.auth.getUser();
    const user_id = auth?.user?.id;

    if (!user_id) {
      return Response.json(
        { status: "error", error: "unauthorized" },
        { headers: withCors(origin) },
      );
    }

    // Service role per bypass RLS nelle operazioni atomiche
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1) Valida codice
    const { data: qc, error: qcErr } = await admin
      .from("qr_codes")
      .select("code,reward_type,reward_value,is_active,expires_at")
      .eq("code", upper)
      .maybeSingle();

    if (qcErr) {
      return Response.json(
        { status: "error", error: "internal_error", detail: qcErr.message },
        { headers: withCors(origin) },
      );
    }

    const nowIso = new Date().toISOString();
    const active =
      qc && qc.is_active === true &&
      (!qc.expires_at || qc.expires_at > nowIso);

    if (!qc || !active) {
      return Response.json(
        { status: "error", error: "invalid_or_inactive_code" },
        { headers: withCors(origin) },
      );
    }

    // 2) doppioni utente
    const { data: already } = await admin
      .from("qr_redemptions")
      .select("user_id,code")
      .eq("user_id", user_id)
      .eq("code", upper)
      .maybeSingle();

    if (already) {
      // Log non-bloccante
      await admin.from("qr_redemption_logs").insert({
        user_id,
        qr_code_id: upper,
        status: "already_redeemed",
        details: { ua: req.headers.get("user-agent") },
      }).catch(() => {});

      return Response.json(
        { status: "already_redeemed", reward_type: qc.reward_type, reward_value: qc.reward_value ?? 1 },
        { headers: withCors(origin) },
      );
    }

    // 3) Inserisci redeem + disattiva codice
    const ins = await admin.from("qr_redemptions").insert({
      user_id,
      code: upper,
    });

    if (ins.error && !ins.error.message.includes("duplicate")) {
      return Response.json(
        { status: "error", error: "internal_error", detail: ins.error.message },
        { headers: withCors(origin) },
      );
    }

    // Disattiva il codice
    const upd = await admin.from("qr_codes")
      .update({ is_active: false })
      .eq("code", upper);

    if (upd.error) {
      // Non bloccare il redeem, ma segnala nel detail
      await admin.from("qr_redemption_logs").insert({
        user_id,
        qr_code_id: upper,
        status: "ok_with_warning",
        details: { warning: "failed_to_deactivate_code", err: upd.error.message },
      }).catch(() => {});
    } else {
      // Log OK
      await admin.from("qr_redemption_logs").insert({
        user_id,
        qr_code_id: upper,
        status: "ok",
        details: { ua: req.headers.get("user-agent") },
      }).catch(() => {});
    }

    return Response.json(
      {
        status: "ok",
        code: upper,
        reward_type: qc.reward_type,
        reward_value: qc.reward_value ?? 1,
      },
      { headers: withCors(origin) },
    );
  } catch (e: any) {
    return Response.json(
      { status: "error", error: "internal_error", detail: String(e?.message ?? e) },
      { headers: withCors(req.headers.get("Origin")) },
    );
  }
});