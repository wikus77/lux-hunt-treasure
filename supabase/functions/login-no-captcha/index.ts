
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
      console.error("❌ Configurazione del server non valida: mancano URL o chiavi Supabase");
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
    const { email } = await req.json();
    
    if (!email) {
      console.error("❌ Email obbligatoria");
      return new Response(
        JSON.stringify({ error: "Email obbligatoria" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // BYPASS COMPLETO: Solo per l'email sviluppatore
    const adminEmail = "wikus77@hotmail.it";
    if (email !== adminEmail) {
      console.error("⛔ Accesso negato per email non admin:", email);
      return new Response(
        JSON.stringify({ error: "CAPTCHA required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🔑 DEVELOPER BYPASS: Accesso diretto per:", adminEmail);
    
    // Client con ruolo admin per le operazioni privilegiate
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { 
        persistSession: false
      },
    });
    
    // Ottieni l'utente per email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(adminEmail);
    
    if (userError || !userData?.user) {
      console.error("❌ Utente non trovato:", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Utente sviluppatore trovato, creazione sessione diretta...");
    
    // Crea sessione diretta per l'utente
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: userData.user.id,
    });

    if (sessionError || !sessionData?.session) {
      console.error("❌ Errore creazione sessione:", sessionError);
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Crea profilo admin se necessario
    try {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, role")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!profileData) {
        console.log("⚙️ Creazione profilo admin automatico...");
        
        const { error: insertError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: userData.user.id,
            email: adminEmail,
            role: "admin",
            full_name: "Amministratore",
            subscription_tier: "admin"
          });
      
        if (insertError) {
          console.error("❌ Errore creazione profilo:", insertError);
        } else {
          console.log("✅ Profilo admin creato automaticamente");
        }
      }
    } catch (profileErr) {
      console.error("⚠️ Errore gestione profilo:", profileErr);
    }

    console.log("✅ Sessione diretta creata per sviluppatore");
    
    return new Response(
      JSON.stringify({
        session: sessionData.session,
        developer_bypass: true,
        direct_session: true
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    console.error("❌ Errore server:", err);
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
