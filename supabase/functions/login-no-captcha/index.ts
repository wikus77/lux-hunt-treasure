
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const handleOptions = () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
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
    
    // Client con ruolo admin per verificare esistenza utente
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { 
        persistSession: false
      },
    });
    
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

    console.log("✅ Utente sviluppatore trovato, accesso immediato garantito");
    
    // Restituisce solo il flag di accesso sviluppatore
    return new Response(
      JSON.stringify({
        developer_access: true
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
