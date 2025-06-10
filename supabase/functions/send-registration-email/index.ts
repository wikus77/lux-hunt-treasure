// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { RateLimiter } from "../_shared/rateLimiter.ts";

// Import utility functions
import { validateRegistrationEmail } from "./utils/validateRegistrationEmail.ts";
import { verifyAuthHeader } from "./utils/verifyAuthHeader.ts";
import { checkRateLimit } from "./utils/checkRateLimit.ts";
import { initializeMailjetClient } from "./utils/mailjetClient.ts";
import { getEmailTemplate } from "./utils/emailTemplates.ts";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Add CORS headers to ensure browser requests work properly
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Sentry-like error logging for Edge Functions
const logError = async (error: any, context: any) => {
  console.error("❌ EDGE FUNCTION ERROR:", error);
  
  // Skip logging for developer email
  if (context?.email === "wikus77@hotmail.it") {
    return;
  }
  
  // Log to abuse_logs as fallback monitoring
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase.from('abuse_logs').insert({
      user_id: context?.userId || 'unknown',
      event_type: 'edge_function_error',
      timestamp: new Date().toISOString(),
      ip_address: context?.ipAddress || 'unknown',
      meta: { 
        function: 'send-registration-email',
        error: error.message || String(error),
        stack: error.stack,
        context
      }
    });
  } catch (logError) {
    console.error("Failed to log error:", logError);
  }
};

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
    const authResult = await verifyAuthHeader(authHeader, supabaseUrl, supabaseServiceKey);
    
    if (!authResult.isValid) {
      return new Response(
        JSON.stringify({ success: false, error: authResult.error }),
        { status: authResult.statusCode!, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authenticatedUserId = authResult.userId!;

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

    // 2. EMAIL VALIDATION
    const validationResult = validateRegistrationEmail(requestData);
    if (!validationResult.isValid) {
      return new Response(
        JSON.stringify({ success: false, error: validationResult.error }),
        { status: validationResult.statusCode!, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 3. RATE LIMITING - Enhanced with new rate limiter
    const rateLimiter = new RateLimiter(supabaseUrl, supabaseServiceKey);
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    const rateLimitResult = await rateLimiter.checkRateLimit(authenticatedUserId, ipAddress, {
      maxRequests: 5,
      windowSeconds: 30,
      functionName: 'send-registration-email'
    });

    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limit exceeded for user: ${authenticatedUserId}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Troppe richieste email. Riprova tra qualche secondo." 
        }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json", 
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toISOString(),
            ...corsHeaders 
          } 
        }
      );
    }

    console.log(`✅ Security checks passed for user: ${authenticatedUserId}`);
    console.log(`Processing ${formType} email for ${name} (${email}), referral code: ${referral_code || "not provided"}`)

    // Initialize Mailjet client
    const mailjetResult = initializeMailjetClient();
    if (!mailjetResult.client) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: mailjetResult.error,
          debug: {
            MJ_APIKEY_PUBLIC_EXISTS: !!Deno.env.get("MJ_APIKEY_PUBLIC"),
            MJ_APIKEY_PRIVATE_EXISTS: !!Deno.env.get("MJ_APIKEY_PRIVATE"),
          }
        }), 
        { 
          status: mailjetResult.statusCode!, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    const mailjetClient = mailjetResult.client;

    // Get email template based on form type
    const emailTemplate = getEmailTemplate(formType, name, referral_code);

    console.log(`Preparing to send email from ${emailTemplate.senderEmail} to ${email} with subject "${emailTemplate.subject}"`)

    // Prepare email data
    const emailData = {
      Messages: [
        {
          From: { Email: emailTemplate.senderEmail, Name: emailTemplate.senderName },
          To: [{ Email: email, Name: name || "Utente" }],
          Subject: emailTemplate.subject,
          HTMLPart: emailTemplate.htmlPart,
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
    
    // Log error with context
    await logError(error, {
      userId: 'unknown',
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      email: null
    });
    
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
