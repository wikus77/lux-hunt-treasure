// supabase/functions/redeem-qr/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, any>;

const url = Deno.env.get("SUPABASE_URL")!;
const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors() });

    const body = await req.json().catch(() => ({}));
    const code = String(body?.code || "").trim().toUpperCase();
    if (!code) return j({ status: "error", error: "missing_code" }, 400);

    // client utente (RLS ON)
    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    // admin per log non bloccanti
    const admin = createClient(url, service);

    // utente corrente
    const { data: auth } = await userClient.auth.getUser();
    const user_id = auth?.user?.id;
    if (!user_id) return j({ status: "error", error: "unauthorized" }, 401);

    // prendi QR
    const { data: qr, error: qrErr } = await userClient
      .from("qr_codes")
      .select("code,reward_type,reward_value,is_active,expires_at")
      .eq("code", code)
      .maybeSingle();

    if (qrErr) return j({ status: "error", error: "db_error", detail: qrErr.message }, 500);
    if (!qr || qr.is_active === false || (qr.expires_at && new Date(qr.expires_at) <= new Date())) {
      await log(admin, { user_id, code, success: false, failure_reason: "invalid_or_inactive_code" });
      return j({ status: "error", error: "invalid_or_inactive_code" }, 400);
    }

    const reward_type = qr.reward_type || "buzz_credit";
    const reward_value = qr.reward_value || "1";

    // già riscattato?
    const { data: already } = await userClient
      .from("qr_redemptions")
      .select("id")
      .eq("user_id", user_id)
      .eq("code", code)
      .maybeSingle();

    if (already) {
      await log(admin, { user_id, code, success: true }); // già ok in passato
      return j({ status: "already_claimed", reward_type, reward_value }, 200);
    }

    // inserisci redemption
    const { error: insErr } = await userClient
      .from("qr_redemptions")
      .insert([{ user_id, code, reward_type, reward_value }]);

    if (insErr) {
      await log(admin, { user_id, code, success: false, failure_reason: insErr.message });
      return j({ status: "error", error: "internal_error", detail: insErr.message }, 500);
    }

    await log(admin, { user_id, code, success: true });
    return j({ status: "ok", reward_type, reward_value }, 200);
  } catch (e: any) {
    return j({ status: "error", error: "internal_error", detail: String(e?.message ?? e) }, 500);
  }
}, { onError: (e) => console.error(e) });

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
function j(payload: Json, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json", ...cors() } });
}
async function log(admin: any, row: { user_id: string; code: string; success: boolean; failure_reason?: string }) {
  try {
    await admin.from("qr_redemption_logs").insert([{
      user_id: row.user_id,
      qr_code: row.code,
      success: row.success,
      failure_reason: row.failure_reason ?? null,
    }]);
  } catch (_) { /* non bloccante */ }
}