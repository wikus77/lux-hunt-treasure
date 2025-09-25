
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Email service temporarily disabled to fix build - use edge function approach instead
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

    // Return temporary response until mailjet is properly configured
    console.log("Email service temporarily disabled - returning success response");
    return new Response(JSON.stringify({
      success: true,
      message: "Email functionality temporarily disabled",
      recipient: email
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error: any) {
    console.error(`Error in send-agent-confirmation function:`, error);
    
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
