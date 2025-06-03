
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log("SUPABASE_URL:", SUPABASE_URL);
    console.log("SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "PRESENTE" : "MANCANTE");

    const body = await req.json()
    const email = body.email
    const redirectTo = body.redirect_to || 'capacitor://localhost/home'

    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo }
    });

    console.log("🧠 Risultato generateLink:", { data, error });

    const actionLink = data?.properties?.action_link;

    if (!actionLink) {
      console.log("❌ Errore generazione link: Link assente");
      return new Response(JSON.stringify({
        error: "Errore generazione link"
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      message: "Magic link generato per sviluppatore",
      token: actionLink
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("🧨 Errore imprevisto:", err);
    return new Response(JSON.stringify({
      error: "Errore interno"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
})
