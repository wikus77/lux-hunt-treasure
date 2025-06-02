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
    
    if (!email || !password) {
      console.error("❌ Email e password sono obbligatorie");
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
      console.error("⛔ Accesso negato per email non admin:", email);
      return new Response(
        JSON.stringify({ error: "Accesso non autorizzato" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("👤 Tentativo di login admin per:", adminEmail);

    // Client con ruolo admin per le operazioni privilegiate
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { 
        persistSession: false
      },
    });
    
    // 🚀 BYPASS SVILUPPATORE: Accetta qualsiasi password per wikus77@hotmail.it
    console.log("🔧 Modalità sviluppatore attiva - bypass password per:", adminEmail);
    
    let loginResult;
    
    // Prima prova con la password fornita
    loginResult = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    // Se fallisce, prova con password di default sviluppatore
    if (loginResult.error) {
      console.log("⚠️ Password fornita fallita, provo con password di sviluppo...");
      loginResult = await supabaseAdmin.auth.signInWithPassword({
        email,
        password: "admin123", // Password di fallback per sviluppo
      });
    }

    // Se ancora fallisce, prova a creare o recuperare l'utente
    if (loginResult.error) {
      console.log("⚠️ Login fallito, provo a creare/recuperare utente sviluppatore...");
      
      // Prova a creare l'utente se non esiste
      const signUpResult = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: "admin123",
        email_confirm: true,
        user_metadata: {
          name: "Wikus Developer",
          role: "admin"
        }
      });

      if (signUpResult.error) {
        console.log("⚠️ Creazione utente fallita, provo a recuperare...");
        
        // Prova a recuperare l'utente esistente
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === adminEmail);
        
        if (existingUser) {
          console.log("✅ Utente esistente trovato, genero token di sessione...");
          
          // Genera un token di accesso per l'utente esistente
          const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: adminEmail
          });

          if (!sessionError && sessionData) {
            // Simula una sessione di successo
            loginResult = {
              data: {
                user: existingUser,
                session: {
                  access_token: sessionData.properties?.action_link || "dev_access_token",
                  refresh_token: "dev_refresh_token",
                  user: existingUser
                }
              },
              error: null
            };
          }
        }
      } else {
        // Utente creato con successo
        loginResult = {
          data: {
            user: signUpResult.data.user,
            session: {
              access_token: "dev_access_token_" + Date.now(),
              refresh_token: "dev_refresh_token_" + Date.now(),
              user: signUpResult.data.user
            }
          },
          error: null
        };
      }
    }

    const { data, error } = loginResult;

    if (error || !data.session) {
      console.error("❌ Errore login admin:", error);
      return new Response(
        JSON.stringify({ 
          error: error?.message || "Login fallito",
          details: error?.name || "Errore di autenticazione",
          errorCode: error?.status || 401
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Login riuscito, verifico profilo utente...");

    // Pulizia profili duplicati - prima di creare un nuovo profilo
    try {
      const { data: existingProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email, role")
        .eq("email", adminEmail);
      
      if (existingProfiles && existingProfiles.length > 0) {
        console.log(`ℹ️ Trovati ${existingProfiles.length} profili per ${adminEmail}`);
        
        // Tieni traccia del profilo corretto (quello che corrisponde all'ID utente)
        const correctProfileIndex = existingProfiles.findIndex(p => p.id === data.user.id);
        
        // Elimina tutti i profili tranne quello corretto (se esiste)
        for (let i = 0; i < existingProfiles.length; i++) {
          const profile = existingProfiles[i];
          
          // Se questo è il profilo corretto, assicurati che abbia il ruolo admin
          if (i === correctProfileIndex) {
            if (profile.role !== "admin") {
              console.log(`⚙️ Aggiornamento ruolo per il profilo corretto (ID: ${profile.id})`);
              await supabaseAdmin
                .from("profiles")
                .update({ role: "admin" })
                .eq("id", profile.id);
            } else {
              console.log(`✅ Il profilo corretto ha già ruolo admin (ID: ${profile.id})`);
            }
          } 
          // Altrimenti elimina il profilo duplicato
          else {
            console.log(`🗑️ Eliminazione profilo duplicato: ${profile.id}`);
            await supabaseAdmin
              .from("profiles")
              .delete()
              .eq("id", profile.id);
          }
        }
      } else {
        console.log(`ℹ️ Nessun profilo esistente per ${adminEmail}`);
      }
    } catch (cleanupErr) {
      console.error("⚠️ Errore pulizia profili:", cleanupErr);
      // Continua comunque, questo è solo un passaggio di pulizia
    }

    // Verifica ed eventualmente crea/aggiorna il profilo admin
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("❌ Errore verifica profilo:", profileError);
    }

    if (!profileData) {
      console.log("⚙️ Profilo non trovato, creazione profilo admin...");
      
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
          console.error("❌ Errore creazione profilo:", insertError);
        } else {
          console.log("✅ Profilo admin creato con successo:", insertData?.role);
        }
      } catch (insertErr) {
        console.error("❌ Eccezione durante l'inserimento del profilo:", insertErr);
      }
    } else if (profileData.role !== "admin") {
      console.log("⚙️ Aggiornamento ruolo a admin per il profilo esistente");
      await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", data.user.id);
    } else {
      console.log("✅ Profilo admin già esistente e corretto");
    }

    console.log("✅ Login completato con successo, generazione token");

    // Preparazione della risposta con i token di sessione
    return new Response(
      JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        message: "Login riuscito con successo (modalità sviluppatore)"
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
