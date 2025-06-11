
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
    
    // CORRECT API: Use listUsers with email filter
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
    console.log("🔧 Creating session...");

    // Create session directly using admin API
    const { data, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (sessionError) {
      console.error("❌ Session creation failed:", sessionError);
      return new Response(
        JSON.stringify({ error: sessionError.message }), 
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Extract tokens from the generated link
    const url = new URL(data.properties.action_link);
    const access_token = url.searchParams.get('access_token');
    const refresh_token = url.searchParams.get('refresh_token');

    if (!access_token || !refresh_token) {
      console.error("❌ Tokens not found in response");
      return new Response(
        JSON.stringify({ error: "Failed to generate tokens" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("✅ Emergency session created successfully");
    console.log("🎫 Tokens generated - access_token length:", access_token.length);
    console.log("🎫 Tokens generated - refresh_token length:", refresh_token.length);
    
    return new Response(JSON.stringify({
      access_token,
      refresh_token,
      user: user,
      message: "Emergency access granted"
    }), { 
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
