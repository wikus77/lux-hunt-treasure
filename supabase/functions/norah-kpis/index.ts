// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CORS_ORIGIN = Deno.env.get("CORS_ALLOWED_ORIGIN") || "*";

const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin || CORS_ORIGIN,
  "Vary": "Origin",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
});

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors(origin) });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: cors(origin),
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Get KPIs from view
    const { data: kpis, error: kpisError } = await supabase
      .from("ai_docs_kpis")
      .select("*")
      .single();

    if (kpisError) throw kpisError;

    return new Response(JSON.stringify({ ...kpis, avgScore: null }), {
      headers: cors(origin),
    });
  } catch (e: any) {
    console.error("KPIs error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: cors(origin),
    });
  }
});
