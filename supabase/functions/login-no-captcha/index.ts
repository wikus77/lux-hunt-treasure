
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email } = body;
    
    console.log("🔐 Emergency login attempt for:", email);
    console.log("📥 Request body:", JSON.stringify(body));
    
    // EMERGENCY BYPASS - Only for developer email
    if (email !== "wikus77@hotmail.it") {
      console.log("❌ Access denied for email:", email);
      return new Response(
        JSON.stringify({ error: "Access denied" }), 
        { 
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("🔓 EMERGENCY DEVELOPER ACCESS - Creating session directly");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("🔍 Getting user by email...");
    
    // Get all users and find by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("❌ Error listing users:", userError);
      return new Response(
        JSON.stringify({ error: userError.message }), 
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error("❌ User not found:", email);
      return new Response(
        JSON.stringify({ error: "User not found" }), 
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("✅ User found:", user.id);
    console.log("🔧 Creating session directly with admin.createSession...");

    // Use admin.createSession instead of generateLink for direct session creation
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: user.id,
    });

    console.log("📤 Raw session response:", JSON.stringify(sessionData));
    console.log("📤 Session error (if any):", JSON.stringify(sessionError));

    if (sessionError || !sessionData) {
      console.error("❌ Session creation failed:", sessionError);
      return new Response(
        JSON.stringify({ error: sessionError?.message || "Failed to create session" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Extract tokens from session data
    const access_token = sessionData.access_token;
    const refresh_token = sessionData.refresh_token;

    console.log("🎫 Access token type:", typeof access_token);
    console.log("🎫 Access token length:", access_token ? access_token.length : 'null');
    console.log("🎫 Refresh token type:", typeof refresh_token);
    console.log("🎫 Refresh token length:", refresh_token ? refresh_token.length : 'null');

    if (!access_token || !refresh_token) {
      console.error("❌ Missing tokens in session data");
      return new Response(
        JSON.stringify({ error: "Failed to generate tokens", debug: sessionData }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("✅ Emergency session created successfully");
    
    const responseData = {
      access_token,
      refresh_token,
      user: user,
      message: "Emergency access granted"
    };

    console.log("📤 Final response data:", JSON.stringify({
      ...responseData,
      access_token: `${access_token.substring(0, 20)}...`,
      refresh_token: `${refresh_token.substring(0, 20)}...`
    }));
    
    return new Response(JSON.stringify(responseData), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("❌ Emergency login error:", error);
    console.error("❌ Error stack:", error.stack);
    return new Response(
      JSON.stringify({ error: "Emergency login failed", details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
