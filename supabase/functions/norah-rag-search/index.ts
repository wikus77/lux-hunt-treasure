import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { embed } from "../_shared/embedProvider.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

type Req = { query: string; top_k?: number; locale?: string };

serve(async (req) => {
  try {
    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      });
    }

    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const { query, top_k = 3, locale = "it" } = (await req.json()) as Req;
    if (!query) return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });

    // 1) Embedding query
    const { vectors } = await embed([query]);
    const qVec = vectors[0];

    // 2) Vector search
    const { data, error } = await supabaseAdmin.rpc("ai_rag_search_vec", {
      query_embedding: qVec,
      match_count: top_k,
      in_locale: locale,
    });
    if (error) throw new Error(`ai_rag_search_vec failed: ${error.message}`);

    // 3) Log evento (best-effort)
    try {
      const { error: evErr } = await supabaseAdmin
        .from("norah_events")
        .insert([{ event_type: "rag_query", payload: { q: query, locale, top_k, hits: data } }]);
      if (evErr) console.warn("norah_events insert error:", evErr.message || evErr);
    } catch (_) { /* no-op */ }

    return new Response(JSON.stringify({ rag_used: true, hits: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
