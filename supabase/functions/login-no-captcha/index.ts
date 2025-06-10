
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { RateLimiter } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Sentry-like error logging for Edge Functions
const logError = async (error: any, context: any) => {
  console.error("❌ EDGE FUNCTION ERROR:", error);
  
  // Skip logging for developer email
  if (context?.email === "wikus77@hotmail.it") {
    return;
  }
  
  // Log to abuse_logs as fallback monitoring
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabase.from('abuse_logs').insert({
      user_id: context?.userId || context?.email || 'unknown',
      event_type: 'edge_function_error',
      timestamp: new Date().toISOString(),
      ip_address: context?.ipAddress || 'unknown',
      meta: { 
        function: 'login-no-captcha',
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    // RATE LIMITING CHECK
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const rateLimiter = new RateLimiter(supabaseUrl, supabaseServiceKey);
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    const rateLimitResult = await rateLimiter.checkRateLimit(email, ipAddress, {
      maxRequests: 5,
      windowSeconds: 30,
      functionName: 'login-no-captcha'
    });

    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limit exceeded for login: ${email}`);
      return new Response(
        JSON.stringify({ 
          error: "Troppe richieste di login. Riprova tra qualche secondo." 
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
    
    if (email !== "wikus77@hotmail.it") {
      return new Response(
        JSON.stringify({ error: "Only developer access allowed here." }),
        { 
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("🔑 Creating immediate session for developer user");

    // Get user
    const { data: user, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
    if (getUserError || !user) {
      console.error("User not found:", getUserError);
      return new Response(
        JSON.stringify({ error: "User not found" }), 
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create session immediately - NO CAPTCHA, NO MAGIC LINK
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: user.user.id,
    });

    if (sessionError) {
      console.error("Session creation failed:", sessionError);
      return new Response(
        JSON.stringify({ error: "Session creation failed" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("✅ Developer session created successfully");

    return new Response(JSON.stringify({
      message: "Developer session granted",
      session: sessionData.session
    }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("❌ Error in login-no-captcha:", error);
    
    // Log error with context
    await logError(error, {
      email: null, // Don't log email for privacy
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip")
    });
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
