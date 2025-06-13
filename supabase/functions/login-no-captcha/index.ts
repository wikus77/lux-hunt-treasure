
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { email } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "http://localhost:54321",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Chiamata corretta alla funzione RPC
    const { data: userList, error: fetchError } = await supabase.rpc("get_user_by_email", {
      email_input: email,
    });

    if (fetchError) {
      console.error("RPC Error:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "RPC call failed", details: fetchError }),
        { status: 500 }
      );
    }

    if (!userList || userList.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Developer user not found" }),
        { status: 404 }
      );
    }

    const user = userList[0];

    const { data: session, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: user.id,
    });

    if (sessionError || !session) {
      console.error("Session Error:", sessionError);
      return new Response(
        JSON.stringify({ success: false, error: "Session creation failed", details: sessionError }),
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
  } catch (error) {
    console.error("Function Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error", details: error.message }),
      { status: 500 }
    );
  }
});
