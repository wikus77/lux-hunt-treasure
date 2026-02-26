// © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
// Phase 4: Email premio fisico marker. From/CC: contact@m1ssion.com. Provider: SMTP (esistente).

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

  try {
    const authHeader = req.headers.get("Authorization")?.trim() || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const secret = Deno.env.get("EMAIL_INVOKE_SECRET")?.trim() || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || "";
    if (!bearer || !secret || bearer !== secret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));
    const user_id = body?.user_id;
    const prize_claim_id = body?.prize_claim_id;
    const email_send_id = body?.email_send_id;

    if (!user_id || !email_send_id) {
      return new Response(JSON.stringify({ error: "missing user_id or email_send_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, service);

    const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !user?.user?.email) {
      await supabase.from("email_sends").update({ status: "failed", error_code: "user_or_email_missing" }).eq("id", email_send_id);
      return new Response(JSON.stringify({ ok: false, reason: "user_or_email_missing" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let claimCode = "";
    let prizeName = "";
    if (prize_claim_id) {
      const { data: row } = await supabase.from("prize_claims").select("claim_code, prize_name").eq("id", prize_claim_id).single();
      if (row) {
        claimCode = row.claim_code || "";
        prizeName = row.prize_name || "Premio fisico";
      }
    }

    const toEmail = user.user.email;
    const subject = "M1SSION™ — Richiesta premio fisico ricevuta";
    const htmlBody = `
<p>Abbiamo ricevuto la tua richiesta di premio fisico.</p>
<p><strong>Riferimento claim:</strong> ${prize_claim_id || "—"}</p>
${claimCode ? `<p><strong>Codice di riscatto:</strong> ${claimCode}</p>` : ""}
<p>Conserva questa email. Ti contatteremo per le istruzioni di consegna.</p>
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

    const textPart = `Richiesta premio fisico ricevuta. Riferimento: ${prize_claim_id || "—"}. ${claimCode ? `Codice: ${claimCode}.` : ""}`;
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
      console.warn("send-marker-prize-email: SMTP error (no PII)", smtpErr instanceof Error ? smtpErr.message : String(smtpErr)?.slice(0, 200));
      if (client) try { await client.close(); } catch (_) {}
      return new Response(JSON.stringify({ ok: false, reason: "smtp_error" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (client) try { await client.close(); } catch (_) {}

    await supabase.from("email_sends").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", email_send_id);
    console.log("send-marker-prize-email: sent (recipient masked)", toEmail ? `${toEmail.slice(0, 2)}***@${toEmail.split("@")[1] || "?"}` : "n/a");
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.warn("send-marker-prize-email: exception", e?.message);
    try {
      const url = Deno.env.get("SUPABASE_URL")!;
      const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(url, service);
      const body = await req.clone().json().catch(() => ({}));
      const email_send_id = body?.email_send_id;
      if (email_send_id) await supabase.from("email_sends").update({ status: "failed", error_code: "exception" }).eq("id", email_send_id);
    } catch (_) {}
    return new Response(JSON.stringify({ ok: false, error: "exception" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
