
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "./cors.ts";

// Define email request interface
interface AgentEmailRequest {
  name: string;
  email: string;
  referral_code: string;
}

// Main handler
const handler = async (req: Request): Promise<Response> => {
  console.log(`Processing ${req.method} request to send-agent-confirmation`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: AgentEmailRequest = await req.json();
    console.log("Received agent confirmation email request:", requestData);
    
    // Validate required fields
    if (!requestData.email || !requestData.name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email e nome sono campi obbligatori" 
        }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    const { name, email, referral_code } = requestData;

    // Get Mailjet API keys from environment variables
    const MJ_APIKEY_PUBLIC = Deno.env.get("MJ_APIKEY_PUBLIC");
    const MJ_APIKEY_PRIVATE = Deno.env.get("MJ_APIKEY_PRIVATE");
    
    if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
      console.error("Mailjet API keys not found in environment variables");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "API keys Mailjet non configurate",
          debug: {
            MJ_APIKEY_PUBLIC_EXISTS: !!MJ_APIKEY_PUBLIC,
            MJ_APIKEY_PRIVATE_EXISTS: !!MJ_APIKEY_PRIVATE,
          }
        }), 
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Import Mailjet correctly
    const mailjet = await import("npm:node-mailjet@6.0.0").then(mod => mod.default);

    // Initialize Mailjet client with API keys from environment variables
    const mailjetClient = mailjet.apiConnect(
      MJ_APIKEY_PUBLIC,
      MJ_APIKEY_PRIVATE
    );

    console.log("Mailjet client initialized successfully");

    // Set the variables for the template
    const variables = {
      name: name,
      referral_code: referral_code || "CODICE NON DISPONIBILE"
    };

    console.log("Template variables:", variables);
    console.log("Using Mailjet template ID: 6973742");

    // Prepare email data using the Mailjet template
    const emailData = {
      Messages: [
        {
          From: { 
            Email: "noreply@m1ssion.com", 
            Name: "M1SSION" 
          },
          To: [{ 
            Email: email, 
            Name: name || "Nuovo Agente" 
          }],
          Subject: "Sei ufficialmente un agente M1SSION",
          TemplateID: 6973742,
          TemplateLanguage: true,
          Variables: variables,
          TrackOpens: "enabled",
          TrackClicks: "enabled"
        }
      ]
    };

    // Send email through Mailjet API
    try {
      console.log("Sending email via Mailjet API with template...");
      const response = await mailjetClient.post("send", { version: "v3.1" }).request(emailData);
      console.log("Mailjet API response status:", response.status);
      console.log("Mailjet API response body:", JSON.stringify(response.body, null, 2));

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email inviata con successo",
          response: response.body
        }), 
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    } catch (mailjetError: any) {
      console.error("Mailjet API error:", mailjetError);
      
      // Extract detailed error info
      let errorDetails = mailjetError;
      try {
        if (mailjetError.response && mailjetError.response.data) {
          errorDetails = mailjetError.response.data;
        } else if (mailjetError.message) {
          errorDetails = mailjetError.message;
        }
      } catch (e) {
        console.error("Error parsing Mailjet error:", e);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Errore API Mailjet: " + (mailjetError.message || mailjetError.ErrorMessage || JSON.stringify(mailjetError)),
          details: errorDetails
        }), 
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }
  } catch (error: any) {
    console.error("General error sending email:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Errore nell'invio email: " + error.message,
        details: error.stack || "No stack trace available"
      }), 
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
};

// Start the server
console.log("Starting send-agent-confirmation edge function");
serve(handler);
