
// NOTE: This is a modified version of the login-no-captcha function
// that completely bypasses all CAPTCHA validation for the developer email
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

    // BYPASS COMPLETO: Per l'email sviluppatore, bypass totale di CAPTCHA e password
    const adminEmail = "wikus77@hotmail.it";
    if (email === adminEmail) {
      console.log("🔑 DEVELOPER BYPASS: Accesso automatico per:", adminEmail);
      console.log("🚫 CAPTCHA E PASSWORD COMPLETAMENTE DISATTIVATI per sviluppatore");
      
      // Client con ruolo admin per le operazioni privilegiate
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { 
          persistSession: false
        },
      });
      
      // Verifica se l'utente esiste già
      try {
        // ✅ FIX: Usa il metodo corretto per verificare utente esistente
        const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        let existingUser = null;
        if (usersList?.users) {
          existingUser = usersList.users.find(user => user.email === adminEmail);
        }
        
        if (existingUser) {
          // ✅ Utente già esiste → Genera magic link per login automatico
          console.log("✅ Utente sviluppatore già registrato - bypass CAPTCHA attivo");
          
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: adminEmail,
          });
          
          if (linkError) {
            console.error("❌ Errore generazione magic link:", linkError);
            return new Response(
              JSON.stringify({ error: "Errore generazione magic link", detail: linkError.message }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          
          console.log("✅ Login automatico sviluppatore eseguito correttamente");
          return new Response(
            JSON.stringify({
              message: "Login sviluppatore effettuato",
              action_link: linkData.action_link,
              captcha_bypassed: true,
              developer_bypass: true
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } else {
          // 👇 Solo se non esiste, crearlo
          console.log("🔧 Creazione automatica utente sviluppatore");
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: "developer_auto_password",
            email_confirm: true,
            user_metadata: {
              role: "admin",
              auto_created: true,
              captcha_bypass: true
            }
          });
          
          if (createError) {
            console.error("❌ Errore creazione utente:", createError);
            return new Response(
              JSON.stringify({ error: "Errore creazione utente", detail: createError.message }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          
          // Genera magic link per il nuovo utente
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: adminEmail,
          });
          
          if (linkError) {
            console.error("❌ Errore generazione magic link per nuovo utente:", linkError);
            return new Response(
              JSON.stringify({ error: "Errore generazione magic link", detail: linkError.message }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          
          console.log("✅ Utente sviluppatore creato automaticamente");
          console.log("✅ Login automatico sviluppatore eseguito correttamente");
          
          // Crea profilo admin se necessario
          try {
            const { data: profileData, error: profileError } = await supabaseAdmin
              .from("profiles")
              .select("id, role")
              .eq("id", newUser.user.id)
              .maybeSingle();

            if (!profileData) {
              console.log("⚙️ Creazione profilo admin automatico...");
              
              const { error: insertError } = await supabaseAdmin
                .from("profiles")
                .insert({
                  id: newUser.user.id,
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

          return new Response(
            JSON.stringify({
              message: "Login sviluppatore effettuato",
              action_link: linkData.action_link,
              captcha_bypassed: true,
              developer_bypass: true,
              user_created: true
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
      } catch (userError) {
        console.error("❌ Errore imprevisto:", userError);
        return new Response(
          JSON.stringify({ 
            error: "Errore imprevisto durante gestione utente sviluppatore",
            detail: userError.toString()
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Per tutte le altre email, accesso negato (CAPTCHA rimane attivo per altri utenti)
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
