
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
    const { email, password } = await req.json();
    
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

    // DEVELOPER BYPASS COMPLETO: Per l'email sviluppatore, bypass totale
    const adminEmail = "wikus77@hotmail.it";
    if (email === adminEmail) {
      console.log("🔑 DEVELOPER BYPASS: Accesso automatico per:", adminEmail);
      
      // Client con ruolo admin per le operazioni privilegiate
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { 
          persistSession: false
        },
      });
      
      // BYPASS COMPLETO: Non controllare la password, accetta qualsiasi cosa
      console.log("🔓 BYPASS: Password ignorata per sviluppatore");
      
      // Ottieni o crea l'utente sviluppatore
      let userData;
      try {
        const { data } = await supabaseAdmin.auth.admin.getUserByEmail(email);
        userData = data;
      } catch (userError) {
        console.log("⚠️ Utente non trovato, tentativo di creazione automatica");
      }
      
      // Se l'utente non esiste, prova a crearlo
      if (!userData || !userData.user) {
        console.log("🔧 Creazione automatica utente sviluppatore");
        try {
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: "developer_auto_password", // Password automatica
            email_confirm: true, // Conferma email automaticamente
            user_metadata: {
              role: "admin",
              auto_created: true
            }
          });
          
          if (createError) {
            console.error("❌ Errore creazione utente:", createError);
          } else {
            userData = { user: newUser.user };
            console.log("✅ Utente sviluppatore creato automaticamente");
          }
        } catch (createErr) {
          console.error("❌ Eccezione durante creazione utente:", createErr);
        }
      }
      
      if (userData && userData.user) {
        // Genera un token di accesso per l'utente
        try {
          const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateAccessToken(userData.user.id);
          
          if (tokenError) {
            console.error("❌ Errore generazione token:", tokenError);
            throw tokenError;
          }
          
          if (tokenData) {
            console.log("✅ Token di accesso generato per sviluppatore");
            
            // Verifica e crea/aggiorna il profilo admin
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
              } else if (profileData.role !== "admin") {
                console.log("⚙️ Aggiornamento ruolo a admin...");
                await supabaseAdmin
                  .from("profiles")
                  .update({ role: "admin" })
                  .eq("id", userData.user.id);
              }
            } catch (profileErr) {
              console.error("⚠️ Errore gestione profilo:", profileErr);
            }

            // Preparazione della risposta con i token di sessione
            return new Response(
              JSON.stringify({
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token || "DEVELOPER_REFRESH_TOKEN",
                user: {
                  id: userData.user.id,
                  email: userData.user.email,
                },
                message: "Login sviluppatore automatico riuscito"
              }),
              {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        } catch (tokenErr) {
          console.error("❌ Errore nella generazione del token:", tokenErr);
        }
      }
      
      // Fallback: restituisci un errore ma informa che è stato tentato il bypass
      console.error("❌ Impossibile completare il bypass sviluppatore");
      return new Response(
        JSON.stringify({ 
          error: "Bypass sviluppatore fallito",
          bypass_attempted: true
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Per tutte le altre email, accesso negato
    console.error("⛔ Accesso negato per email non admin:", email);
    return new Response(
      JSON.stringify({ error: "Accesso non autorizzato" }),
      {
        status: 403,
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
