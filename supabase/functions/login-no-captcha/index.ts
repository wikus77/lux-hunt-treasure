
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
    
    console.log("🔐 Login attempt for:", email);
    
    // FORCE BYPASS CAPTCHA for developer email
    if (email === "wikus77@hotmail.it") {
      console.log("🔓 DEVELOPER LOGIN - BYPASSING ALL CAPTCHA VALIDATION");
      
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Direct login without any CAPTCHA validation
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Login failed:", error);
        return new Response(
          JSON.stringify({ error: error.message }), 
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      console.log("✅ Developer login successful");
      return new Response(JSON.stringify({
        message: "Developer login successful",
        session: data.session,
        user: data.user
      }), { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // For non-developer emails, return unauthorized
    return new Response(
      JSON.stringify({ error: "Only developer access allowed here." }),
      { 
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

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
