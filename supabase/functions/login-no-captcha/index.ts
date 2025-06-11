
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
    const { email } = await req.json();
    
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
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
