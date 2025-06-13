
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Avvia il server Edge Function
serve(async (req) => {
  const { email } = await req.json();

  const supabase = createClient(
    "http://localhost:54321",
    // ✅ service_role da variabile d’ambiente (richiede .env funzionante o secrets impostato)
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // ✅ Chiamata RPC alla funzione corretta con parametro email_input
  const { data: userList, error: fetchError } = await supabase.rpc("get_user_by_email", {
    email_input: email,
  });

  if (fetchError || !userList || userList.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: "Developer user not found", details: fetchError }),
      { status: 404 }
    );
  }

  const user = userList[0];

  const { data: session, error: sessionError } = await supabase.auth.admin.createSession({
    user_id: user.id,
  });

  if (sessionError || !session) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Session creation failed",
        details: sessionError.message,
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
