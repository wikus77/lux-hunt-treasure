
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  console.log("🔥 COMPACT LOGIN-NO-CAPTCHA: Starting...");
  
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      console.error("❌ Email required");
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log("🔥 Processing:", email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "http://localhost:54321";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!serviceRoleKey) {
      console.error("❌ Service key missing");
      return new Response(
        JSON.stringify({ success: false, error: "Service key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get user by email
    console.log("🔍 Getting user by email...");
    const { data: userList, error: fetchError } = await supabase.rpc("get_user_by_email", {
      email_param: email,
    });

    if (fetchError || !userList || userList.length === 0) {
      console.error("❌ User not found:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const user = userList[0];
    console.log("✅ User found:", user.email);

    // Force password reset for developer
    if (email === 'wikus77@hotmail.it') {
      console.log("🔧 FORCING PASSWORD RESET...");
      
      const { error: passwordError } = await supabase.auth.admin.updateUserById(user.id, {
        password: 'Wikus190877!@#',
        email_confirm: true
      });
      
      if (passwordError) {
        console.warn("⚠️ Password reset warning:", passwordError.message);
      } else {
        console.log("✅ PASSWORD RESET SUCCESS");
      }
    }
    
    // Create session
    console.log("🔑 Creating session...");
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: user.id,
    });

    if (sessionError || !sessionData?.access_token) {
      console.error("❌ Session creation failed:", sessionError);
      return new Response(
        JSON.stringify({ success: false, error: "Session creation failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Force role assignment for developer
    if (email === 'wikus77@hotmail.it') {
      console.log("🎯 FORCING DEVELOPER ROLE...");
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: user.id, role: 'developer' }, { onConflict: 'user_id,role' });
      
      if (roleError) {
        console.warn("⚠️ Role assignment warning:", roleError.message);
      } else {
        console.log("✅ DEVELOPER ROLE ASSIGNED");
      }
    }

    console.log("✅ SUCCESS: Returning session tokens");
    
    return new Response(
      JSON.stringify({
        success: true,
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
        user: user,
        session: sessionData
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (err) {
    console.error("💥 Exception:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Unhandled exception", details: err.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
