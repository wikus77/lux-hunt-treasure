
// NOTE: This is a modified version of the login-no-captcha function
// that accepts a captchaToken parameter but bypasses validation for debugging.
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

    // Per sicurezza: verifica se la richiesta è per l'admin
    const adminEmail = "wikus77@hotmail.it";
    if (email !== adminEmail) {
      console.error("Accesso negato per email non admin:", email);
      return new Response(
        JSON.stringify({ error: "Accesso non autorizzato" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Tentativo di login admin per:", adminEmail);

    // Client con ruolo admin per le operazioni privilegiate
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { 
        persistSession: false
      },
    });
    
    // Login amministratore con credenziali
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

    // Pulizia profili duplicati - prima di creare un nuovo profilo
    try {
      const { data: existingProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email, role")
        .eq("email", adminEmail);
      
      if (existingProfiles && existingProfiles.length > 0) {
        console.log(`Trovati ${existingProfiles.length} profili per ${adminEmail}`);
        
        // Tieni traccia del profilo corretto (quello che corrisponde all'ID utente)
        const correctProfileIndex = existingProfiles.findIndex(p => p.id === data.user.id);
        
        // Elimina tutti i profili tranne quello corretto (se esiste)
        for (let i = 0; i < existingProfiles.length; i++) {
          const profile = existingProfiles[i];
          
          // Se questo è il profilo corretto, assicurati che abbia il ruolo admin
          if (i === correctProfileIndex) {
            if (profile.role !== "admin") {
              console.log(`Aggiornamento ruolo per il profilo corretto (ID: ${profile.id})`);
              await supabaseAdmin
                .from("profiles")
                .update({ role: "admin" })
                .eq("id", profile.id);
            }
          } 
          // Altrimenti elimina il profilo duplicato
          else {
            console.log(`Eliminazione profilo duplicato: ${profile.id}`);
            await supabaseAdmin
              .from("profiles")
              .delete()
              .eq("id", profile.id);
          }
        }
      }
    } catch (cleanupErr) {
      console.error("Errore pulizia profili:", cleanupErr);
      // Continua comunque, questo è solo un passaggio di pulizia
    }

    // Verifica ed eventualmente crea/aggiorna il profilo admin
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Errore verifica profilo:", profileError);
    }

    if (!profileData) {
      console.log("Profilo non trovato, creazione profilo admin...");
      
      try {
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: data.user.id,
            email: adminEmail,
            role: "admin",
            full_name: "Amministratore",
            subscription_tier: "admin"
          })
          .select()
          .single();
        
        if (insertError) {
          console.error("Errore creazione profilo:", insertError);
        } else {
          console.log("Profilo admin creato con successo:", insertData);
        }
      } catch (insertErr) {
        console.error("Eccezione durante l'inserimento del profilo:", insertErr);
      }
    } else if (profileData.role !== "admin") {
      console.log("Aggiornamento ruolo a admin per il profilo esistente");
      await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", data.user.id);
    } else {
      console.log("Profilo admin già esistente e corretto");
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
