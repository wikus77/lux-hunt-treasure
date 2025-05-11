
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

// Import Mailjet correctly - fixed import syntax
import mailjet from "npm:node-mailjet@6.0.0";

// Add CORS headers to ensure browser requests work properly
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("Received registration email data:", JSON.stringify(requestData));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request format" }), 
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    const { email, name, formType } = requestData;

    console.log(`Processing ${formType} email for ${name} (${email})`)

    // Validate required fields
    if (!email || !formType) {
      return new Response(
        JSON.stringify({ success: false, error: "Email o tipo di form mancante" }), 
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      )
    }

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
      )
    }

    // Initialize Mailjet client with API keys from environment variables
    let mailjetClient;
    try {
      mailjetClient = mailjet.apiConnect(
        MJ_APIKEY_PUBLIC,
        MJ_APIKEY_PRIVATE
      );
      console.log("Mailjet client initialized successfully");
    } catch (mjInitError) {
      console.error("Error initializing Mailjet client:", mjInitError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Errore nell'inizializzazione del client Mailjet",
          details: mjInitError.message || JSON.stringify(mjInitError)
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

    // Configure email based on form type
    let senderEmail = "noreply@m1ssion.com"
    let senderName = "M1SSION"
    let subject = "Benvenuto in M1SSION"
    let htmlPart = `<h2>Hai appena compiuto il primo passo.</h2><p>Benvenuto su M1SSION, la caccia ha inizio.</p>`

    // Customize email content based on form type
    if (formType === "agente") {
      senderEmail = "contact@m1ssion.com"
      subject = "Conferma ricezione richiesta agente"
      htmlPart = `<h3>Abbiamo ricevuto la tua richiesta per diventare agente. Ti contatteremo presto!</h3>`
    } else if (formType === "newsletter") {
      senderEmail = "contact@m1ssion.com"
      subject = "Iscrizione Newsletter M1SSION"
      htmlPart = `<h3>Grazie per esserti iscritto alla nostra newsletter!</h3><p>Riceverai aggiornamenti esclusivi sul lancio di M1SSION.</p>`
    } else if (formType === "contatto") {
      senderEmail = "contact@m1ssion.com"
      subject = "Abbiamo ricevuto il tuo messaggio"
      htmlPart = `<h3>Grazie per averci contattato!</h3><p>Ti risponderemo al più presto.</p>`
    } else if (formType === "preregistrazione") {
      senderEmail = "contact@m1ssion.com" 
      subject = "Pre-registrazione confermata"
      htmlPart = `<h3>Grazie per la tua pre-registrazione!</h3><p>Sei tra i primi a far parte di M1SSION. Ti aggiorneremo sul lancio.</p>`
    }

    console.log(`Preparing to send email from ${senderEmail} to ${email} with subject "${subject}"`)

    // Prepare email data
    const emailData = {
      Messages: [
        {
          From: { Email: senderEmail, Name: senderName },
          To: [{ Email: email, Name: name || "Utente" }],
          Subject: subject,
          HTMLPart: htmlPart,
          TrackOpens: "enabled",
          TrackClicks: "enabled"
        }
      ]
    };

    // Send email through Mailjet API
    try {
      console.log("Sending email via Mailjet API...");
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
      )
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
      )
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
    )
  }
})
