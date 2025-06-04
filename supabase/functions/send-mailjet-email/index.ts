
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "./cors.ts";
import { handleEmailRequest } from "./email-handler.ts";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Enhanced in-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; firstRequest: number }>();
const abuseStore = new Map<string, number>();
const RATE_LIMIT_WINDOW = 30000; // 30 seconds
const RATE_LIMIT_COUNT = 3; // max 3 emails per window
const ABUSE_THRESHOLD = 5; // trigger alert after 5 violations

// Enhanced rate limiting with abuse detection for emails
function checkEmailRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitStore.get(identifier);
  
  if (!userRequests || (now - userRequests.firstRequest) > RATE_LIMIT_WINDOW) {
    // Reset window
    rateLimitStore.set(identifier, { count: 1, firstRequest: now });
    return true;
  }
  
  if (userRequests.count >= RATE_LIMIT_COUNT) {
    // Track abuse
    const abuseCount = (abuseStore.get(identifier) || 0) + 1;
    abuseStore.set(identifier, abuseCount);
    
    if (abuseCount >= ABUSE_THRESHOLD) {
      console.error(`🚨 EMAIL ABUSE ALERT: User ${identifier} exceeded email rate limit ${abuseCount} times`);
      // In production, this could trigger email alerts or other notifications
    }
    
    return false;
  }
  
  userRequests.count++;
  return true;
}

/**
 * Main handler for the edge function
 */
const handler = async (req: Request): Promise<Response> => {
  console.log(`Processing ${req.method} request to send-mailjet-email`);
  
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
    const userEmail = user.email;

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: "Formato della richiesta non valido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 2. INPUT VALIDATION - Validate required fields
    const { email, subject, message, name, type } = requestData;

    // Check required fields
    if (!email || !subject || !message) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ success: false, error: "Campi obbligatori mancanti: email, subject, message" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate field types
    if (typeof email !== 'string' || typeof subject !== 'string' || typeof message !== 'string') {
      console.error("Invalid field types");
      return new Response(
        JSON.stringify({ success: false, error: "Tutti i campi devono essere stringhe" }),
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

    // Validate message length (max 2000 characters)
    if (message.length > 2000) {
      console.error("Message too long");
      return new Response(
        JSON.stringify({ success: false, error: "Il messaggio non può superare i 2000 caratteri" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check for HTML/script tags in any field
    const htmlScriptRegex = /<[^>]*>/g;
    if (htmlScriptRegex.test(email) || htmlScriptRegex.test(subject) || htmlScriptRegex.test(message) || 
        (name && htmlScriptRegex.test(name))) {
      console.error("HTML/script tags detected in input");
      return new Response(
        JSON.stringify({ success: false, error: "I campi non possono contenere tag HTML o script" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify email matches authenticated user if provided
    if (userEmail && email !== userEmail) {
      console.error("Email mismatch with authenticated user");
      return new Response(
        JSON.stringify({ success: false, error: "L'email deve corrispondere all'utente autenticato" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 3. ENHANCED RATE LIMITING - Check email specific rate limit
    if (!checkEmailRateLimit(authenticatedUserId)) {
      console.error(`Email rate limit exceeded for user: ${authenticatedUserId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Troppi tentativi di invio email. Attendi 30 secondi prima di riprovare" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 4. CONTROLLO ANTIFLOOD - Log dell'evento email
    const { data: isAbuse, error: abuseError } = await supabase.rpc('log_potential_abuse', {
      p_event_type: 'email_send',
      p_user_id: authenticatedUserId
    });

    if (abuseError) {
      console.error("Errore nel sistema antiflood per email:", abuseError);
      // Non blocchiamo l'operazione per errori di logging, ma logghiamo
    }

    if (isAbuse) {
      console.error(`ANTIFLOOD TRIGGERED: User ${authenticatedUserId} exceeded email send limit`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Troppe email inviate di recente. Attendi 30 secondi prima di riprovare." 
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ Security checks passed for user: ${authenticatedUserId}`);

    // Process the email request with validated data
    return await handleEmailRequest(req);

  } catch (error: any) {
    console.error('Error in send-mailjet-email:', error);
    
    // Return secure error response
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Errore del server durante l\'elaborazione della richiesta'
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
console.log("Starting send-mailjet-email edge function with enhanced security");
serve(handler);
