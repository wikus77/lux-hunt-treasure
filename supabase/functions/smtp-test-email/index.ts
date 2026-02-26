// © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
// Temporary Edge Function: real SMTP test (IONOS). No PII in logs.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const FROM_EMAIL = "contact@m1ssion.com";
const FROM_NAME = "M1SSION™";
const CC_EMAIL = "contact@m1ssion.com";
const TEST_TO_EMAIL = "contact@m1ssion.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  let client: SMTPClient | null = null;

  try {
    const authHeader = req.headers.get("Authorization")?.trim() || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    const secret = Deno.env.get("SMTP_TEST_SECRET")?.trim() || "";
    if (!bearer || !secret || bearer !== secret) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.ionos.it";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465", 10);
    const smtpUser = Deno.env.get("SMTP_USER") || FROM_EMAIL;
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    if (!smtpPassword) {
      return new Response(
        JSON.stringify({ success: false, error: "smtp_error" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const timestamp = new Date().toISOString();
    const bodyText = `Test SMTP riuscito.
Edge runtime attivo.
Provider: IONOS SMTP.
Data: ${timestamp}.`;

    client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: smtpPort === 465,
        auth: { username: smtpUser, password: smtpPassword },
      },
    });

    await client.send({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: TEST_TO_EMAIL,
      cc: [CC_EMAIL],
      subject: "M1SSION™ — SMTP TEST OK",
      content: bodyText,
    });

    console.log("SMTP test sent");
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_e: unknown) {
    console.warn("SMTP error");
    return new Response(
      JSON.stringify({ success: false, error: "smtp_error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (_) {
        // ignore
      }
    }
  }
});
