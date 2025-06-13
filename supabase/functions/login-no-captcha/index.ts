
// supabase/functions/login-no-captcha/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("✅ login-no-captcha function loaded");

serve(async (req) => {
  const { email } = await req.json();

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "http://localhost:54321";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  console.log("🔍 Searching for developer user...");

  const { data: users, error } = await supabase
    .from("auth.users")
    .select("*")
    .eq("email", email);

  if (error || !users || users.length === 0) {
    console.error("❌ User not found:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Developer user not found",
        details: error?.message || "No match in auth.users",
      }),
      { status: 404 }
    );
  }

  const user = users[0];

  console.log("✅ Developer user found:", user.id);

  const { data: session, error: sessionError } = await supabase.auth.admin.createSession({
    user_id: user.id,
  });

  if (sessionError || !session) {
    console.error("❌ Error creating session:", sessionError);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Session creation failed",
        details: sessionError?.message,
      }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      access_token: session.session.access_token,
      refresh_token: session.session.refresh_token,
      user: session.user,
    }),
    { status: 200 }
  );
});

