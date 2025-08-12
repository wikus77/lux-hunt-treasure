import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RedeemRequest { code?: string }

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code }: RedeemRequest = await req.json();
    if (!code) {
      return new Response(JSON.stringify({ ok: false, error: "missing_code" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ ok: false, error: "server_misconfigured" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    // 1) Load QR
    const { data: qr, error: qrErr } = await supabase
      .from("qr_codes")
      .select("code,reward_type,title,is_active")
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (qrErr) {
      console.error("redeem_qr: load error", qrErr);
      return new Response(JSON.stringify({ ok: false, error: "db_error" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    if (!qr) {
      return new Response(JSON.stringify({ ok: false, error: "not_found" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    if (qr.is_active === false) {
      return new Response(JSON.stringify({ ok: false, error: "already_redeemed" }), { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // 2) Mark redeemed (single-use)
    const { error: updErr } = await supabase
      .from("qr_codes")
      .update({ is_active: false })
      .eq("code", qr.code);
    if (updErr) {
      console.error("redeem_qr: update error", updErr);
      return new Response(JSON.stringify({ ok: false, error: "update_failed" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // 3) If custom, append user notification (if user present)
    const { data: authUser } = await supabase.auth.getUser();
    if (qr.reward_type === "custom" && authUser?.user?.id) {
      await supabase
        .from("user_notifications")
        .insert({
          user_id: authUser.user.id,
          type: "generic",
          title: qr.title || "M1SSION™",
          message: "Hai riscattato un reward personalizzato",
          is_read: false,
        });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("redeem_qr: unexpected error", e);
    return new Response(JSON.stringify({ ok: false, error: "unexpected" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
