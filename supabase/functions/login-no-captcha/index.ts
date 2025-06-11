
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
    const { email, password } = await req.json();
    
    console.log("🔐 Emergency login attempt for:", email);
    
    // EMERGENCY BYPASS - Only for developer email
    if (email !== "wikus77@hotmail.it") {
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

    // Get user by email first
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("❌ Error fetching users:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch users" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const targetUser = userData.users.find(user => user.email === email);
    
    if (!targetUser) {
      console.error("❌ User not found:", email);
      return new Response(
        JSON.stringify({ error: "User not found" }), 
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create session directly using admin API
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email
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

    console.log("✅ Emergency session created successfully");
    
    // Extract tokens safely from the action link
    const actionLink = sessionData.properties?.action_link;
    if (!actionLink) {
      return new Response(
        JSON.stringify({ error: "Failed to generate session tokens" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Parse URL fragment safely
    const hashPart = actionLink.split('#')[1];
    if (!hashPart) {
      return new Response(
        JSON.stringify({ error: "Invalid session link format" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const params = new URLSearchParams(hashPart);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    
    if (!access_token || !refresh_token) {
      return new Response(
        JSON.stringify({ error: "Failed to extract session tokens" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(JSON.stringify({
      message: "Emergency access granted",
      user: targetUser,
      access_token,
      refresh_token
    }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("❌ Emergency login error:", error);
    return new Response(
      JSON.stringify({ error: "Emergency login failed", details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
