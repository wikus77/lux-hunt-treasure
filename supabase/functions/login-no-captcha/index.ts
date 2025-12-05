// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Login No Captcha - Developer/Testing bypass with secure logging

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { withCors } from "../_shared/cors.ts";
import { createSecureLogger, maskValue } from "../_shared/secureLog.ts";
import { checkRateLimit, rateLimitResponse, RATE_LIMIT_PRESETS } from "../_shared/rateLimit.ts";

const log = createSecureLogger('LOGIN-NO-CAPTCHA');

serve(withCors(async (req) => {
  log.info("Function started", { method: req.method });
  
  // 🔒 Rate limiting: 5 attempts per minute (very strict for login)
  const rateLimitResult = await checkRateLimit('login-no-captcha', req, RATE_LIMIT_PRESETS.VERY_STRICT);
  if (!rateLimitResult.allowed) {
    log.warn("Rate limit exceeded");
    return rateLimitResponse(rateLimitResult);
  }
  
  try {
    // Parse request body with validation
    let requestBody;
    try {
      requestBody = await req.json();
      log.info("Request body parsed", { hasEmail: !!requestBody?.email });
    } catch (parseError) {
      log.error("Failed to parse request body");
      return jsonResponse({ success: false, error: "Invalid JSON in request body" }, 400);
    }

    const { email } = requestBody;
    
    if (!email) {
      log.error("Email not provided in request");
      return jsonResponse({ success: false, error: "Email is required" }, 400);
    }
    
    // Log masked email for debugging
    log.info("Processing login request", { email: maskValue(email, 'email') });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "http://localhost:54321";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!serviceRoleKey) {
      log.error("Service role key not configured");
      return jsonResponse({ success: false, error: "Service key not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    log.info("Supabase client created");

    // Call RPC to find user
    const { data: userList, error: fetchError } = await supabase.rpc("get_user_by_email", {
      email_param: email,
    });

    if (fetchError) {
      log.error("RPC call failed", { code: fetchError.code });
      return jsonResponse({ 
        success: false, 
        error: "Database query failed", 
        details: { message: fetchError.message, code: fetchError.code }
      }, 500);
    }

    if (!userList || userList.length === 0) {
      log.error("No user found", { email: maskValue(email, 'email') });
      return jsonResponse({ 
        success: false, 
        error: "Developer user not found"
      }, 404);
    }

    const user = userList[0];
    log.info("User found", { userId: maskValue(user.id, 'uuid') });

    // Create admin session
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: user.id,
    });

    if (sessionError) {
      log.error("Session creation failed", { status: sessionError.status });
      return jsonResponse({
        success: false,
        error: "Session creation failed",
        details: { message: sessionError.message }
      }, 500);
    }

    if (!sessionData || !sessionData.session) {
      log.error("No session data returned");
      return jsonResponse({
        success: false,
        error: "No session created"
      }, 500);
    }

    log.success("Login successful", { userId: maskValue(user.id, 'uuid') });
    
    return jsonResponse({
      success: true,
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      user: sessionData.user,
      session: sessionData.session
    }, 200);

  } catch (err: any) {
    log.error("Unexpected error", { name: err?.name });
    return jsonResponse({ 
      success: false, 
      error: "Unhandled exception"
    }, 500);
  }
}));

// Helper function for JSON responses (CORS handled by withCors wrapper)
function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { 
    status, 
    headers: { "Content-Type": "application/json" }
  });
}
