
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

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
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError || !userData.user) {
      console.error("❌ User not found:", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }), 
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create session directly using admin API
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: userData.user.id
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
    return new Response(JSON.stringify({
      message: "Emergency access granted",
      session: sessionData.session,
      user: sessionData.user
    }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("❌ Emergency login error:", error);
    return new Response(
      JSON.stringify({ error: "Emergency login failed" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
