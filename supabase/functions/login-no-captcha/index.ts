
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  console.log("🧪 STEP 1 - Starting login-no-captcha function...");
  console.log("🧪 Request method:", req.method);
  console.log("🧪 Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("🧪 Handling OPTIONS request");
    return new Response("OK", {
      headers: corsHeaders
    });
  }

  try {
    // Parse request body with validation
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("🧪 STEP 2 - Request body parsed:", requestBody);
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON in request body" }),
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    const { email } = requestBody;
    
    if (!email) {
      console.error("❌ Email not provided in request");
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    console.log("🧪 STEP 3 - Email received:", email);

    // Create Supabase client with enhanced environment checks
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "http://localhost:54321";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("🧪 STEP 4 - Environment check:", {
      supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      serviceKeyLength: serviceRoleKey?.length || 0,
      serviceKeyStart: serviceRoleKey?.substring(0, 10) + "..." || "N/A"
    });

    if (!serviceRoleKey) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY not found in environment");
      return new Response(
        JSON.stringify({ success: false, error: "Service key not configured" }),
        { 
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log("🧪 STEP 5 - Supabase client created successfully");

    // CRITICAL FIX: Use correct parameter name 'email_param' instead of 'email_input'
    console.log("🧪 STEP 6 - Calling RPC get_user_by_email with email_param:", email);
    const { data: userList, error: fetchError } = await supabase.rpc("get_user_by_email", {
      email_param: email,  // FIXED: Changed from email_input to email_param
    });

    console.log("🧪 STEP 7 - RPC Response:", {
      hasData: !!userList,
      dataLength: userList?.length || 0,
      hasError: !!fetchError,
      error: fetchError,
      userData: userList?.[0] ? {
        id: userList[0].id,
        email: userList[0].email,
        hasId: !!userList[0].id
      } : null
    });

    if (fetchError) {
      console.error("❌ RPC call failed with error:", fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database query failed", 
          details: {
            message: fetchError.message,
            code: fetchError.code,
            hint: fetchError.hint
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

    if (!userList || userList.length === 0) {
      console.error("❌ No user found for email:", email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Developer user not found",
          details: { searchedEmail: email }
        }),
        { 
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    const user = userList[0];
    console.log("🧪 STEP 8 - User found:", {
      userId: user.id,
      userEmail: user.email,
      userExists: !!user
    });

    // Create admin session with enhanced logging
    console.log("🧪 STEP 9 - Creating admin session for user:", user.id);
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: user.id,
    });

    console.log("🧪 STEP 10 - Session creation result:", {
      hasSessionData: !!sessionData,
      hasSession: !!sessionData?.session,
      hasUser: !!sessionData?.user,
      hasAccessToken: !!sessionData?.session?.access_token,
      hasRefreshToken: !!sessionData?.session?.refresh_token,
      sessionError: sessionError,
      accessTokenLength: sessionData?.session?.access_token?.length || 0,
      refreshTokenLength: sessionData?.session?.refresh_token?.length || 0
    });

    if (sessionError) {
      console.error("❌ Session creation failed with error:", sessionError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Session creation failed",
          details: {
            message: sessionError.message,
            status: sessionError.status
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

    if (!sessionData || !sessionData.session) {
      console.error("❌ No session data returned from createSession");
      return new Response(
        JSON.stringify({
          success: false,
          error: "No session created",
          details: "Session data is null or undefined"
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

    console.log("✅ STEP 11 - Login successful, returning tokens");
    const response = {
      success: true,
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      user: sessionData.user,
      session: sessionData.session
    };

    console.log("🧪 STEP 12 - Final response prepared:", {
      success: response.success,
      hasAccessToken: !!response.access_token,
      hasRefreshToken: !!response.refresh_token,
      hasUser: !!response.user,
      userEmail: response.user?.email
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );

  } catch (err) {
    console.error("❌ Unexpected error in login-no-captcha:", err);
    console.error("❌ Error stack:", err.stack);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Unhandled exception", 
      details: {
        message: err.message || err,
        name: err.name,
        stack: err.stack
      }
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
