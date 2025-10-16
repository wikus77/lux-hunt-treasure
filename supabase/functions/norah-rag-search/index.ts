// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// === Env ===
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

// === Cloudflare Workers AI embeddings (768d) ===
const CF_ACCOUNT = Deno.env.get("CLOUDFLARE_ACCOUNT_ID") || "";
const CF_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN") || "";
const CF_EMBED_MODEL = Deno.env.get("CF_EMBEDDING_MODEL") || "@cf/baai/bge-base-en-v1.5";

async function cfEmbed(text: string): Promise<number[]> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/${CF_EMBED_MODEL}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${CF_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudflare embeddings failed: ${res.status} ${err}`);
  }
  const json = await res.json();
  // Either { result: { data: [[...]] } } or { data: [[...]] }
  let e: any = (json?.result?.data ?? json?.data);
  if (Array.isArray(e) && Array.isArray(e[0])) e = e[0];
  return Array.isArray(e) ? e.map((n: any) => Number(n)) : [];
}

type Req = { query: string; top_k?: number; locale?: string };

Deno.serve(async (req) => {
  try {
    // CORS preflight
    // CORS headers (shared across all responses)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const { query, top_k = 3, locale = "it" } = (await req.json()) as Req;
    if (!query) return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });

    // 1) Embedding (768d)
    const embedding = await cfEmbed(query);
    if (!Array.isArray(embedding) || embedding.length !== 768) {
      throw new Error(`Bad embedding length: ${embedding?.length ?? 'null'} (expected 768)`);
    }

    // 2) Vector search via RPC (function: public.ai_rag_search_vec(double precision[], integer, text))
    const { data, error } = await supabaseAdmin.rpc("ai_rag_search_vec", {
      query_embedding: embedding,
      match_count: top_k,
      in_locale: locale,
    });
    if (error) throw new Error(`ai_rag_search_vec failed: ${error.message}`);

    // 3) Log best-effort
    try {
      await supabaseAdmin.from("norah_events").insert([
        { event_type: "rag_query", payload: { q: query, locale, top_k, hits: data } },
      ]);
    } catch (_) { /* no-op */ }

    return new Response(JSON.stringify({ rag_used: true, hits: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("norah-rag-search error:", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
