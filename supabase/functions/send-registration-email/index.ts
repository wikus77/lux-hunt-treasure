// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Import Mailjet correctly - fixed import syntax
import mailjet from "npm:node-mailjet@6.0.0";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Add CORS headers to ensure browser requests work properly
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory rate limiting store (simple implementation)
const rateLimitStore = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 60 seconds

// Rate limiting check
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitStore.get(identifier);
  
  if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW) {
    return false; // Rate limit exceeded
  }
  
  rateLimitStore.set(identifier, now);
  return true;
}

serve(async (req) => {
  console.log(`Processing ${req.method} request to send-registration-email`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. AUTHENTICATION - Verify Authorization Header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Token di autorizzazione mancante" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Extract Bearer token
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      console.error("Invalid authorization format");
      return new Response(
        JSON.stringify({ success: false, error: "Formato token di autorizzazione non valido" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create authenticated Supabase client for token verification
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Invalid token:", authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Token di autorizzazione non valido" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authenticatedUserId = user.id;

    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("Received registration email data:", JSON.stringify(requestData));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: "Formato della richiesta non valido" }), 
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    const { email, name, formType, referral_code } = requestData;

    // 2. EMAIL VALIDATION - Validate email field
    if (!email || typeof email !== 'string') {
      console.error("Missing or invalid email parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro email mancante o non valido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format (RFC compliant)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format");
      return new Response(
        JSON.stringify({ success: false, error: "Formato email non valido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check email length (max 100 characters)
    if (email.length > 100) {
      console.error("Email too long");
      return new Response(
        JSON.stringify({ success: false, error: "Email troppo lunga (massimo 100 caratteri)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check for HTML/script tags in any field
    const htmlScriptRegex = /<[^>]*>/g;
    if (htmlScriptRegex.test(email) || (name && htmlScriptRegex.test(name)) || 
        (formType && htmlScriptRegex.test(formType)) || (referral_code && htmlScriptRegex.test(referral_code))) {
      console.error("HTML/script tags detected in input");
      return new Response(
        JSON.stringify({ success: false, error: "I campi non possono contenere tag HTML o script" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate required fields
    if (!formType) {
      return new Response(
        JSON.stringify({ success: false, error: "Tipo di form mancante" }), 
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      )
    }

    // 3. RATE LIMITING - Check rate limit (1 email every 60 seconds per user)
    if (!checkRateLimit(authenticatedUserId)) {
      console.error(`Rate limit exceeded for user: ${authenticatedUserId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Troppi tentativi. Attendi 60 secondi prima di inviare un'altra email" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ Security checks passed for user: ${authenticatedUserId}`);
    console.log(`Processing ${formType} email for ${name} (${email}), referral code: ${referral_code || "not provided"}`)

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
      
      // Enhanced HTML for pre-registration with referral code
      // Make sure we display the actual referral code or a clear message if it's not available
      const displayReferralCode = referral_code || "CODICE NON DISPONIBILE";
      
      htmlPart = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(90deg, #00E5FF 0%, #0077FF 100%); padding: 20px; text-align: center; color: #000;">
            <h1 style="margin: 0; color: #FFF;">M1SSION</h1>
          </div>
          
          <div style="padding: 20px; background-color: #ffffff;">
            <h3>Sei ufficialmente un agente M1SSION.</h3>
            <p>Hai completato la pre-iscrizione. Tieniti pronto: la tua prima missione sta per arrivare.</p>
            
            <p style="margin-top: 20px;">Il tuo codice referral: <strong>${displayReferralCode}</strong></p>
            
            <p>Puoi invitare altri agenti usando questo codice e guadagnare crediti extra per la tua missione!</p>
          </div>
          
          <div style="font-size: 12px; text-align: center; padding-top: 20px; color: #999;">
            <p>&copy; ${new Date().getFullYear()} M1SSION. Tutti i diritti riservati.</p>
            <p>Questo messaggio è stato inviato automaticamente a seguito della tua pre-registrazione su M1SSION.</p>
          </div>
        </div>
      `
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
