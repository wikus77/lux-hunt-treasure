// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CORS_ORIGIN = Deno.env.get("CORS_ALLOWED_ORIGIN") || "*";

const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin || CORS_ORIGIN,
  "Vary": "Origin",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
});

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors(origin) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: cors(origin),
    });
  }

  try {
    const { sources = "content-ai", docs = [] } = await req.json().catch(() => ({}));
    
    if (!Array.isArray(docs) || docs.length === 0) {
      return new Response(JSON.stringify({ error: "No documents provided" }), {
        status: 400,
        headers: cors(origin),
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    let inserted = 0;

    for (const doc of docs) {
      if (!doc.title || !doc.text) continue;
      
      const { data, error } = await supabase.rpc("upsert_ai_doc", {
        p_title: doc.title,
        p_text: doc.text,
        p_tags: doc.tags || [],
        p_source: doc.source || sources,
        p_url: doc.url || null,
      });

      if (!error && data) inserted++;
    }

    return new Response(JSON.stringify({ ok: true, inserted }), {
      headers: cors(origin),
    });
  } catch (e: any) {
    console.error("Ingest error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: cors(origin),
    });
  }
});
