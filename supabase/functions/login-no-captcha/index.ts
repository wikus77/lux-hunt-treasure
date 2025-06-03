
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  try {
    const requestJson = await req.json();
    const email = requestJson.email;
    const redirectTo = requestJson.redirect_to || 'capacitor://localhost/home';
    const adminEmail = "wikus77@hotmail.it";

    if (email !== adminEmail) {
      return new Response(JSON.stringify({ error: "Accesso non autorizzato" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("🔧 Modalità sviluppatore - login per:", adminEmail);
    console.log("🔗 Usando redirect URL:", redirectTo);

    // Generate magic link with dynamic redirect
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo
      }
    });

    if (error) {
      console.error("❌ Errore generazione magic link:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("✅ Magic link generato con successo:", data.properties?.action_link);

    return new Response(JSON.stringify({
      message: "Magic link generato per sviluppatore",
      token: data.properties?.action_link
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ Errore server:", err);
    return new Response(JSON.stringify({
      error: "Errore interno del server",
      details: err.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
