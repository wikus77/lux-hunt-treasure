
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

    if (!email) {
      console.error("❌ Email mancante nella richiesta");
      return new Response(JSON.stringify({
        success: false,
        error: "Email mancante"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    if (!referral_code) {
      console.error("❌ referral_code mancante nella richiesta per:", email);
      return new Response(JSON.stringify({
        success: false,
        error: "Codice referral mancante"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const MJ_APIKEY_PUBLIC = Deno.env.get("MJ_APIKEY_PUBLIC");
    const MJ_APIKEY_PRIVATE = Deno.env.get("MJ_APIKEY_PRIVATE");

    if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
      console.error("❌ Chiavi API Mailjet non configurate");
      return new Response(JSON.stringify({
        success: false,
        error: "Chiavi API Mailjet non configurate"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const mailjetClient = mailjet.apiConnect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE);

    // Migliorato payload con CustomID e metadati per tracciamento
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
            referral_code: referral_code,
            name: name || "Agente",
            registration_date: new Date().toISOString().split('T')[0]
          },
          CustomID: `agent_conf_${Date.now()}`,
          TrackOpens: "enabled",
          TrackClicks: "enabled"
        }
      ]
    };

    console.log("📤 Inviando email con Mailjet - Payload:", JSON.stringify(emailData, null, 2));
    console.log("📧 Email destinatario:", email);
    console.log("🔑 Referral code:", referral_code);
    
    const response = await mailjetClient.post("send", { version: "v3.1" }).request(emailData);
    
    // Log completo della risposta per debugging
    console.log("✅ Mailjet risposta completa:", JSON.stringify(response, null, 2));
    
    // Verifica esplicita dello stato della risposta
    const messageStatus = response.body?.Messages?.[0]?.Status;
    if (!messageStatus || messageStatus !== 'success') {
      console.error("❌ Mailjet ha risposto senza successo:", JSON.stringify(response.body, null, 2));
      return new Response(JSON.stringify({
        success: false,
        error: "Email non inviata correttamente",
        details: response.body
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    
    // Dettagli aggiuntivi sulla risposta
    console.log("📊 Dettagli consegna:", response.body?.Messages?.[0]);
    
    return new Response(JSON.stringify({
      success: true,
      message: "Email inviata con successo",
      response: response.body,
      email: email,
      referral_code: referral_code,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    console.error("❌ Errore durante l'invio email:", error);
    // Logging dettagliato dell'errore
    if (error.response) {
      console.error("Dettagli errore API:", error.response);
    }
    if (error.request) {
      console.error("Dettagli richiesta:", error.request);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: "Errore invio email",
      details: error.message || String(error),
      stack: error.stack || "No stack trace available",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
