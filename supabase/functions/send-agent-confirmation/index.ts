
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import mailjet from "npm:node-mailjet@6.0.0";

// Configura gli headers CORS per consentire le richieste dal frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentConfirmationData {
  email: string;
  name: string;
  referral_code: string;
}

serve(async (req) => {
  // Gestione delle richieste OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Ottieni le credenziali Mailjet dalle variabili d'ambiente
    const mailjetApiKey = Deno.env.get("MJ_APIKEY_PUBLIC");
    const mailjetSecretKey = Deno.env.get("MJ_APIKEY_PRIVATE");
    
    if (!mailjetApiKey || !mailjetSecretKey) {
      console.error("Mailjet API keys non configurate correttamente");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Errore di configurazione del server" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Inizializza il client Mailjet
    const mailjetClient = mailjet.apiConnect(mailjetApiKey, mailjetSecretKey);
    
    // Estrai i dati dalla richiesta
    const requestData = await req.json();
    console.log("Ricevuta richiesta di conferma agente:", requestData);
    
    const { name, email, referral_code } = requestData as AgentConfirmationData;
    
    // Validazione
    if (!email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email è un campo obbligatorio" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Prepara i dati per l'email usando il template Mailjet
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
              Name: name || email.split("@")[0]
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
    
    // Invia l'email tramite Mailjet
    const response = await mailjetClient
      .post("send", { version: "v3.1" })
      .request(emailData);
    
    console.log("✅ Mailjet ha risposto:", response.body);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email di conferma inviata con successo",
        data: response.body
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("Errore nell'invio dell'email di conferma:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Errore nell'invio dell'email", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
