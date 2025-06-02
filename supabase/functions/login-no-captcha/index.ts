
// login-no-captcha (modalità sviluppatore, accesso libero per email autorizzata)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { email } = await req.json();
    const adminEmail = "wikus77@hotmail.it";

    if (email !== adminEmail) {
      return new Response(JSON.stringify({ error: "Accesso non autorizzato" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("🔧 Modalità sviluppatore - login per:", adminEmail);

    // Tenta login con password fittizia (dev)
    let login = await supabase.auth.signInWithPassword({
      email,
      password: "admin123"
    });

    if (login.error) {
      console.log("⚠️ Login fallito, creazione utente sviluppatore...");
      // Crea utente se non esiste
      const result = await supabase.auth.admin.createUser({
        email,
        password: "admin123",
        email_confirm: true,
        user_metadata: { role: "admin", name: "Dev Admin" }
      });

      if (!result.error) {
        login = {
          data: {
            user: result.data.user,
            session: {
              access_token: "dev_access_token_" + Date.now(),
              refresh_token: "dev_refresh_token_" + Date.now(),
              user: result.data.user
            }
          },
          error: null
        };
        console.log("✅ Utente sviluppatore creato con successo");
      } else {
        console.error("❌ Creazione utente fallita:", result.error);
        return new Response(JSON.stringify({ error: "Creazione utente fallita" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } else {
      console.log("✅ Login esistente riuscito");
    }

    const { data } = login;

    // Aggiorna o crea profilo admin
    console.log("⚙️ Aggiornamento profilo admin...");
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      role: "admin",
      full_name: "Amministratore",
      subscription_tier: "admin"
    }, { onConflict: "id" });

    console.log("✅ Login completato in modalità sviluppatore");

    return new Response(JSON.stringify({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email
      },
      message: "Login riuscito in modalità sviluppatore"
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
