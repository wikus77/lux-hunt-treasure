
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
    console.log("🧠 DEBUG - USER ID:", user.id);
    console.log("🧠 DEBUG - USER EMAIL:", user.email);

    // Try using generateLink first as fallback strategy
    console.log("🔧 Generating magic link for emergency access...");
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
    });

    console.log("🧠 DEBUG - LINK DATA:", JSON.stringify(linkData));
    console.log("🧠 DEBUG - LINK ERROR:", JSON.stringify(linkError));

    if (linkError || !linkData) {
      console.error("❌ Magic link generation failed:", linkError);
      return new Response(
        JSON.stringify({ error: linkError?.message || "Failed to generate magic link" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Extract tokens from link data
    const access_token = linkData.access_token;
    const refresh_token = linkData.refresh_token;
    const action_link = linkData.action_link;

    console.log("🧠 DEBUG - ACCESS TOKEN TYPE:", typeof access_token);
    console.log("🧠 DEBUG - ACCESS TOKEN LENGTH:", access_token ? access_token.length : 'null');
    console.log("🧠 DEBUG - REFRESH TOKEN TYPE:", typeof refresh_token);
    console.log("🧠 DEBUG - REFRESH TOKEN LENGTH:", refresh_token ? refresh_token.length : 'null');
    console.log("🧠 DEBUG - ACTION LINK:", action_link ? action_link.substring(0, 50) + '...' : 'null');

    if (!access_token || !refresh_token) {
      console.error("❌ Missing tokens in link data");
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate tokens", 
          debug: {
            hasAccessToken: !!access_token,
            hasRefreshToken: !!refresh_token,
            hasActionLink: !!action_link
          }
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("✅ Emergency tokens generated successfully");
    
    const responseData = {
      access_token,
      refresh_token,
      action_link, // Include action link as backup
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at
      },
      message: "Emergency access granted via magic link"
    };

    console.log("📤 Final response structure:", JSON.stringify({
      hasAccessToken: !!responseData.access_token,
      hasRefreshToken: !!responseData.refresh_token,
      hasActionLink: !!responseData.action_link,
      userId: responseData.user.id
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
