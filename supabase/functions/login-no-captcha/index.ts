
// supabase/functions/login-no-captcha/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { email } = await req.json();

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "http://localhost:54321";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: users, error } = await supabase
    .from("auth.users")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (error || !users || users.length === 0) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Developer user not found",
        details: error?.message || "auth.users empty or inaccessible",
      }),
      { status: 404 }
    );
  }

  const userId = users[0].id;

  const { data: session, error: sessionError } = await supabase.auth.admin.createSession({
    user_id: userId,
  });

  if (sessionError || !session) {
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

