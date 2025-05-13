
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import mailjet from "npm:node-mailjet@6.0.0";
import { corsHeaders } from "./cors.ts";

interface AgentConfirmationData {
  email: string;
  name: string;
  referral_code: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, referral_code } = await req.json();

    if (!email || !referral_code) {
      return new Response(JSON.stringify({
        success: false,
        error: "Email o referral_code mancante"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const MJ_APIKEY_PUBLIC = Deno.env.get("MJ_APIKEY_PUBLIC");
    const MJ_APIKEY_PRIVATE = Deno.env.get("MJ_APIKEY_PRIVATE");

    if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
      return new Response(JSON.stringify({
        success: false,
        error: "Chiavi API Mailjet non configurate"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const mailjetClient = mailjet.apiConnect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE);

    const emailData = {
      Messages: [
        {
          From: {
            Email: "noreply@m1ssion.com",
            Name: "M1SSION"
          },
          To: [
            {
              Email: email,
              Name: name || "Agente"
            }
          ],
          TemplateID: 6974914,
          TemplateLanguage: true,
          Variables: {
            referral_code: referral_code
          },
          CustomID: `agent_conf_${Date.now()}`,
          TrackOpens: "enabled",
          TrackClicks: "enabled"
        }
      ]
    };

    console.log("📤 Inviando email con Mailjet - Payload:", JSON.stringify(emailData, null, 2));
    const response = await mailjetClient.post("send", { version: "v3.1" }).request(emailData);
    console.log("✅ Mailjet ha risposto:", JSON.stringify(response.body, null, 2));

    return new Response(JSON.stringify({
      success: true,
      message: "Email inviata con successo",
      response: response.body
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    console.error("❌ Errore durante l'invio email:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Errore invio email",
      details: error.message || error
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
