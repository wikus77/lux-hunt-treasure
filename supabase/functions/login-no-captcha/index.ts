
// NOTE: This is a modified version of the login-no-captcha function
// that accepts a captchaToken parameter but bypasses validation for debugging.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supporto per richieste OPTIONS (preflight)
const handleOptions = () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

serve(async (req) => {
  // Gestione delle richieste CORS preflight
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    // Valida le variabili d'ambiente obbligatorie
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Configurazione del server non valida: mancano URL o chiavi Supabase");
      return new Response(
        JSON.stringify({
          error: "Configurazione del server non valida: mancano URL o chiavi Supabase",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Estrai i dati dalla richiesta
    const { email, password } = await req.json();
    
    if (!email || !password) {
      console.error("Email e password sono obbligatorie");
      return new Response(
        JSON.stringify({ error: "Email e password sono obbligatorie" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Per debug: verifica se la richiesta è per l'admin
    const isAdminRequest = email === "wikus77@hotmail.it";
    if (!isAdminRequest) {
      console.error("Accesso negato per email non admin:", email);
      return new Response(
        JSON.stringify({ error: "Accesso non autorizzato" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Tentativo di login admin per:", email);

    // Client con ruolo admin per le operazioni privilegiate
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Login amministratore con credenziali (bypassando captcha)
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error("Errore login admin:", error);
      return new Response(
        JSON.stringify({ error: error?.message || "Login fallito" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verifica se esiste un profilo per l'utente e crealo se necessario
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profileData) {
      console.log("Profilo non trovato, creazione profilo admin...");
      
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: data.user.id,
          email: data.user.email,
          role: "admin",
          created_at: new Date().toISOString(),
        });
      
      if (insertError) {
        console.error("Errore creazione profilo:", insertError);
      } else {
        console.log("Profilo admin creato con successo");
      }
    } else {
      console.log("Profilo esistente trovato:", profileData.id);
      
      // Assicurarsi che il ruolo sia admin
      if (profileData.role !== "admin") {
        console.log("Aggiornamento ruolo a admin...");
        await supabaseAdmin
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", data.user.id);
      }
    }

    console.log("Login completato con successo, generazione token");

    // Preparazione della risposta con i token di sessione
    return new Response(
      JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        message: "Login riuscito con successo"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Errore server:", err);
    return new Response(
      JSON.stringify({
        error: "Errore interno del server",
        details: err.toString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
