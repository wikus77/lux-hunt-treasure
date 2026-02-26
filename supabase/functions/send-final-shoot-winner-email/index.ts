// © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
// Phase 4: Email al vincitore Final Shoot. From/CC: contact@m1ssion.com. Provider: SMTP (esistente).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const FROM_EMAIL = "contact@m1ssion.com";
const FROM_NAME = "M1SSION™";
const CC_EMAIL = "contact@m1ssion.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = Deno.env.get("SUPABASE_URL")?.trim() || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || "";
  if (!url || !serviceKey) {
    return new Response(
      JSON.stringify({ error: "boot_config_missing", message: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const authHeader = req.headers.get("Authorization")?.trim() || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const secret = Deno.env.get("EMAIL_INVOKE_SECRET")?.trim() || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || "";
    if (!bearer || !secret || bearer !== secret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));
    const user_id = body?.user_id;
    const mission_id = body?.mission_id;
    const won_at = body?.won_at;
    const email_send_id = body?.email_send_id;

    if (!user_id || !email_send_id) {
      return new Response(JSON.stringify({ error: "missing user_id or email_send_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(url, serviceKey);

    const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !user?.user?.email) {
      await supabase.from("email_sends").update({ status: "failed", error_code: "user_or_email_missing" }).eq("id", email_send_id);
      return new Response(JSON.stringify({ ok: false, reason: "user_or_email_missing" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const toEmail = user.user.email;
    await supabase.from("email_sends").update({ recipient_email: toEmail }).eq("id", email_send_id);
    const subject = "M1SSION™ — Final Shoot vinto";
    const wonAtStr = won_at ? new Date(won_at).toISOString() : new Date().toISOString();
    const htmlBody = `
<p>Complimenti! Hai vinto il Final Shoot su M1SSION™.</p>
<p><strong>Missione:</strong> ${mission_id || "—"}</p>
<p><strong>Data vincita:</strong> ${wonAtStr}</p>
<p>Conserva questa email come conferma.</p>
<p>— Il team M1SSION™</p>
`;

    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.ionos.it";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465");
    const smtpUser = Deno.env.get("SMTP_USER") || FROM_EMAIL;
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    if (!smtpPassword) {
      await supabase.from("email_sends").update({ status: "failed", error_code: "smtp_not_configured" }).eq("id", email_send_id);
      return new Response(JSON.stringify({ ok: false, reason: "smtp_not_configured" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const textPart = `Final Shoot vinto. Missione: ${mission_id || "—"}. Data: ${wonAtStr}`;
    let client: SMTPClient | null = null;
    try {
      client = new SMTPClient({
        connection: {
          hostname: smtpHost,
          port: smtpPort,
          tls: true,
          auth: { username: smtpUser, password: smtpPassword },
        },
      });
      await client.send({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: toEmail,
        cc: [CC_EMAIL],
        subject,
        content: textPart,
        html: htmlBody,
      });
    } catch (smtpErr: unknown) {
      await supabase.from("email_sends").update({ status: "failed", error_code: "smtp_error", sent_at: new Date().toISOString() }).eq("id", email_send_id);
      console.warn("send-final-shoot-winner-email: SMTP error (no PII)", smtpErr instanceof Error ? smtpErr.message : String(smtpErr)?.slice(0, 200));
      if (client) try { await client.close(); } catch (_) {}
      return new Response(JSON.stringify({ ok: false, reason: "smtp_error" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (client) try { await client.close(); } catch (_) {}

    await supabase.from("email_sends").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", email_send_id);
    console.log("send-final-shoot-winner-email: sent (recipient masked)", toEmail ? `${toEmail.slice(0, 2)}***@${toEmail.split("@")[1] || "?"}` : "n/a");
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.warn("send-final-shoot-winner-email: exception", e?.message);
    try {
      if (url && serviceKey) {
        const supabase = createClient(url, serviceKey);
        const bodyFallback = await req.clone().json().catch(() => ({}));
        const sid = bodyFallback?.email_send_id;
        if (sid) await supabase.from("email_sends").update({ status: "failed", error_code: "exception" }).eq("id", sid);
      }
    } catch (_) {}
    return new Response(JSON.stringify({ ok: false, error: "exception" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
