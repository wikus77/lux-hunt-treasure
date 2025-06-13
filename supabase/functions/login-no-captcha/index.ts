
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      headers: corsHeaders
    });
  }

  try {
    console.log("🧪 STEP 1 - Starting login-no-captcha function...");
    
    // Parse request body
    const { email } = await req.json();
    console.log("🧪 STEP 2 - Email received:", email);

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "http://localhost:54321";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("🧪 STEP 3 - Environment check:", {
      supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      serviceKeyLength: serviceRoleKey?.length || 0
    });

    if (!serviceRoleKey) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY not found");
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

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    console.log("🧪 STEP 4 - Supabase client created");

    // Call the RPC function to get user by email
    console.log("🧪 STEP 5 - Calling RPC get_user_by_email with email_input:", email);
    const { data: userList, error: fetchError } = await supabase.rpc("get_user_by_email", {
      email_input: email,
    });

    console.log("🧪 STEP 6 - RPC Response:", {
      hasData: !!userList,
      dataLength: userList?.length || 0,
      hasError: !!fetchError,
      error: fetchError
    });

    if (fetchError || !userList || userList.length === 0) {
      console.error("❌ RPC error or no user found:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "Developer user not found", details: fetchError }),
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
    console.log("🧪 STEP 7 - User found:", {
      userId: user.id,
      userEmail: user.email
    });

    // Create admin session
    console.log("🧪 STEP 8 - Creating admin session for user:", user.id);
    const { data: session, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: user.id,
    });

    console.log("🧪 STEP 9 - Session creation result:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasAccessToken: !!session?.session?.access_token,
      hasRefreshToken: !!session?.session?.refresh_token,
      sessionError
    });

    if (sessionError || !session) {
      console.error("❌ Session creation failed:", sessionError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Session creation failed",
          details: sessionError?.message,
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

    console.log("✅ STEP 10 - Login successful, returning tokens");
    return new Response(
      JSON.stringify({
        success: true,
        access_token: session.session.access_token,
        refresh_token: session.session.refresh_token,
        user: session.user,
      }),
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
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Unhandled exception", 
      details: err.message || err 
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
