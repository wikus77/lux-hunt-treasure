
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { email } = await req.json();

  const supabase = createClient(
    "http://localhost:54321",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: users, error } = await supabase.rpc("get_user_by_email", { email_param: email });

  if (error || !users?.length) {
    return new Response(JSON.stringify({
      success: false,
      error: "Developer user not found",
      details: error?.message
    }), { status: 404 });
  }

  const { data: session, error: sessionError } = await supabase.auth.admin.createSession({
    user_id: users[0].id,
  });

  if (sessionError || !session) {
    return new Response(JSON.stringify({
      success: false,
      error: "Session creation failed",
      details: sessionError?.message
    }), { status: 500 });
  }

  return new Response(JSON.stringify({
    success: true,
    access_token: session.session.access_token,
    refresh_token: session.session.refresh_token,
    user: session.user
  }), { status: 200 });
});
