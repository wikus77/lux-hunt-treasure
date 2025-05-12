
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import mailjet from "npm:node-mailjet@6.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Log all requests for debugging
  console.log(`Received ${req.method} request to send-agent-confirmation`);
  
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body and log inputs
    const requestBody = await req.json();
    console.log("Request body received:", JSON.stringify(requestBody));
    
    const { email, name, formType, referral_code } = requestBody;

    console.log(`Processing request for: ${email}, type: ${formType}, with referral code: ${referral_code || "not provided"}`);

    if (!email || !formType) {
      console.error("Missing required fields:", { email, formType });
      return new Response(JSON.stringify({
        success: false,
        error: "Email o tipo di form mancante"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Check for API keys
    const MJ_APIKEY_PUBLIC = Deno.env.get("MJ_APIKEY_PUBLIC");
    const MJ_APIKEY_PRIVATE = Deno.env.get("MJ_APIKEY_PRIVATE");

    console.log("Mailjet API keys present:", {
      publicKey: !!MJ_APIKEY_PUBLIC,
      privateKey: !!MJ_APIKEY_PRIVATE,
    });

    if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
      console.error("Mailjet API keys not configured");
      return new Response(JSON.stringify({
        success: false,
        error: "API keys Mailjet non configurate"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Initialize Mailjet client
    console.log("Initializing Mailjet client");
    const mailjetClient = mailjet.apiConnect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE);

    const senderEmail = "noreply@m1ssion.com";
    const senderName = "M1SSION";

    console.log(`Preparing email to ${email} with referral_code: ${referral_code || "non disponibile"}`);

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

    console.log("Email payload prepared:", JSON.stringify(emailData, null, 2));
    console.log("Sending email via Mailjet API");

    const response = await mailjetClient.post("send", { version: "v3.1" }).request(emailData);

    console.log("Mailjet API response:", JSON.stringify(response.body, null, 2));

    return new Response(JSON.stringify({
      success: true,
      message: "Email inviata correttamente",
      response: response.body
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    console.error("Error in send-agent-confirmation function:", error);
    console.error("Stack trace:", error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: "Errore nell'invio email",
      details: error.message || error,
      stack: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
