// supabase/functions/redeem-qr/index.ts
// Robust QR redeem – CORS safe + defaults + non-blocking logs
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin",
  "Content-Type": "application/json",
});

serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "*";
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors(origin) });
  }

  // Auth-bound client (propaga Authorization)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: cors(origin) });

  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return json({ status: "error", error: "unauthorized" }, 401);

    let payload: any = {};
    try { payload = await req.json(); } catch { /* no body */ }
    const code: string = String(payload?.code ?? "").trim().toUpperCase();
    if (!code) return json({ status: "error", error: "missing_code" }, 400);

    // Leggi QR dal backend unificato
    const { data: qr, error: qrErr } = await supabase
      .from("qr_codes")
      .select("code, reward_type, reward_value, is_active, expires_at, title, lat, lng")
      .eq("code", code)
      .maybeSingle();

    if (qrErr) {
      await safeLog(supabase, user.id, code, "error", { where: "select_qr", detail: qrErr.message });
      return json({ status: "error", error: "db_error", detail: qrErr.message }, 500);
    }

    const nowIso = new Date().toISOString();
    const expired = qr?.expires_at && qr.expires_at < nowIso;

    if (!qr || qr.is_active === false || expired) {
      await safeLog(supabase, user.id, code, "invalid_or_inactive_code", { found: !!qr, expired });
      return json({ status: "invalid_or_inactive_code", error: "invalid_or_inactive_code" }, 200);
    }

    // Normalizza reward_type + default sicuri
    const reward_type = normalizeRewardType(qr.reward_type);
    const reward_value = Number.isFinite(qr.reward_value) ? qr.reward_value : 1;

    // Evita duplicati (1 redeem per utente per codice)
    const { data: already } = await supabase
      .from("qr_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("code", code)
      .maybeSingle();

    if (already) {
      await safeLog(supabase, user.id, code, "already_claimed", {});
      return json({ status: "already_claimed" }, 200);
    }

    // Inserisci redemption con campi NON NULL
    const { error: insErr } = await supabase.from("qr_redemptions").insert({
      user_id: user.id,
      code,
      reward_type,
      reward_value,
      redeemed_at: nowIso,
    });

    if (insErr) {
      await safeLog(supabase, user.id, code, "error", { where: "insert_redemption", detail: insErr.message });
      return json({ status: "error", error: "internal_error", detail: insErr.message }, 500);
    }

    // Log NON bloccante
    await safeLog(supabase, user.id, code, "ok", { reward_type, reward_value });

    return json({ status: "ok", reward_type, reward_value }, 200);
  } catch (e) {
    return new Response(JSON.stringify({ status: "error", error: "internal_error", detail: String(e?.message ?? e) }), {
      status: 500,
      headers: cors(origin),
    });
  }
});

function normalizeRewardType(input?: string): string {
  const t = (input || "").toLowerCase();
  if (["buzz", "buzz_credit", "buzz_gratis", "buzz_map_credit"].includes(t)) return "buzz_credit";
  if (["clue", "indizio_segreto"].includes(t)) return "clue";
  if (["enigma", "enigma_misterioso"].includes(t)) return "enigma";
  if (t === "fake") return "fake";
  if (["sorpresa", "sorpresa_speciale", "custom"].includes(t)) return "sorpresa_speciale";
  return "buzz_credit"; // default sicuro
}

async function safeLog(supabase: any, user_id: string, qr_code_id: string, status: string, details: Record<string, unknown>) {
  try {
    await supabase.from("qr_redemption_logs").insert({ user_id, qr_code_id, status, details });
  } catch { /* non bloccare */ }
}