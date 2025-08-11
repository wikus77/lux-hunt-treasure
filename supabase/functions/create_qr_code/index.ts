import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Admin client (service role)
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
function bad(message: string, status = 400) {
  return json({ error: { message } }, status);
}

function shortId(n = 8) {
  const s = crypto.randomUUID().replace(/-/g, "");
  return s.slice(0, n).toUpperCase();
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return bad("Method not allowed", 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return bad("Non autenticato", 401);

    // Create a user-aware client by forwarding the JWT
    const supabaseUser = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate user session
    const { data: userRes, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userRes?.user) return bad("Sessione non valida", 401);
    const userId = userRes.user.id;

    // Optional: ensure admin-only access
    const { data: prof, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (profErr) return bad(`Errore profilo: ${profErr.message}`, 500);
    if (!prof || prof.role !== "admin") return bad("Accesso negato", 403);

    const payload = await req.json();
    const {
      desiredCode,
      title,
      reward_type,
      lat,
      lng,
      message = null,
      expires_at = null,
    } = payload || {};

    // Validation
    if (!reward_type || !["buzz_credit", "custom"].includes(reward_type)) {
      return bad("reward_type non valido (buzz_credit|custom)");
    }
    if (typeof lat !== "number" || lat < -90 || lat > 90) return bad("Latitudine non valida");
    if (typeof lng !== "number" || lng < -180 || lng > 180) return bad("Longitudine non valida");
    if (message && String(message).length > 2000) return bad("Message troppo lungo (max 2000)");

    const finalTitle = (title && String(title).trim()) || "QR Manuale";

    // Generate unique code, try desired first
    let finalCode = (desiredCode && String(desiredCode).trim()) || `M1-${shortId(8)}`;
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing, error: selErr } = await supabaseAdmin
        .from("qr_codes")
        .select("code")
        .eq("code", finalCode)
        .maybeSingle();
      if (selErr) return bad(`Errore verifica codice: ${selErr.message}`, 500);
      if (!existing) break;
      finalCode = `M1-${shortId(8)}`;
      attempts++;
    }

    const row = {
      code: finalCode,
      title: finalTitle,
      reward_type,
      lat,
      lng,
      message,
      status: "ACTIVE",
      is_active: true,
      is_hidden: false,
      expires_at,
    } as const;

    // Try insert; on conflict regenerate code a couple of times
    let created: any = null;
    for (let i = 0; i < 3; i++) {
      const { data, error } = await supabaseAdmin
        .from("qr_codes")
        .insert(row)
        .select()
        .single();
      if (!error) {
        created = data;
        break;
      }
      // If conflict, rotate code and retry
      if ((error as any)?.code === "23505") {
        row.code = `M1-${shortId(8)}` as any;
        continue;
      }
      return bad(`Errore inserimento: ${error.message}`, 500);
    }

    if (!created) return bad("Impossibile creare il QR code", 500);

    return json(created, 200);
  } catch (e: any) {
    console.error("create_qr_code error:", e);
    return bad(e?.message || "Errore interno", 500);
  }
});
