
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import mailjet from "npm:node-mailjet@6.0.0";
import { corsHeaders } from "./cors.ts";

serve(async (req) => {
  // Log all requests for debugging
  console.log(`Received ${req.method} request to send-agent-confirmation`);
  console.log(`Request headers: ${JSON.stringify(Object.fromEntries(req.headers))}`);
  
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body and log inputs
    const requestBody = await req.json();
    console.log("Request body received:", JSON.stringify(requestBody));
    
    const { email, name, referral_code } = requestBody;

    console.log(`Processing request for: ${email}, name: ${name}, with referral code: ${referral_code || "not provided"}`);

    if (!email) {
      console.error("Missing required field: email");
      return new Response(JSON.stringify({
        success: false,
        error: "Email mancante"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Check for API keys
    const MJ_APIKEY_PUBLIC = Deno.env.get("MJ_APIKEY_PUBLIC");
    const MJ_APIKEY_PRIVATE = Deno.env.get("MJ_APIKEY_PRIVATE");
    
    // Log IONOS configuration status
    const USE_IONOS_ONLY = Deno.env.get("USE_IONOS_ONLY");
    console.log("IONOS Configuration:", {
      useIonosOnly: USE_IONOS_ONLY === "true" ? "Yes" : "No"
    });

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

    // FIXED: Force noreply@m1ssion.com as sender
    const senderEmail = "noreply@m1ssion.com";
    const senderName = "M1SSION";

    console.log(`Preparing email to ${email} with referral_code: ${referral_code || "non disponibile"}`);
    console.log(`Using Mailjet TemplateID: 6974914`);

    // Create email data with ONLY template configuration - explicitly removed Subject and HTMLPart
    const emailData = {
      Messages: [
        {
          From: { 
            Email: senderEmail, 
            Name: senderName 
          },
          To: [{ 
            Email: email, 
            Name: name || "Agente" 
          }],
          // Using template ID 6974914 as specified
          TemplateID: 6974914,
          TemplateLanguage: true,
          Variables: {
            referral_code: referral_code || "CODICE NON DISPONIBILE",
            timestamp: new Date().toISOString() // Adding timestamp for tracking
          },
          // Force sender to override any template setting
          SenderEmail: senderEmail,
          SenderName: senderName
        }
      ]
    };

    // Log the exact payload being sent to Mailjet for debugging
    console.log("Email payload prepared:", JSON.stringify(emailData, null, 2));
    console.log("Sending email via Mailjet API");
    console.log(`IONOS configuration: ${USE_IONOS_ONLY === "true" ? "Using IONOS SMTP" : "Using Mailjet API"}`);

    try {
      // Enhanced logging before sending
      console.log(`${new Date().toISOString()} - Attempting to send email to ${email} via ${USE_IONOS_ONLY === "true" ? "IONOS SMTP" : "Mailjet API"}`);
      
      const response = await mailjetClient.post("send", { version: "v3.1" }).request(emailData);
      
      // Log the complete API response for debugging
      console.log(`${new Date().toISOString()} - Mailjet API response:`, JSON.stringify(response.body, null, 2));
      console.log(`${new Date().toISOString()} - Email sent successfully to: ${email}`);
      
      return new Response(JSON.stringify({
        success: true,
        message: "Email inviata correttamente",
        timestamp: new Date().toISOString(),
        recipient: email,
        response: response.body
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    } catch (mailjetError: any) {
      // Enhanced error logging for Mailjet errors
      console.error(`${new Date().toISOString()} - Mailjet API error for recipient ${email}:`, mailjetError);
      
      // Add detailed error information from Mailjet's response if available
      if (mailjetError.response && mailjetError.response.body) {
        console.error(`${new Date().toISOString()} - Mailjet error details for ${email}:`, JSON.stringify(mailjetError.response.body, null, 2));
      }
      
      return new Response(JSON.stringify({
        success: false,
        error: "Errore nell'invio email via Mailjet",
        timestamp: new Date().toISOString(),
        recipient: email,
        details: mailjetError.response?.body || mailjetError.message || mailjetError
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

  } catch (error: any) {
    console.error(`${new Date().toISOString()} - Error in send-agent-confirmation function:`, error);
    console.error(`${new Date().toISOString()} - Stack trace:`, error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: "Errore nell'invio email",
      timestamp: new Date().toISOString(),
      details: error.message || error,
      stack: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
