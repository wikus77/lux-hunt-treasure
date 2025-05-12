
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import mailjet from "npm:node-mailjet@6.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, formType, referral_code } = await req.json();

    if (!email || !formType) {
      return new Response(JSON.stringify({
        success: false,
        error: "Email o tipo di form mancante"
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
        error: "API keys Mailjet non configurate"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const mailjetClient = mailjet.apiConnect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE);

    const senderEmail = "noreply@m1ssion.com";
    const senderName = "M1SSION";

    console.log(`Invio email a ${email} con referral_code: ${referral_code || "non disponibile"}`);

    const emailData = {
      Messages: [
        {
          From: { Email: senderEmail, Name: senderName },
          To: [{ Email: email, Name: name || "Agente" }],
          TemplateID: 6974023,
          TemplateLanguage: true,
          Variables: {
            referral_code: referral_code || "NON DISPONIBILE"
          }
        }
      ]
    };

    const response = await mailjetClient.post("send", { version: "v3.1" }).request(emailData);

    return new Response(JSON.stringify({
      success: true,
      message: "Email inviata correttamente",
      response: response.body
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    console.error("Errore generale:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Errore nell'invio email",
      details: error.message || error
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
