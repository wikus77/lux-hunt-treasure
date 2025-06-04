
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
    
    // ✅ FIX: Usa listUsers() invece di getUserByEmail()
    console.log("🔍 Ricerca utente sviluppatore tramite listUsers...");
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ Errore nel recupero utenti:", listError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch users" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Trova l'utente per email
    const userData = users?.users?.find(u => u.email === adminEmail);
    
    if (!userData) {
      console.error("❌ Utente sviluppatore non trovato");
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Utente sviluppatore trovato, generazione link di accesso diretto...");
    
    // ✅ FIX: Usa generateLink() che è supportato nel runtime Edge Functions
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: adminEmail,
      options: {
        redirectTo: `${supabaseUrl.replace('.supabase.co', '')}.vercel.app/home` // URL compatibile
      }
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("❌ Errore generazione link:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate access link" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Estrai token dalla action_link per creare sessione manuale
    const actionLink = linkData.properties.action_link;
    const urlParams = new URL(actionLink).searchParams;
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
      console.error("❌ Token non trovati nel link generato");
      return new Response(
        JSON.stringify({ error: "Failed to extract tokens" }),
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
        .eq("id", userData.id)
        .maybeSingle();

      if (!profileData) {
        console.log("⚙️ Creazione profilo admin automatico...");
        
        const { error: insertError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: userData.id,
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

    console.log("✅ Link di accesso diretto generato per sviluppatore");
    
    return new Response(
      JSON.stringify({
        session: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: userData
        },
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
