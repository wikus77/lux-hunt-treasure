// supabase/functions/redeem-qr/index.ts
// CORS-safe redeem function – supports POST and GET (?c|?code)
// © M1SSION

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set<string>([
  "https://m1ssion.eu",
  "https://www.m1ssion.eu",
  "https://lovable.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "capacitor://localhost",
  "ionic://localhost",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "*";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
  };
}

serve(async (req: Request) => {
  const baseHeaders = corsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: baseHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!; // l'SDK inoltra il JWT utente
    const auth = req.headers.get("Authorization") ?? "";

    const sb = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: auth } },
    });

    const url = new URL(req.url);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const raw =
      String(body?.code ?? url.searchParams.get("code") ?? url.searchParams.get("c") ?? "")
        .trim()
        .toUpperCase();

    if (!raw) {
      return new Response(JSON.stringify({ status: "error", error: "missing_code" }), {
        status: 400,
        headers: baseHeaders,
      });
    }

    // Utente
    const { data: userRes, error: userErr } = await sb.auth.getUser();
    if (userErr || !userRes?.user?.id) {
      return new Response(JSON.stringify({ status: "error", error: "unauthorized" }), {
        status: 401,
        headers: baseHeaders,
      });
    }
    const userId = userRes.user.id;

    // QR
    const { data: qr, error: qrErr } = await sb
      .from("qr_codes")
      .select("code, title, reward_type, reward_value, is_active, expires_at, lat, lng")
      .eq("code", raw)
      .maybeSingle();
    if (qrErr) throw qrErr;

    const nowIso = new Date().toISOString();
    const expired = qr?.expires_at && qr.expires_at <= nowIso;
    if (!qr || qr.is_active === false || expired) {
      return new Response(JSON.stringify({ status: "error", error: "invalid_or_inactive_code" }), {
        status: 404,
        headers: baseHeaders,
      });
    }

    // Redemption (vincolo univoco user_id+code gestisce i doppioni)
    const { error: insErr } = await sb
      .from("qr_redemptions")
      .insert({
        user_id: userId,
        code: qr.code,
        reward_type: qr.reward_type,
        reward_value: qr.reward_value ?? 1,
      })
      .single();

    if (insErr) {
      // 23505 = unique_violation
      if ((insErr as any)?.code === "23505") {
        return new Response(JSON.stringify({ status: "already_redeemed", code: qr.code }), {
          headers: baseHeaders,
        });
      }
      throw insErr;
    }

    // Best-effort: disattiva il QR (non bloccare la risposta in caso di RLS)
    await sb.from("qr_codes").update({ is_active: false }).eq("code", qr.code);

    // Log (best-effort)
    await sb.from("qr_redemption_logs").insert({
      user_id: userId,
      qr_code_id: qr.code,
      reward_type: qr.reward_type,
      meta: { from: "redeem-qr" },
    });

    return new Response(
      JSON.stringify({
        status: "ok",
        code: qr.code,
        reward_type: qr.reward_type,
        reward_value: qr.reward_value ?? 1,
        title: qr.title,
      }),
      { headers: baseHeaders },
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ status: "error", error: "internal_error", detail: String(e?.message ?? e) }),
      { status: 500, headers: baseHeaders },
    );
  }
});